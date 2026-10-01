import pytest
from app.services.url_scanner import (
    URLAnalysisEngine, normalize_url, calculate_entropy, levenshtein_distance
)
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.services.report_generator import generate_pdf_report
from datetime import datetime, timezone

def test_url_normalization():
    # Adding missing scheme
    norm, scheme, host = normalize_url("example.com/login")
    assert scheme == "https"
    assert host == "example.com"
    assert norm == "https://example.com/login"

    # Preserving existing scheme
    norm, scheme, host = normalize_url("http://test.org:8080/path?q=1")
    assert scheme == "http"
    assert host == "test.org"

    # Rejecting dangerous non-web schemes
    with pytest.raises(ValueError):
        normalize_url("javascript:alert(1)")
    with pytest.raises(ValueError):
        normalize_url("file:///etc/passwd")

def test_entropy_calculation():
    # Low entropy for repetitive or plain words
    low_ent = calculate_entropy("aaaaa")
    assert low_ent == 0.0

    # High entropy for random DGA string
    high_ent = calculate_entropy("q7x9w2v8k1m3p4")
    assert high_ent > 3.4

def test_levenshtein_distance():
    assert levenshtein_distance("paypal", "paypa1") == 1
    assert levenshtein_distance("apple", "aple") == 1
    assert levenshtein_distance("google", "google") == 0

def test_ip_host_detection():
    # Direct public IP
    engine = URLAnalysisEngine("http://185.190.140.2/auth")
    res = engine.run()
    assert res["is_ip_host"] is True
    assert any(f["indicator_key"] == "raw_ip_host" for f in res["findings"])

    # Internal private IP (SSRF vector)
    engine_priv = URLAnalysisEngine("http://127.0.0.1:8000/admin")
    res_priv = engine_priv.run()
    assert res_priv["is_ip_host"] is True
    assert any(f["indicator_key"] == "private_internal_ip" for f in res_priv["findings"])
    assert res_priv["risk_score"] >= 45

def test_brand_in_subdomain_deception():
    # Brand inside subdomain, deceptive root domain
    engine = URLAnalysisEngine("http://paypal.com.security-verify.xyz/login")
    res = engine.run()
    assert any(f["indicator_key"] == "brand_in_subdomain_deception" for f in res["findings"])
    assert any(f["indicator_key"] == "high_risk_tld" for f in res["findings"])
    assert res["risk_score"] >= 60

def test_typosquatting_detection():
    engine = URLAnalysisEngine("https://paypa1-account.com")
    res = engine.run()
    assert any(f["indicator_key"] == "brand_typosquatting" for f in res["findings"])
    assert res["risk_score"] >= 35

def test_punycode_detection():
    engine = URLAnalysisEngine("https://xn--pple-43d.com")
    res = engine.run()
    assert res["has_punycode"] is True
    assert any(f["indicator_key"] == "punycode_idn_detected" for f in res["findings"])

def test_userinfo_at_symbol_masquerade():
    engine = URLAnalysisEngine("https://google.com@phish-site.com/login")
    res = engine.run()
    assert any(f["indicator_key"] == "userinfo_at_symbol_obfuscation" for f in res["findings"])

def test_security_hashing_and_jwt():
    raw_pwd = "SuperSecretPassword123!"
    hashed = hash_password(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

    token = create_access_token(subject=42)
    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == "42"

def test_pdf_report_generation():
    sample_scan = {
        "id": 1,
        "url": "https://test-phishing-example.xyz/login",
        "hostname": "test-phishing-example.xyz",
        "scheme": "https",
        "risk_score": 75,
        "severity_level": "High risk",
        "entropy": 3.42,
        "summary": "High risk phishing heuristics triggered.",
        "created_at": datetime.now(timezone.utc),
        "findings": [
            {
                "title": "High-Risk TLD (.xyz)",
                "category": "reputation",
                "severity": "medium",
                "score_impact": 16,
                "evidence": "Domain ends with .xyz",
                "explanation": "Often abused TLD.",
                "recommendation": "Be cautious."
            }
        ],
        "recommendations": ["Do not authenticate."]
    }
    pdf_stream = generate_pdf_report(sample_scan)
    content = pdf_stream.getvalue()
    assert len(content) > 1000
    assert content.startswith(b"%PDF")
