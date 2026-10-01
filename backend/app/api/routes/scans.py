
import csv
import io
from typing import Optional, List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query,
    Response,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Scan, ScanFinding, ScanSource, User, AuditEvent
from app.schemas.schemas import (
    URLScanRequest,
    URLScanResponse,
    FindingResponse,
    SourceResponse,
    ScanListItem,
)
from app.services.url_scanner import URLAnalysisEngine
from app.services.ai_explainer import generate_ai_explanation
from app.services.report_generator import generate_pdf_report
from app.api.deps import get_current_user, get_optional_current_user


router = APIRouter(prefix="/scans", tags=["URL Scans"])


@router.post("", response_model=URLScanResponse)
def create_scan(
    payload: URLScanRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Perform a URL security assessment.
    Save the scan to the authenticated user's history when logged in.
    """
    try:
        engine = URLAnalysisEngine(payload.url)
        result = engine.run()
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        # Avoid exposing internal exception details to API clients.
        # Record detailed exceptions in server logs in production.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The URL analysis could not be completed. Please try again.",
        ) from exc

    # Generate AI / expert threat briefing.
    ai_analysis = generate_ai_explanation(result)
    result["ai_analysis"] = ai_analysis

    # Save the scan.
    scan_record = Scan(
        user_id=current_user.id if current_user else None,
        url=result["url"],
        normalized_url=result["normalized_url"],
        hostname=result["hostname"],
        scheme=result["scheme"],
        risk_score=result["risk_score"],
        severity_level=result["severity_level"],
        is_ip_host=result["is_ip_host"],
        has_punycode=result["has_punycode"],
        entropy=result["entropy"],
        threat_intel_matched=result["threat_intel_matched"],
        summary=result["summary"],
        ai_analysis=ai_analysis,
        created_at=result["created_at"],
    )
    db.add(scan_record)
    db.commit()
    db.refresh(scan_record)

    # Save findings.
    findings_objs = []
    for finding_data in result["findings"]:
        finding = ScanFinding(
            scan_id=scan_record.id,
            indicator_key=finding_data["indicator_key"],
            title=finding_data["title"],
            category=finding_data["category"],
            severity=finding_data["severity"],
            score_impact=finding_data["score_impact"],
            evidence=finding_data["evidence"],
            explanation=finding_data["explanation"],
            recommendation=finding_data["recommendation"],
        )
        db.add(finding)
        findings_objs.append(finding)

    # Save threat-intelligence sources.
    sources_objs = []
    for source_data in result["sources"]:
        source = ScanSource(
            scan_id=scan_record.id,
            source_name=source_data["source_name"],
            confidence=source_data["confidence"],
            verdict=source_data["verdict"],
            details=source_data.get("details"),
            last_updated=source_data["last_updated"],
        )
        db.add(source)
        sources_objs.append(source)

    # Record an audit event for authenticated scans.
    if current_user:
        audit = AuditEvent(
            user_id=current_user.id,
            event_type="scan_created",
            details=(
                f"Scanned {result['hostname']} "
                f"(Score: {result['risk_score']})"
            ),
        )
        db.add(audit)

    db.commit()

    return URLScanResponse(
        id=scan_record.id,
        url=scan_record.url,
        normalized_url=scan_record.normalized_url,
        hostname=scan_record.hostname,
        scheme=scan_record.scheme,
        risk_score=scan_record.risk_score,
        severity_level=scan_record.severity_level,
        is_ip_host=scan_record.is_ip_host,
        has_punycode=scan_record.has_punycode,
        entropy=scan_record.entropy,
        threat_intel_matched=scan_record.threat_intel_matched,
        summary=scan_record.summary,
        ai_analysis=scan_record.ai_analysis,
        created_at=scan_record.created_at,
        findings=[
            FindingResponse.model_validate(item)
            for item in findings_objs
        ],
        sources=[
            SourceResponse.model_validate(item)
            for item in sources_objs
        ],
        recommendations=result["recommendations"],
        limitations_disclaimer=result["limitations_disclaimer"],
    )


@router.get("", response_model=List[ScanListItem])
def list_user_scans(
    q: Optional[str] = Query(
        None, description="Search term for URL or hostname"
    ),
    severity: Optional[str] = Query(
        None, description="Filter by severity level"
    ),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve scan history belonging only to the authenticated user."""
    query = db.query(Scan).filter(Scan.user_id == current_user.id)

    if q:
        query = query.filter(
            (Scan.url.ilike(f"%{q}%"))
            | (Scan.hostname.ilike(f"%{q}%"))
        )

    if severity:
        query = query.filter(Scan.severity_level == severity)

    scans = (
        query.order_by(Scan.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        ScanListItem(
            id=scan.id,
            url=scan.url,
            hostname=scan.hostname,
            risk_score=scan.risk_score,
            severity_level=scan.severity_level,
            created_at=scan.created_at,
            findings_count=len(scan.findings),
        )
        for scan in scans
    ]


# IMPORTANT: Keep the static CSV route before /{scan_id}.
@router.get("/export/csv")
def export_user_scans_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export only the authenticated user's scan history as CSV."""
    scans = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(
        [
            "ID",
            "Timestamp (UTC)",
            "Hostname",
            "URL",
            "Risk Score",
            "Severity",
            "Findings Count",
            "Threat Intel Matched",
        ]
    )

    for scan in scans:
        writer.writerow(
            [
                scan.id,
                scan.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                scan.hostname,
                scan.url,
                scan.risk_score,
                scan.severity_level,
                len(scan.findings),
                scan.threat_intel_matched,
            ]
        )

    output.seek(0)

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": (
                'attachment; filename="drishti_scan_history.csv"'
            )
        },
    )


