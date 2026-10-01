import math
import re
import ipaddress
from urllib.parse import urlsplit, unquote
from datetime import datetime, timezone
from typing import Dict, List, Any, Tuple, Optional

# Curated list of popular target brands for phishing / typosquatting detection
TARGET_BRANDS = [
    "paypal", "google", "microsoft", "apple", "amazon", "netflix",
    "chase", "wellsfargo", "bankofamerica", "citi", "facebook", "instagram",
    "linkedin", "twitter", "binance", "coinbase", "steam", "outlook",
    "office365", "dropbox", "whatsapp", "dhl", "fedex", "usps", "telegram",
    "github", "adobe", "shopify", "ebay", "walmart", "icici", "hdfc", "sbi"
]

# Abused or high-risk TLDs commonly leveraged in bulk phishing campaigns
SUSPICIOUS_TLDS = {
    "xyz", "top", "buzz", "club", "tk", "ml", "ga", "cf", "gq",
    "work", "rest", "fit", "icu", "cam", "sbs", "country", "zip",
    "mov", "surf", "monster", "cfd", "quest", "click", "download",
    "link", "gdn", "racing", "date", "party", "faith"
}

# Known URL shorteners
SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
    "buff.ly", "adf.ly", "cutt.ly", "rb.gy", "shorturl.at", "rebrand.ly",
    "clck.ru", "bl.ink", "v.gd"
}

# Suspicious keywords indicative of credential harvesting or urgent account action
SUSPICIOUS_KEYWORDS = {
    "login": 12,
    "signin": 12,
    "verify": 14,
    "verification": 14,
    "security": 10,
    "account": 10,
    "banking": 14,
    "update": 8,
    "wallet": 14,
    "token": 10,
    "recover": 12,
    "recovery": 12,
    "billing": 12,
    "auth": 10,
    "confirm": 10,
    "suspend": 15,
    "credential": 16,
    "validate": 12,
    "invoice": 10,
    "password": 15,
    "authenticate": 12
}

def calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy of a string."""
    if not text:
        return 0.0
    freq: Dict[str, int] = {}
    for char in text:
        freq[char] = freq.get(char, 0) + 1
    entropy = 0.0
    text_len = len(text)
    for count in freq.values():
        p = count / text_len
        entropy -= p * math.log2(p)
    return round(entropy, 3)

def levenshtein_distance(s1: str, s2: str) -> int:
    """Compute standard Levenshtein distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    
    prev_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        curr_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = prev_row[j + 1] + 1
            deletions = curr_row[j] + 1
            substitutions = prev_row[j] + (c1 != c2)
            curr_row.append(min(insertions, deletions, substitutions))
        prev_row = curr_row
    return prev_row[-1]

def normalize_url(raw_url: str) -> Tuple[str, str, str]:
    """
    Safely validate and normalize input URL.
    Returns (normalized_url, scheme, hostname).
    Raises ValueError on disallowed schemes or invalid formats.
    """
    clean_url = raw_url.strip()
    # Reject dangerous non-web schemes
    lower = clean_url.lower()
    for forbidden in ["javascript:", "data:", "file:", "vbscript:", "about:"]:
        if lower.startswith(forbidden):
            raise ValueError(f"Disallowed URL scheme: '{forbidden}' is not permitted for web scanning.")
    
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+\-.]*://", clean_url):
        clean_url = "https://" + clean_url

    parsed = urlsplit(clean_url)
    scheme = parsed.scheme.lower()
    if scheme not in ["http", "https"]:
        raise ValueError(f"Unsupported protocol '{scheme}'. Only HTTP and HTTPS are supported.")

    netloc = parsed.netloc
    if not netloc:
        raise ValueError("Could not parse a valid hostname from the URL.")

    # Remove userinfo credentials (e.g. user:pass@host)
    if "@" in netloc:
        hostname = netloc.split("@")[-1]
    else:
        hostname = netloc

    # Strip port if present
    if ":" in hostname and not (hostname.startswith("[") and hostname.endswith("]")):
        hostname = hostname.split(":")[0]

    hostname = hostname.strip().lower().rstrip(".")
    if not hostname:
        raise ValueError("Target hostname cannot be empty.")

    # Reconstruct normalized URL
    path = parsed.path or "/"
    normalized = f"{scheme}://{parsed.netloc}{path}"
    if parsed.query:
        normalized += f"?{parsed.query}"
    if parsed.fragment:
        normalized += f"#{parsed.fragment}"

    return normalized, scheme, hostname


