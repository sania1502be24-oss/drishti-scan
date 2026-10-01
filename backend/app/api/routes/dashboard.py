from datetime import datetime, timedelta, timezone
from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import Scan, ScanFinding, User, LearningModule, UserProgress, QuizAttempt
from app.schemas.schemas import (
    DashboardStats, RiskDistribution, IndicatorFrequency, DailyTrendItem, ScanListItem
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_user_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aggregate comprehensive security metrics strictly for the authenticated user."""
    user_scans = db.query(Scan).filter(Scan.user_id == current_user.id).order_by(Scan.created_at.desc()).all()
    total_scans = len(user_scans)

    if total_scans > 0:
        avg_score = round(sum(s.risk_score for s in user_scans) / total_scans, 1)
    else:
        avg_score = 0.0

    # Risk distribution
    dist = RiskDistribution()
    for s in user_scans:
        sev = s.severity_level.lower()
        if "very high" in sev or "critical" in sev:
            dist.critical += 1
        elif "high" in sev:
            dist.high += 1
        elif "caution" in sev:
            dist.caution += 1
        else:
            dist.low += 1

    # Indicator frequency
    finding_titles = (
        db.query(ScanFinding.title)
        .join(Scan, ScanFinding.scan_id == Scan.id)
        .filter(Scan.user_id == current_user.id)
        .all()
    )
    counter = Counter(t[0] for t in finding_titles)
    indicator_freq = [IndicatorFrequency(name=name, count=cnt) for name, cnt in counter.most_common(5)]

    # Daily trends (last 7 days)
    today = datetime.now(timezone.utc).date()
    days_map = {}
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        days_map[d.strftime("%Y-%m-%d")] = {"count": 0, "total_score": 0}

    for s in user_scans:
        d_str = s.created_at.strftime("%Y-%m-%d")
        if d_str in days_map:
            days_map[d_str]["count"] += 1
            days_map[d_str]["total_score"] += s.risk_score

    daily_trends = []
    for d_str, data in days_map.items():
        c = data["count"]
        avg = round(data["total_score"] / c, 1) if c > 0 else 0.0
        daily_trends.append(DailyTrendItem(date=d_str, count=c, avg_score=avg))

    # Recent scans (up to 5)
    recent = []
    for s in user_scans[:5]:
        recent.append(ScanListItem(
            id=s.id,
            url=s.url,
            hostname=s.hostname,
            risk_score=s.risk_score,
            severity_level=s.severity_level,
            created_at=s.created_at,
            findings_count=len(s.findings)
        ))

    # Academy stats
    total_modules = db.query(LearningModule).count()
    completed_modules = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == current_user.id, UserProgress.status == "completed")
        .count()
    )
    quizzes_passed = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.user_id == current_user.id, QuizAttempt.passed == True)
        .count()
    )

    academy_percent = round((completed_modules / total_modules * 100), 1) if total_modules > 0 else 0.0

    return DashboardStats(
        total_scans=total_scans,
        avg_risk_score=avg_score,
        risk_distribution=dist,
        indicator_frequency=indicator_freq,
        daily_trends=daily_trends,
        recent_scans=recent,
        academy_progress_percent=academy_percent,
        quizzes_passed=quizzes_passed,
        total_modules=total_modules
    )
