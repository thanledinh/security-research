# 🔒 Security Research

<div align="center">

![Security Research](https://img.shields.io/badge/Security-Research-critical?style=for-the-badge&logo=hackthebox&logoColor=white)
![Responsible Disclosure](https://img.shields.io/badge/Responsible-Disclosure-blue?style=for-the-badge&logo=shield&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

**Independent security research focused on web application and infrastructure vulnerabilities**

[Research](#-research) · [Methodology](#-methodology) · [Disclosure Policy](#-disclosure-policy) · [Repository Structure](#-repository-structure)

</div>

---

## About

This repository documents independent security research conducted on web applications, APIs, and cloud infrastructure. All research follows responsible disclosure principles — vendors are notified before any findings are published.

Research is conducted using a combination of manual analysis and AI-assisted tooling (Google Gemini). The researcher is responsible for target selection, execution, result interpretation, and disclosure decisions. AI assists with scripting, automation, and documentation.

> ⚠️ **Disclaimer:** All research documented here was performed in good faith for the purpose of improving software security. No data was exfiltrated, modified, or shared. No denial of service was caused.

---

## 🔬 Research Focus Areas

| Area | Description |
|------|-------------|
| **Authentication & Session Management** | JWT implementation flaws, token lifecycle, session fixation |
| **API Security** | Endpoint discovery, access control, mass assignment, IDOR |
| **Infrastructure Reconnaissance** | Real IP discovery behind CDN/WAF, DNS analysis, certificate transparency |
| **Frontend Security** | JavaScript static analysis, sensitive data exposure in client bundles |
| **Cloud Misconfigurations** | Exposed databases, Docker registries, development environments |

---

## 📂 Research

### [Hosting Control Panel — Security Analysis](research/hosting-control-panel-security-analysis/)

A comprehensive security assessment of a cloud hosting platform, discovering vulnerabilities across the authentication layer, API surface, and underlying infrastructure.

| Metric | Value |
|--------|-------|
| **Findings** | 18 total (4 High, 5 Medium, 9 Informational) |
| **Tests Conducted** | 13 categories passed without vulnerability |
| **Real IPs Discovered** | 3 (behind Cloudflare) |
| **API Endpoints Mapped** | 100+ |
| **Subdomains Identified** | 110+ |
| **Duration** | 4 days |
| **Status** | Report submitted to vendor |

**Key Findings:**
- JWT tokens accepted after expiration — enabling persistent unauthorized access
- Internal Docker registry URLs and startup commands exposed via public API
- Database and SSH services exposed to the internet on staging server
- Unsanitized HTML stored in user profile fields (Stored XSS)

📄 [Full Report →](research/hosting-control-panel-security-analysis/report.md)

---

## 🧪 Methodology

Research follows a structured approach based on the [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) and [PTES](http://www.pentest-standard.org/):

```
Reconnaissance → Surface Mapping → Vulnerability Testing → Impact Analysis → Reporting
```

1. **Reconnaissance** — DNS enumeration, certificate transparency, Shodan/Censys, technology fingerprinting
2. **Surface Mapping** — JavaScript analysis, API endpoint extraction, authentication flow analysis
3. **Vulnerability Testing** — JWT attacks, injection testing, access control, business logic
4. **Infrastructure Assessment** — Real IP discovery, port scanning, service fingerprinting
5. **Impact Analysis** — Risk assessment, exploit chaining, severity classification
6. **Reporting** — Structured documentation, responsible disclosure, remediation guidance

📄 [Detailed Methodology →](methodology.md)

---

## 📜 Disclosure Policy

This research follows **responsible disclosure** principles:

- Vendors are contacted **before** any public disclosure
- A minimum **90-day** remediation window is provided
- Critical findings are communicated with urgency
- Published reports are **sanitized** to remove exploitable details
- No proof-of-concept code targeting specific vendors is published

📄 [Full Disclosure Policy →](disclosure-policy.md)

---

## 📁 Repository Structure

```
security-research/
│
├── README.md                                        # This file
├── methodology.md                                   # Research methodology
├── disclosure-policy.md                             # Responsible disclosure policy
│
├── research/                                        # Published research
│   └── hosting-control-panel-security-analysis/
│       ├── report.md                                # Executive summary & findings
│       ├── technical-analysis.md                    # Detailed technical analysis
│       ├── impact.md                                # Impact assessment
│       ├── remediation.md                           # Remediation recommendations
│       └── timeline.md                              # Disclosure timeline
│
├── tools/                                           # Reusable security tools
│   ├── crawl_webapp.js                              # Cloudflare bypass crawler
│   ├── test_api_basic.js                            # API vulnerability tester
│   ├── test_api_advanced.js                         # JWT, SQLi, XSS tester
│   ├── recon_infrastructure.js                      # Infrastructure recon
│   ├── bruteforce_paths.js                          # Path discovery
│   ├── test_real_ip.js                              # Direct IP testing
│   └── wordlist_paths.txt                           # Custom wordlist
│
└── assets/                                          # Media and resources
    └── screenshots/
```

---

## 🛡️ Ethics

- All testing is performed with a **standard user account** — no privilege exploitation
- Research targets are selected based on **public-facing services** only
- Findings are reported to vendors with **actionable remediation guidance**
- No automated scanning tools are used against production systems without consideration for impact
- **AI-assisted tooling** is transparently credited throughout this repository

---

## 📬 Contact

- **GitHub:** [@thanledinh](https://github.com/thanledinh)
- **Email:** [Your email]
- **Disclosure reports:** Sent directly to vendor security contacts

---

<div align="center">

*Independent security research · Responsible disclosure · AI-assisted tooling*

</div>
