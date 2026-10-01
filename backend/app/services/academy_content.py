import json
from sqlalchemy.orm import Session
from app.models.models import LearningModule

ACADEMY_MODULES = [
    {
        "module_key": "phishing_fundamentals",
        "title": "Phishing & Spear-Phishing Detection",
        "category": "Email & Message Security",
        "difficulty": "Beginner",
        "estimated_minutes": 6,
        "order_index": 1,
        "overview": "Learn how attackers craft psychological pretexts, urgency triggers, and spoofed domains to trick victims into surrendering credentials.",
        "content_json": json.dumps([
            {
                "section": "1. What is Phishing?",
                "text": "Phishing is a social engineering attack where adversaries impersonate reputable entities (banks, tech providers, colleagues) to deceive individuals into revealing sensitive credentials, installing malware, or authorizing fraudulent transactions."
            },
            {
                "section": "2. High-Yield Red Flags",
                "text": "• Artificial Urgency: Demands like 'Account suspended within 24h' force impulsive action.\n• Mismatched Sender Headers: Display names might say 'PayPal Support', but the actual SMTP envelope is 'support@mail-notification-xyz.com'.\n• Generic Greetings: 'Dear Customer' instead of your registered name.\n• Obfuscated Links: Hovering reveals a completely different destination than the displayed anchor text."
            },
            {
                "section": "3. The Evolution: Spear Phishing & BEC",
                "text": "Spear phishing uses tailored personal reconnaissance (LinkedIn titles, corporate vendor lists) to execute targeted fraud. Business Email Compromise (BEC) often targets finance teams requesting urgent supplier bank account changes."
            }
        ]),
        "quiz_json": json.dumps([
            {
                "id": 1,
                "question": "You receive an email from 'HR Payroll' with sender address `hr-support@company-portal-update.xyz` claiming you must update bank direct deposit details within 2 hours or pay will be delayed. What is the primary indicator of fraud?",
                "scenario_context": "Sender: HR Direct <hr-support@company-portal-update.xyz>\nSubject: [URGENT] Payroll Direct Deposit Re-verification Required within 2 Hours",
                "visual_type": "email_header",
                "visual_payload": {
                    "from": "HR Direct <hr-support@company-portal-update.xyz>",
                    "subject": "[URGENT] Direct Deposit Re-verification",
                    "urgency": "High",
                    "action_link": "https://company.internal.auth-payroll.xyz/login"
                },
                "options": [
                    "The email was sent during regular working hours.",
                    "The combination of extreme artificial urgency and an unofficial `.xyz` domain that is not your official company domain.",
                    "The email does not include the company logo.",
                    "HR always contacts employees exclusively via SMS."
                ],
                "correct_index": 1,
                "explanation": "Threat actors use manufactured urgency to bypass rational thought, coupled with low-cost lookalike domains (e.g. `.xyz`) that do not match the organization's authentic registered domain.",
                "threat_category": "Phishing"
            },
            {
                "id": 2,
                "question": "A link in an email text displays `https://paypal.com/security-update`, but hovering reveals destination `https://security.paypal.com.account-reauth.top/signin`. Where will clicking this link actually take you?",
                "scenario_context": "Displayed text: https://paypal.com/security-update\nActual href: https://security.paypal.com.account-reauth.top/signin",
                "visual_type": "url_inspect",
                "visual_payload": {
                    "displayed": "https://paypal.com/security-update",
                    "destination": "https://security.paypal.com.account-reauth.top/signin"
                },
                "options": [
                    "To PayPal's legitimate security update server.",
                    "To a malicious host `account-reauth.top` controlled by an attacker, using PayPal's brand in the subdomain to trick you.",
                    "To an encrypted PayPal proxy mirror.",
                    "The link is automatically safe because it starts with 'security'."
                ],
                "correct_index": 1,
                "explanation": "In standard DNS hierarchy, the root domain is defined by the last two segments before the path (`account-reauth.top`). Attackers put trusted brand names into the subdomain labels (`security.paypal.com`) to mislead users.",
                "threat_category": "URL Subdomain Spoofing"
            },
            {
                "id": 3,
                "question": "What is the most secure response if you receive an unexpected multi-factor authentication (MFA) push notification on your phone when you were not logging in?",
                "scenario_context": "Authenticator app prompt: 'Approve sign-in request from Moscow, RU?'",
                "options": [
                    "Approve it quickly to stop the notification sound.",
                    "Deny the request immediately, report fraudulent sign-in activity to your security team, and change your password.",
                    "Wait 30 minutes and approve if it prompts again.",
                    "Forward the notification to your personal email."
                ],
                "correct_index": 1,
                "explanation": "Receiving an unsolicited MFA prompt means an attacker already has your valid username and password and is attempting 'MFA Fatigue' to get you to approve. Denying the prompt and immediately rotating credentials stops the breach.",
                "threat_category": "MFA Fatigue"
            }
        ])
    },
    {
        "module_key": "url_anatomy_and_homographs",
        "title": "URL Anatomy & Deceptive Links",
        "category": "Safe Browsing",
        "difficulty": "Intermediate",
        "estimated_minutes": 8,
        "order_index": 2,
        "overview": "Master the structural anatomy of web links: protocols, subdomains, punycode homographs, and hidden redirection traps.",
        "content_json": json.dumps([
            {
                "section": "1. Anatomy of a Web URL",
                "text": "A URL comprises: `https://` (Protocol) + `subdomain.` + `rootdomain.` + `tld` + `/path?query=param`.\nThe key rule: The TRUE owner of the website is determined solely by the root domain immediately preceding the TLD."
            },
            {
                "section": "2. Homograph Attacks & Punycode",
                "text": "Internationalized Domain Names allow non-Latin scripts. Cyrillic 'а' (U+0430) looks identical to Latin 'a' (U+0061). Browsers convert this to Punycode starting with `xn--`. A domain appearing as `apple.com` might actually resolve to `xn--pple-43d.com`."
            },
            {
                "section": "3. The '@' Symbol Masquerade",
                "text": "In RFC standards, text before `@` represents HTTP basic auth credentials. Thus `https://google.com@evil-site.com/` connects directly to `evil-site.com`, completely ignoring Google!"
            }
        ]),
        "quiz_json": json.dumps([
            {
                "id": 1,
                "question": "Given the URL `https://accounts.google.com@attacker-defense.com/recovery`, which server receives your network traffic?",
                "options": [
                    "accounts.google.com",
                    "attacker-defense.com",
                    "Both Google and attacker-defense simultaneously",
                    "Neither; the browser throws a syntax error"
                ],
                "correct_index": 1,
                "explanation": "The text before `@` is interpreted as username credentials by browser network stacks. The actual host queried is `attacker-defense.com`.",
                "threat_category": "Host Masquerading"
            },
            {
                "id": 2,
                "question": "What does a domain starting with `xn--` signify when inspecting a URL in Drishti Scan?",
                "options": [
                    "It represents a military-grade encrypted domain.",
                    "It indicates an Internationalized Domain Name (IDN) encoded via Punycode, which could be an IDN homoglyph attack.",
                    "It is a standard XML namespace domain.",
                    "It means the domain has expired."
                ],
                "correct_index": 1,
                "explanation": "Punycode (`xn--`) represents Unicode characters in ASCII. Attackers exploit this to mimic brand names using lookalike characters from other alphabets.",
                "threat_category": "Homoglyph Attack"
            },
            {
                "id": 3,
                "question": "Does having a padlock icon (HTTPS) on a website prove that the site is safe and not a phishing scam?",
                "options": [
                    "Yes, certificate authorities strictly verify business legitimacy before issuing SSL certificates.",
                    "No; HTTPS only guarantees encryption between your device and the server. Anyone can obtain a free SSL certificate for a malicious website.",
                    "Yes, search engines block HTTPS on phishing domains.",
                    "Only if the URL ends in `.com`."
                ],
                "correct_index": 1,
                "explanation": "The HTTPS padlock means transit encryption, NOT business legitimacy. Over 80% of modern phishing websites use valid free TLS/SSL certificates (e.g. Let's Encrypt).",
                "threat_category": "HTTPS Misconception"
            }
        ])
    },
    {
        "module_key": "passwords_and_identity_defense",
        "title": "Password Security & Identity Defense",
        "category": "Credential Defense",
        "difficulty": "Beginner",
        "estimated_minutes": 5,
        "order_index": 3,
        "overview": "Understand the mathematical foundations of entropy, why passphrases beat complex short passwords, and how credential stuffing works.",
        "content_json": json.dumps([
            {
                "section": "1. Why Password Length Trumps Complexity",
                "text": "Entropy scales linearly with length but logarithmically with character pool. An 8-character password with letters, numbers, and symbols has ~50 bits of entropy. A 4-word random passphrase (`correct-horse-battery-staple`) has ~75 bits of entropy and is drastically harder to crack via GPU arrays."
            },
            {
                "section": "2. Credential Stuffing & Breach Re-use",
                "text": "Adversaries download billions of breached credentials from darknet dumps and feed them into automated bots testing major banking and shopping sites. If you reuse passwords, a breach on an obscure gaming forum compromises your primary email."
            },
            {
                "section": "3. Passkeys & WebAuthn",
                "text": "Passkeys use public-key cryptography bound to a specific domain origin. Even if you are tricked onto a phishing site, your passkey will NOT release credentials because the browser verifies the domain cryptographic binding."
            }
        ]),
        "quiz_json": json.dumps([
            {
                "id": 1,
                "question": "Which of the following passwords has the highest resistance against offline GPU brute-force attacks?",
                "options": [
                    "`P@ssw0rd!` (9 characters)",
                    "`Tr0ub4dor&3` (11 characters)",
                    "`granite-ocean-falcon-breeze` (27 characters passphrase)",
                    "`1234567890Aa!` (13 characters)"
                ],
                "correct_index": 2,
                "explanation": "The 27-character multi-word passphrase provides vastly superior combinatorial search space (high Shannon entropy) while remaining memorable to humans without predictable leetspeak substitutions.",
                "threat_category": "Entropy & Brute Force"
            },
            {
                "id": 2,
                "question": "Why is SMS-based two-factor authentication considered less secure than hardware keys (FIDO2) or authenticator apps (TOTP)?",
                "options": [
                    "SMS texts are too slow to arrive.",
                    "SMS is vulnerable to SIM-swapping attacks and SS7 carrier interception.",
                    "SMS is only available on iOS devices.",
                    "SMS consumes battery power."
                ],
                "correct_index": 1,
                "explanation": "Adversaries can impersonate victims to mobile telecom carriers to perform SIM swaps, diverting SMS verification codes to attacker devices.",
                "threat_category": "2FA Vectors"
            }
        ])
    }
]

def seed_learning_modules(db: Session):
    """Seed initial academy modules into database if not present."""
    for mod_data in ACADEMY_MODULES:
        existing = db.query(LearningModule).filter(LearningModule.module_key == mod_data["module_key"]).first()
        if not existing:
            new_module = LearningModule(
                module_key=mod_data["module_key"],
                title=mod_data["title"],
                category=mod_data["category"],
                difficulty=mod_data["difficulty"],
                estimated_minutes=mod_data["estimated_minutes"],
                order_index=mod_data["order_index"],
                overview=mod_data["overview"],
                content_json=mod_data["content_json"],
                quiz_json=mod_data["quiz_json"]
            )
            db.add(new_module)
    db.commit()
