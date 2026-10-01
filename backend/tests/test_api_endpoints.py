import pytest
import csv
import io
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.models.models import User, Scan

from app.services.academy_content import seed_learning_modules

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_learning_modules(db)
    finally:
        db.close()
    yield

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

import uuid

def test_auth_workflow_and_isolation():
    u_suffix = uuid.uuid4().hex[:8]
    email1 = f"user1_{u_suffix}@example.com"
    email2 = f"user2_{u_suffix}@example.com"

    # 1. Register User 1
    u1_res = client.post("/api/auth/register", json={
        "email": email1,
        "password": "Password123!",
        "full_name": "Agent User 1"
    })
    assert u1_res.status_code == 200
    u1_data = u1_res.json()
    u1_token = u1_data["access_token"]
    u1_headers = {"Authorization": f"Bearer {u1_token}"}

    # 2. Register User 2
    u2_res = client.post("/api/auth/register", json={
        "email": email2,
        "password": "Password456!",
        "full_name": "Agent User 2"
    })
    assert u2_res.status_code == 200
    u2_data = u2_res.json()
    u2_token = u2_data["access_token"]
    u2_headers = {"Authorization": f"Bearer {u2_token}"}

    # 3. User 1 performs a scan
    scan_res = client.post(
        "/api/scans",
        json={"url": "https://paypal-verify-billing.xyz/account"},
        headers=u1_headers
    )
    assert scan_res.status_code == 200
    scan_data = scan_res.json()
    scan_id = scan_data["id"]
    assert scan_id is not None
    assert scan_data["risk_score"] > 50

    # 4. User 1 can view the scan
    u1_get = client.get(f"/api/scans/{scan_id}", headers=u1_headers)
    assert u1_get.status_code == 200

    # 5. User 2 tries to access User 1's scan -> MUST BE REJECTED (403 Forbidden)
    u2_get = client.get(f"/api/scans/{scan_id}", headers=u2_headers)
    assert u2_get.status_code == 403

    # 6. User 2 tries to delete/view User 1's scan report -> MUST BE REJECTED (403 Forbidden)
    u2_del = client.get(f"/api/scans/{scan_id}/report.pdf", headers=u2_headers)
    assert u2_del.status_code == 403

    # 7. User 1 can download the PDF report
    pdf_res = client.get(f"/api/scans/{scan_id}/report.pdf", headers=u1_headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000

    # 8. User 1 dashboard stats reflects the scan
    dash_res = client.get("/api/dashboard/stats", headers=u1_headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_scans"] >= 1
    assert dash_data["avg_risk_score"] > 0

def test_academy_modules_and_quiz_submission():
    u_suffix = uuid.uuid4().hex[:8]
    email = f"student_{u_suffix}@example.com"

    # Register test user
    reg = client.post("/api/auth/register", json={
        "email": email,
        "password": "Password789!",
        "full_name": "Cyber Student"
    })
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch modules
    mods_res = client.get("/api/academy/modules", headers=headers)
    assert mods_res.status_code == 200
    modules = mods_res.json()
    assert len(modules) >= 3

    target_mod = modules[0]
    mod_id = target_mod["id"]

    # Fetch module detail
    detail_res = client.get(f"/api/academy/modules/{mod_id}", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    questions = detail["questions"]
    assert len(questions) > 0

    # Submit quiz answers
    answers = {}
    for q in questions:
        answers[q["id"]] = 1  # Provide test answer

    sub_res = client.post("/api/academy/quiz/submit", json={
        "module_id": mod_id,
        "answers": answers
    }, headers=headers)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert "score" in sub_data
    assert "passed" in sub_data
    assert len(sub_data["review"]) == len(questions)

def test_csv_export_contains_only_authenticated_users_scans():
    suffix = uuid.uuid4().hex[:8]

    # Register two independent users.
    user1_response = client.post(
        "/api/auth/register",
        json={
            "email": f"csv_user1_{suffix}@example.com",
            "password": "Password123!",
            "full_name": "CSV User One",
        },
    )
    user2_response = client.post(
        "/api/auth/register",
        json={
            "email": f"csv_user2_{suffix}@example.com",
            "password": "Password456!",
            "full_name": "CSV User Two",
        },
    )

    assert user1_response.status_code == 200
    assert user2_response.status_code == 200

    user1_headers = {
        "Authorization": f"Bearer {user1_response.json()['access_token']}"
    }
    user2_headers = {
        "Authorization": f"Bearer {user2_response.json()['access_token']}"
    }

    # Each user creates a scan with a distinct URL.
    user1_url = f"https://csv-test-one-{suffix}.example.com/"
    user2_url = f"https://csv-test-two-{suffix}.example.com/"

    scan1 = client.post(
        "/api/scans",
        json={"url": user1_url},
        headers=user1_headers,
    )
    scan2 = client.post(
        "/api/scans",
        json={"url": user2_url},
        headers=user2_headers,
    )

    assert scan1.status_code == 200
    assert scan2.status_code == 200

    # Export User 1's scan history.
    export_response = client.get(
        "/api/scans/export/csv",
        headers=user1_headers,
    )

    assert export_response.status_code == 200
    assert export_response.headers["content-type"].startswith("text/csv")
    assert 'filename="drishti_scan_history.csv"' in (
        export_response.headers.get("content-disposition", "")
    )

    rows = list(csv.reader(io.StringIO(export_response.text)))

    # Validate CSV structure.
    assert rows[0] == [
        "ID",
        "Timestamp (UTC)",
        "Hostname",
        "URL",
        "Risk Score",
        "Severity",
        "Findings Count",
        "Threat Intel Matched",
    ]

    exported_urls = [row[3] for row in rows[1:]]

    # User 1's URL must be included; User 2's URL must be excluded.
    assert user1_url in exported_urls
    assert user2_url not in exported_urls

    # Unauthenticated requests must not export scan history.
    unauthenticated_response = client.get("/api/scans/export/csv")
    assert unauthenticated_response.status_code in (401, 403)
