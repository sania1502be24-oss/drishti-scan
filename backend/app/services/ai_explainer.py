import os
import json
from typing import Dict, Any, List
from app.core.config import settings

def generate_ai_explanation(scan_data: Dict[str, Any]) -> str:
    """
    Generate an AI-assisted threat explanation and security advisory.
    Uses intelligent deterministic synthesis by default, with optional Google Gemini integration
    if GEMINI_API_KEY is configured in the environment.
    """
    findings: List[Dict[str, Any]] = scan_data.get("findings", [])
    url = scan_data.get("url", "")
    hostname = scan_data.get("hostname", "")
    risk_score = scan_data.get("risk_score", 0)
    severity = scan_data.get("severity_level", "Unknown")

    # If Gemini API key is configured, we can attempt generative synthesis
    api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
    if api_key:
        try:
            import httpx
            prompt = f"""You are Drishti AI, an expert cybersecurity threat analyst. Analyze this URL assessment:
URL: {url}
Hostname: {hostname}
Risk Score: {risk_score}/100 ({severity})
Identified Indicators:
{json.dumps([{ 'title': f['title'], 'category': f['category'], 'severity': f['severity'], 'evidence': f['evidence'] } for f in findings], indent=2)}

Provide a concise, professional threat analysis structured into:
1. Executive Risk Assessment
2. Primary Threat Vectors (Phishing, Typosquatting, Impersonation, SSRF, etc.)
3. Recommended Immediate Defensive Actions
Keep it clear, objective, and evidence-grounded. Do not hallucinate external intelligence."""

            url_api = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url_api, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    ai_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return ai_text
        except Exception:
            pass  # Fall back smoothly to expert synthesizer

    # Robust Built-in Cybersecurity Synthesis Engine
    lines = []
    lines.append(f"### 🛡️ Drishti AI Threat Intelligence Briefing")
    lines.append(f"**Target Analysis:** `{hostname}` | **Risk Score:** {risk_score}/100 ({severity})\n")

    if not findings:
        lines.append("**Executive Summary:**")
        lines.append("The scanned URL exhibits standard structural properties with no immediate high-risk heuristic patterns, deceptive homoglyphs, or known threat-feed correlations detected.")
        lines.append("\n**Defensive Posture:**")
        lines.append("- While static analysis indicates low observed risk, ensure that website content matches expected organizational identity.")
        lines.append("- Never disable browser security protections or download unexpected executables.")
        return "\n".join(lines)

    lines.append("**Executive Summary:**")
    if risk_score >= 80:
        lines.append(f"This URL demonstrates multiple high-severity deceptive characteristics strongly indicative of an active adversary campaign (e.g., targeted credential harvesting or impersonation targeting `{hostname}`).")
    elif risk_score >= 60:
        lines.append(f"Elevated risk signals detected. The URL employs misleading structural or lexical configurations commonly leveraged to bypass email security gateways.")
    else:
        lines.append(f"Moderate risk indicators detected. The URL contains patterns that warrant user scrutiny prior to authentication or data submission.")

    lines.append("\n**Key Threat Vector Breakdown:**")
    for f in findings[:5]:
        cat_badge = f.get("category", "threat").upper()
        lines.append(f"- **[{cat_badge}] {f['title']}**: {f['explanation']} *(Observed: {f['evidence']})*")

    lines.append("\n**Recommended Defensive Actions:**")
    lines.append("1. **Do Not Authenticate:** Refrain from typing user credentials, passwords, or session tokens into any form on this host.")
    lines.append("2. **Validate Out-of-Band:** If this link was received via email or message, contact the apparent sender through a verified alternative channel.")
    lines.append("3. **Inspect Root Domain:** Always verify the authentic top-level domain rather than relying on subdomains or branded prefixes.")
    lines.append("4. **Report Phishing:** If received via corporate or institutional email, submit the sample to your organization's SOC or email abuse mailbox.")

    return "\n".join(lines)