@router.get("/{scan_id}", response_model=URLScanResponse)
def get_scan_detail(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve scan details with ownership enforcement."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found.",
        )

    if scan.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized access to this scan record.",
        )

    recommendations = [
        finding.recommendation
        for finding in scan.findings
        if finding.recommendation
    ]

    disclaimer = (
        "Assessment Notice: This score is a defensive heuristic "
        "evaluation based on structural, lexical, and threat-intelligence "
        "indicators. It represents observed risk characteristics, not "
        "definitive proof that a website is benign or malicious. "
        "Always exercise vigilance."
    )

    return URLScanResponse(
        id=scan.id,
        url=scan.url,
        normalized_url=scan.normalized_url,
        hostname=scan.hostname,
        scheme=scan.scheme,
        risk_score=scan.risk_score,
        severity_level=scan.severity_level,
        is_ip_host=scan.is_ip_host,
        has_punycode=scan.has_punycode,
        entropy=scan.entropy,
        threat_intel_matched=scan.threat_intel_matched,
        summary=scan.summary,
        ai_analysis=scan.ai_analysis,
        created_at=scan.created_at,
        findings=[
            FindingResponse.model_validate(item)
            for item in scan.findings
        ],
        sources=[
            SourceResponse.model_validate(item)
            for item in scan.sources
        ],
        recommendations=(
            list(set(recommendations))
            if recommendations
            else ["Continue exercising safe browsing precautions."]
        ),
        limitations_disclaimer=disclaimer,
    )


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a scan only when it belongs to the authenticated user."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found.",
        )

    if scan.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized to delete this scan.",
        )

    db.delete(scan)
    db.commit()
    return None


@router.get("/{scan_id}/report.pdf")
def download_pdf_report(
    scan_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Download a PDF report, enforcing ownership for private scans."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found.",
        )

    # Guest-created scans are public; authenticated users' scans are private.
    if scan.user_id is not None and (
        current_user is None or scan.user_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized to access this report.",
        )

    recommendations = list(
        {
            finding.recommendation
            for finding in scan.findings
            if finding.recommendation
        }
    )

    scan_dict = {
        "id": scan.id,
        "url": scan.url,
        "hostname": scan.hostname,
        "scheme": scan.scheme,
        "risk_score": scan.risk_score,
        "severity_level": scan.severity_level,
        "entropy": scan.entropy,
        "summary": scan.summary,
        "created_at": scan.created_at,
        "findings": [
            {
                "title": finding.title,
                "category": finding.category,
                "severity": finding.severity,
                "score_impact": finding.score_impact,
                "evidence": finding.evidence,
                "explanation": finding.explanation,
                "recommendation": finding.recommendation,
            }
            for finding in scan.findings
        ],
        "recommendations": recommendations,
    }

    pdf_buffer = generate_pdf_report(scan_dict)

    # Restrict the hostname characters used in the download filename.
    safe_hostname = "".join(
        char if char.isalnum() or char in ".-_" else "_"
        for char in scan.hostname
    )[:200]

    filename = f"Drishti_Security_Report_{safe_hostname}_{scan.id}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )