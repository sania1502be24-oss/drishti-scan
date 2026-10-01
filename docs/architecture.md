# Drishti Scan — System Architecture & Engineering Blueprint

> **"See Threats. Secure What Matters."**  
> Defensive Cybersecurity Assessment, Awareness & Telemetry Platform

---

## 1. System Architecture Overview

Drishti Scan is architected as an isolated, multi-tiered defensive cybersecurity platform. The system decouples untrusted client inputs from execution risks using an offline static analysis engine, client-side zero-knowledge security analyzers, and strict server-side authorization boundaries.

```
                         ┌──────────────────────────────────────────────────┐
                         │                 React Frontend                   │
                         │   • Responsive Cyber UI (320px – Desktop)        │
                         │   • 100% Client-Side Password Lab (Zero Net)    │
                         │   • Phishing Scenario Simulator & Quizzes       │
                         │   • Personal Security Telemetry & Charts        │
                         └─────────────────────────┬────────────────────────┘
                                                   │ HTTPS / REST (JWT Bearer)
                                                   ▼
                         ┌──────────────────────────────────────────────────┐
                         │               FastAPI API Gateway                │
                         │   • Input Validation & Normalization             │
                         │   • JWT Auth & Bcrypt Credential Verification    │
                         │   • Row-Level Authorization Interceptors         │
                         │   • Rate Limiting & SSRF Perimeter Check         │
                         └───────┬───────────────────┬──────────────────┬───┘
                                 │                   │                  │
                ┌────────────────▼─────────┐         │         ┌────────▼───────────┐
                │   URL Analysis Engine    │         │         │  ReportLab Engine  │
                │  • SSRF Shield (Offline) │         │         │  • Dynamic PDF Gen │
                │  • Typosquatting Matcher │         │         │  • Threat Badges   │
                │  • Punycode IDN Decoder  │         │         │  • Mitigations     │
                │  • Shannon Entropy (DGA) │         │         └────────────────────┘
                │  • Subdomain Stacking    │         │
                │  • Calibrated Risk Score │         │
                └──────────────────────────┘         │
                                                     ▼
                                     ┌───────────────────────────────┐
                                     │     SQLAlchemy ORM Layer      │
                                     │  • SQLite (Local / Test)      │
                                     │  • PostgreSQL (Production)    │
                                     │  • Strict Row-Level Scoping   │
                                     └───────────────────────────────┘
```

---

## 2. Threat Modeling & SSRF Defense Perimeter

### The Server-Side Request Forgery (SSRF) Trap
Many naive URL analysis tools make direct outbound HTTP requests (`curl` or `requests.get()`) to fetch the target URL. In a backend web service, this introduces critical vulnerabilities:
1. **Internal Pivot:** An attacker submits `http://169.254.169.254/latest/meta-data/` to harvest AWS/cloud metadata tokens.
2. **Intranet Port Scanning:** Submitting `http://192.168.1.1:8080/` or `http://127.0.0.1:5432/` probes internal microservices and databases.
3. **Malware Delivery & Exploit Execution:** An attacker’s server responds with exploit payloads targeting the backend parser.

### Drishti Scan’s Defensive Architecture:
- **Zero Blind Outbound Fetching:** The URL Analysis Engine operates purely offline on lexical, structural, and cryptographic features of the URL string.
- **Private & Loopback IP Detection:** Hostnames are parsed using Python's `ipaddress` library against RFC 1918, RFC 3927 (link-local), and loopback specifications (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`, `::1`).
- If an internal or loopback address is detected, it is immediately categorized as a **Critical Severity SSRF Risk** and flagged with defensive mitigation guidelines without the backend ever making a connection.

---

## 3. URL Risk Scoring Methodology & Indicator Matrix

The scoring engine implements a calibrated, explainable heuristic pipeline that clamps risk between `0` and `100`:

| Risk Tier | Index Range | Operational Verdict | Recommended User Action |
|:---|:---:|:---|:---|
| **Lower Observed Risk** | 0 – 29 | Standard structural properties; no deceptive patterns found | Proceed normally; maintain basic vigilance |
| **Caution** | 30 – 59 | Suspicious TLD, high entropy, or credential-related keywords | Verify sender out-of-band before logging in |
| **High Risk** | 60 – 79 | Brand in subdomain, direct IP host, or multiple threat signals | Do not input credentials; inspect true root domain |
| **Very High Risk** | 80 – 100 | Confirmed threat-intel hit, typosquatting, or masquerading | Block host immediately; report to security team |

### Core Detection Heuristics:
1. **Brand-in-Subdomain Stacking:** Detects when trusted brand names (`paypal`, `apple`, `google`, `microsoft`) appear in subdomain labels while the root domain belongs to an unrelated registrant (e.g. `paypal.com.account-update.tk`).
2. **Levenshtein Typosquatting:** Evaluates edit distance against target brands to catch letter swaps (`paypa1`, `arnazon`, `g00gle`).
3. **Punycode / IDN Homographs:** Identifies `xn--` prefixes and decoded Cyrillic/Greek lookalike glyphs.
4. **Shannon Entropy ($H$):** Calculates character distribution randomness ($H = -\sum p_i \log_2 p_i$) on domain labels to catch Domain Generation Algorithms (DGA) used by botnets.
5. **Host Masquerading:** Flags embedded `@` symbols used to divert browser resolution away from displayed anchor text.

---

## 4. Privacy-First Client-Side Password Lab

### Zero-Knowledge Architecture
To protect user privacy, the Password Security Lab runs **100% locally in browser memory**:
- Keystrokes are evaluated by pure client-side JavaScript.
- No network requests are made, preventing passwords from entering server logs, third-party trackers, or generative AI training datasets.

### Mathematical Foundations:
- **Combinatorial Pool Diversity:** Computes alphabet size $N = \sum N_{\text{subsets}}$ (lowercase: 26, uppercase: 26, digits: 10, symbols: 33).
- **Shannon Entropy:** $H = L \times \log_2(N)$ bits.
- **Crack Time Simulations:**
  - *Online Attack:* Throttled rate of 100 attempts/minute ($1.67 \text{ req/sec}$).
  - *Offline GPU Cluster:* High-performance Hashcat rig calculating 100 Billion hashes/second ($10^{11} \text{ hashes/sec}$).

---

## 5. Row-Level Authorization & Data Isolation

Drishti Scan enforces strict row-level security on all private endpoints:
- Every scan record, PDF download, and quiz submission is bound to the authenticated `user_id`.
- The API verifies `scan.user_id == current_user.id` on every `GET`, `DELETE`, and report export.
- Attempting to query an ID belonging to another user returns an HTTP `403 Forbidden` or `404 Not Found`, eliminating Insecure Direct Object References (IDOR).