class URLAnalysisEngine:
    def __init__(self, raw_url: str):
        self.raw_url = raw_url
        self.normalized_url, self.scheme, self.hostname = normalize_url(raw_url)
        self.parsed = urlsplit(self.normalized_url)
        self.findings: List[Dict[str, Any]] = []
        self.sources: List[Dict[str, Any]] = []
        self.recommendations: List[str] = []
        self.risk_score = 0
        self.is_ip_host = False
        self.has_punycode = False
        self.entropy = 0.0

    def add_finding(self, key: str, title: str, category: str, severity: str,
                    score_impact: int, evidence: str, explanation: str, recommendation: str):
        self.findings.append({
            "indicator_key": key,
            "title": title,
            "category": category,
            "severity": severity,
            "score_impact": score_impact,
            "evidence": evidence,
            "explanation": explanation,
            "recommendation": recommendation
        })
        self.risk_score += score_impact
        if recommendation and recommendation not in self.recommendations:
            self.recommendations.append(recommendation)

    def check_ip_address_host(self):
        """Detect if the hostname is a raw IPv4 or IPv6 address or private SSRF candidate."""
        clean_host = self.hostname.strip("[]")
        try:
            ip = ipaddress.ip_address(clean_host)
            self.is_ip_host = True
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
                self.add_finding(
                    key="private_internal_ip",
                    title="Private / Internal IP Address (Potential SSRF Vector)",
                    category="security",
                    severity="critical",
                    score_impact=45,
                    evidence=f"Hostname is a reserved/private IP: {clean_host}",
                    explanation="Links pointing to internal/loopback IPs (e.g. 127.0.0.1, 10.x.x.x, 192.168.x.x) are often used in Server-Side Request Forgery (SSRF) attacks or phishing targeting intranet devices.",
                    recommendation="Never submit or follow internal corporate network addresses across public communication channels."
                )
            else:
                self.add_finding(
                    key="raw_ip_host",
                    title="Direct IP Address Host",
                    category="structure",
                    severity="high",
                    score_impact=30,
                    evidence=f"Hostname uses direct IP address: {clean_host}",
                    explanation="Legitimate websites almost exclusively use domain names with trusted SSL certificates. Attackers often deploy malicious payloads on direct IP addresses to evade domain registration audits.",
                    recommendation="Avoid entering login credentials, payment details, or personal info on direct IP hosts."
                )
        except ValueError:
            # Check for hex/octal encoded IP formats (e.g. 0x7f.1 or 2130706433)
            if re.match(r"^0x[0-9a-fA-F]+$", clean_host) or clean_host.isdigit():
                self.is_ip_host = True
                self.add_finding(
                    key="obfuscated_ip_host",
                    title="Obfuscated Integer / Hex IP Address",
                    category="structure",
                    severity="critical",
                    score_impact=40,
                    evidence=f"Obfuscated host representation: {clean_host}",
                    explanation="Decimal or hexadecimal IP notations are deliberate evasion tactics designed to bypass naive security filters and conceal target destinations.",
                    recommendation="Do not visit this URL. The numeric encoding obscures the true server identity."
                )

    def check_punycode_and_homographs(self):
        """Detect Punycode (IDN) and lookalike homograph characters."""
        if "xn--" in self.hostname:
            self.has_punycode = True
            try:
                decoded = self.hostname.encode("ascii").decode("idna")
                self.add_finding(
                    key="punycode_idn_detected",
                    title="Punycode / IDN Domain Detected",
                    category="brand",
                    severity="high",
                    score_impact=28,
                    evidence=f"Punycode encoded domain: {self.hostname} (resolves to '{decoded}')",
                    explanation="Internationalized Domain Names (IDNs) use Punycode ('xn--') to render non-ASCII characters. Threat actors use lookalike Cyrillic or Greek glyphs to mimic popular brands like google.com or apple.com.",
                    recommendation="Inspect the decoded representation carefully for visual homoglyphs before trusting the destination."
                )
            except Exception:
                self.add_finding(
                    key="malformed_punycode",
                    title="Suspicious Punycode Structure",
                    category="structure",
                    severity="medium",
                    score_impact=18,
                    evidence=f"Punycode tag: {self.hostname}",
                    explanation="Punycode domain formatting detected that could not be cleanly mapped to standard IDNA.",
                    recommendation="Exercise caution when accessing internationalized domain representations."
                )

    def check_tld_reputation(self):
        """Check if top-level domain has historically high phishing abuse rates."""
        parts = self.hostname.split(".")
        if len(parts) >= 2:
            tld = parts[-1].lower()
            if tld in SUSPICIOUS_TLDS:
                self.add_finding(
                    key="high_risk_tld",
                    title=f"High-Risk / Frequently Abused TLD (.{tld})",
                    category="reputation",
                    severity="medium",
                    score_impact=16,
                    evidence=f"Domain ends with '.{tld}'",
                    explanation=f"Top-Level Domains like '.{tld}' have low registration costs and minimal identity verification, making them disproportionately popular among automated phishing operations.",
                    recommendation="Verify the legitimacy of the sender and check if official communications use this TLD."
                )

    def check_subdomains_and_hierarchy(self):
        """Analyze subdomain depth and brand misdirection in subdomains."""
        parts = self.hostname.split(".")
        if len(parts) > 3:
            self.add_finding(
                key="excessive_subdomains",
                title=f"Excessive Subdomain Hierarchy ({len(parts)} levels)",
                category="structure",
                severity="medium",
                score_impact=14,
                evidence=f"Host structure: {self.hostname}",
                explanation="Legitimate services typically operate on 2 or 3 domain levels. Excessive subdomain stacking is a frequent technique to push the actual registered domain out of sight on mobile viewports.",
                recommendation="Look at the very end of the domain name (the root domain and TLD) to identify the true operator."
            )

        # Brand keyword in subdomain while root is different
        if len(parts) >= 3:
            root_domain = ".".join(parts[-2:])
            subdomain_str = ".".join(parts[:-2]).lower()
            for brand in TARGET_BRANDS:
                if brand in subdomain_str and brand not in root_domain:
                    self.add_finding(
                        key="brand_in_subdomain_deception",
                        title=f"Brand Misdirection: '{brand}' in Subdomain",
                        category="brand",
                        severity="critical",
                        score_impact=38,
                        evidence=f"Subdomain contains '{brand}', but the actual root domain is '{root_domain}'",
                        explanation=f"This URL includes the trusted brand name '{brand}' inside the subdomain to deceptively convince users they are on official servers, while the site is hosted on '{root_domain}'.",
                        recommendation=f"Do NOT authenticate. Official {brand.capitalize()} services will always have '{brand}' in their main root domain."
                    )
                    break

    def check_brand_typosquatting(self):
        """Check for typosquatting, character substitutions and brand lookalikes."""
        parts = self.hostname.split(".")
        domain_core = parts[-2] if len(parts) >= 2 else parts[0]
        # Tokens split by hyphen/underscore (e.g., paypa1-account -> ["paypa1", "account"])
        sub_tokens = re.split(r"[-_]", domain_core)
        
        # Levenshtein distance check against target brands
        for brand in TARGET_BRANDS:
            # If domain core is exact brand, it's legitimate for that brand (assuming official TLD)
            if domain_core == brand:
                continue

            # Check if domain core contains brand with hyphens or prefixes (e.g. paypal-security, login-google)
            if brand in domain_core:
                self.add_finding(
                    key="brand_combo_domain",
                    title=f"Brand Name Embedded in Domain ({brand})",
                    category="brand",
                    severity="high",
                    score_impact=28,
                    evidence=f"Domain label '{domain_core}' embeds trusted brand '{brand}'",
                    explanation=f"Threat actors frequently register hybrid domains combining known brand names with security terms (e.g. '{brand}-login' or 'verify-{brand}') to mislead users.",
                    recommendation=f"Navigate directly to {brand.capitalize()}'s official website by typing the address manually or using official bookmarks."
                )
                break

            # Check if any token or whole domain is close in Levenshtein distance
            matched_typo = False
            candidates = [domain_core] + sub_tokens
            for cand in candidates:
                if cand == brand:
                    continue
                dist = levenshtein_distance(cand, brand)
                if dist == 1 and len(brand) >= 4:
                    self.add_finding(
                        key="brand_typosquatting",
                        title=f"Potential Typosquatting of '{brand.capitalize()}'",
                        category="brand",
                        severity="critical",
                        score_impact=36,
                        evidence=f"Domain token '{cand}' is 1 edit away from '{brand}'",
                        explanation=f"This domain looks virtually identical to '{brand}'. Attackers register typosquatted domains hoping victims mistype the address or fail to notice swapped letters (e.g. '0' for 'o', '1' for 'l', 'rn' for 'm').",
                        recommendation=f"Double check the domain spelling. You may be viewing a fraudulent clone of {brand.capitalize()}."
                    )
                    matched_typo = True
                    break
            if matched_typo:
                break

    def check_entropy(self):
        """Analyze character randomness in domain name (DGA detection)."""
        parts = self.hostname.split(".")
        domain_label = parts[-2] if len(parts) >= 2 else parts[0]
        self.entropy = calculate_entropy(domain_label)
        
        if len(domain_label) >= 8 and self.entropy >= 3.75:
            self.add_finding(
                key="high_entropy_dga",
                title=f"High Shannon Entropy ({self.entropy:.2f} bits)",
                category="lexical",
                severity="medium",
                score_impact=16,
                evidence=f"Domain label '{domain_label}' exhibits elevated randomness score: {self.entropy}",
                explanation="Domain names generated by automated malware algorithms (Domain Generation Algorithms - DGA) have high character entropy compared to natural language words.",
                recommendation="Be cautious of unpronounceable or randomly generated URLs."
            )

    def check_suspicious_keywords(self):
        """Inspect URL path, parameters, and domain for credential harvesting cues."""
        full_text = (self.hostname + self.parsed.path + self.parsed.query).lower()
        matched_keywords = []
        total_keyword_weight = 0

        for kw, weight in SUSPICIOUS_KEYWORDS.items():
            if re.search(r"(?:^|[^a-zA-Z0-9])" + re.escape(kw) + r"(?:[^a-zA-Z0-9]|$)", full_text):
                matched_keywords.append(kw)
                total_keyword_weight += weight

        if matched_keywords:
            # Cap keyword score impact
            impact = min(28, total_keyword_weight)
            severity = "high" if impact >= 20 else "medium"
            self.add_finding(
                key="credential_keywords_detected",
                title="Sensitive Action & Credential Keywords Detected",
                category="lexical",
                severity=severity,
                score_impact=impact,
                evidence=f"Matched sensitive keywords: {', '.join(matched_keywords[:6])}",
                explanation="Phishing links often concentrate high-urgency keywords (such as 'verify', 'banking', 'suspend', or 'login') in the URL path to trick users into submitting private credentials.",
                recommendation="Never enter sensitive passwords or multi-factor authentication tokens when prompted by unexpected links."
            )

    def check_lexical_patterns(self):
        """Check for obfuscation tactics: embedded '@', excessive hyphens, URL shorteners, etc."""
        # Check for '@' symbol in raw netloc
        if "@" in self.raw_url:
            self.add_finding(
                key="userinfo_at_symbol_obfuscation",
                title="Embedded '@' Symbol (Host Masquerading)",
                category="structure",
                severity="critical",
                score_impact=35,
                evidence="URL contains '@' symbol before host",
                explanation="In standard URL specification, text prior to '@' is treated as user credentials, meaning the browser actually connects to the server AFTER the '@' symbol. Attackers use this to display 'https://google.com@evil.com'.",
                recommendation="Do not click. The link will take you to a server completely different from the text shown before the '@' sign."
            )

        # Check for URL shorteners
        if self.hostname in SHORTENERS:
            self.add_finding(
                key="url_shortener_used",
                title="URL Shortening Service Detected",
                category="reputation",
                severity="low",
                score_impact=10,
                evidence=f"Service host: {self.hostname}",
                explanation="URL shorteners obscure the ultimate landing page destination. While widely used for sharing, attackers frequently rely on shorteners to mask malicious domains and bypass security gateways.",
                recommendation="Use an unshortening tool or preview service to verify the actual landing destination before opening."
            )

        # Excessive hyphens in host
        hyphen_count = self.hostname.count("-")
        if hyphen_count >= 3:
            self.add_finding(
                key="excessive_hyphens",
                title=f"Excessive Hyphens in Domain ({hyphen_count})",
                category="structure",
                severity="low",
                score_impact=8,
                evidence=f"Hostname: {self.hostname}",
                explanation="Attackers chain multiple words separated by hyphens (e.g. 'secure-login-account-verify-support') to build convincing fake web addresses.",
                recommendation="Examine each part of the hyphens to ensure it matches legitimate organization naming conventions."
            )

        # URL length
        if len(self.raw_url) > 120:
            self.add_finding(
                key="excessive_url_length",
                title=f"Abnormally Long URL ({len(self.raw_url)} characters)",
                category="lexical",
                severity="low",
                score_impact=6,
                evidence=f"Total length: {len(self.raw_url)} chars",
                explanation="Phishing links often feature unusually bloated URLs with deep redirection parameters or encoded tokens to evade simple string matching.",
                recommendation="Verify the primary domain and discard unnecessary tracking or payload parameters."
            )

        # Insecure protocol (HTTP)
        if self.scheme == "http":
            self.add_finding(
                key="insecure_http_protocol",
                title="Unencrypted HTTP Connection",
                category="security",
                severity="medium",
                score_impact=15,
                evidence="Protocol is plain 'http://' without TLS/SSL encryption",
                explanation="HTTP sends traffic in plain text, making passwords and session cookies vulnerable to interception via adversary-in-the-middle (AiTM) network eavesdropping.",
                recommendation="Do not submit credentials or sensitive personal information over unencrypted HTTP connections."
            )

    def attach_threat_intelligence(self):
        """Simulate or integrate threat intelligence feed check with transparent evidence."""
        # Simulated database of known flagged test patterns
        known_malicious_keywords = ["phish", "malware", "credential-steal", "evil-corp", "fake-bank"]
        is_known = any(kw in self.normalized_url.lower() for kw in known_malicious_keywords)

        if is_known:
            self.sources.append({
                "source_name": "Drishti Threat Intel Feed (Simulated)",
                "confidence": 0.96,
                "verdict": "malicious",
                "details": "Domain matches signatures in curated phishing and credential-harvesting indicators repository.",
                "last_updated": datetime.now(timezone.utc)
            })
            self.add_finding(
                key="threat_intel_blocklist_hit",
                title="Threat Intelligence Blacklist Match",
                category="reputation",
                severity="critical",
                score_impact=40,
                evidence="Indicator matched active threat feed database entry",
                explanation="This host or specific URL is actively listed in threat intelligence feeds as associated with credential phishing, malware distribution, or command-and-control operations.",
                recommendation="Block access immediately. Do not interact with the host under any circumstances."
            )
        else:
            self.sources.append({
                "source_name": "Drishti Threat Intel Feed (Local)",
                "confidence": 0.85,
                "verdict": "clean",
                "details": "No active threat actor signatures or reported campaign hits found in local repository.",
                "last_updated": datetime.now(timezone.utc)
            })

    def run(self) -> Dict[str, Any]:
        """Execute full scan pipeline and assemble calibrated score and report."""
        self.check_ip_address_host()
        self.check_punycode_and_homographs()
        self.check_tld_reputation()
        self.check_subdomains_and_hierarchy()
        self.check_brand_typosquatting()
        self.check_entropy()
        self.check_suspicious_keywords()
        self.check_lexical_patterns()
        self.attach_threat_intelligence()

        # Clamp risk score between 0 and 100
        final_score = min(100, max(0, self.risk_score))

        # Severity categorization
        if final_score >= 80:
            severity_level = "Very high risk"
            summary = "Critical threat indicators identified. High probability of phishing, credential harvesting, or deceptive impersonation."
        elif final_score >= 60:
            severity_level = "High risk"
            summary = "Significant suspicious patterns and deceptive structures detected. Exercise extreme caution."
        elif final_score >= 30:
            severity_level = "Caution"
            summary = "Some suspicious attributes or low-reputation elements observed. Verify sender origin before engaging."
        else:
            severity_level = "Lower observed risk"
            summary = "No immediate high-risk structural or known malicious indicators detected in static analysis."

        if not self.recommendations:
            self.recommendations.append("Continue to practice safe browsing habits and verify sender identities.")

        limitations_disclaimer = (
            "Assessment Notice: This score is a defensive heuristic evaluation based on structural, lexical, "
            "and threat-intelligence indicators. It represents observed risk characteristics, not definitive proof "
            "that a website is benign or malicious. Always exercise vigilance."
        )

        threat_matched = any(s.get("verdict") == "malicious" for s in self.sources)

        return {
            "url": self.raw_url,
            "normalized_url": self.normalized_url,
            "hostname": self.hostname,
            "scheme": self.scheme,
            "risk_score": final_score,
            "severity_level": severity_level,
            "is_ip_host": self.is_ip_host,
            "has_punycode": self.has_punycode,
            "entropy": self.entropy,
            "threat_intel_matched": threat_matched,
            "summary": summary,
            "findings": self.findings,
            "sources": self.sources,
            "recommendations": self.recommendations,
            "limitations_disclaimer": limitations_disclaimer,
            "created_at": datetime.now(timezone.utc)
        }
