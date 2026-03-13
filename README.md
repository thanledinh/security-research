# 🔒 Security Research

<div align="center">

![Security Research](https://img.shields.io/badge/Security-Research-critical?style=for-the-badge&logo=hackthebox&logoColor=white)
![Responsible Disclosure](https://img.shields.io/badge/Responsible-Disclosure-blue?style=for-the-badge&logo=shield&logoColor=white)
![Bug Bounty](https://img.shields.io/badge/Bug_Bounty-Writeups-orange?style=for-the-badge&logo=bugcrowd&logoColor=white)

</div>

---

## Independent Security Research

This repository documents real-world vulnerability research conducted on public web infrastructures.

Each case study includes:
- Vulnerability discovery methodology
- Proof of concept
- Impact analysis
- Remediation recommendations

The goal is to demonstrate practical application security skills including:
- Web security testing
- Infrastructure enumeration
- Vulnerability chaining
- Responsible disclosure

> 🤖 Tooling is developed with AI assistance (Google Gemini). The researcher directs all target selection, execution, analysis, and disclosure decisions.

---

## 📂 Case Studies

### 🔴 [Full Infrastructure Compromise via Multiple Vulnerabilities](zynhost-portal/)
**Zynhost Portal — Cloud Hosting Provider**

A multi-layer misconfiguration chain discovered across authentication, API, and infrastructure layers of a cloud hosting platform. The vulnerability chain enables potential full infrastructure compromise through JWT bypass, exposed databases, and Docker misconfiguration.

| Metric | Value |
|--------|-------|
| Findings | 18 total (4 High · 5 Medium · 9 Info) |
| Attack Chain | 8 stages → full infrastructure compromise |
| Real IPs Behind CDN | 3 discovered |
| API Endpoints Mapped | 100+ |
| Subdomains Found | 110+ |
| Duration | 5 hours active testing |
| Status | Reported to vendor |

**Key Vulnerabilities:**
- JWT tokens valid indefinitely (no expiration enforcement)
- MariaDB 10.6 exposed to internet on staging
- SSH with password auth exposed
- Stored XSS in profile fields
- Docker registry URLs and startup commands leaked
- Complete API map in JavaScript bundle

📄 [Full Report →](zynhost-portal/report.md) · [Attack Chain →](zynhost-portal/attack-chain.md) · [Timeline →](zynhost-portal/timeline.md)

---

## 🧪 Methodology

Research follows a structured approach based on [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) and [PTES](http://www.pentest-standard.org/):

| Phase | Focus |
|-------|-------|
| **Recon** | DNS, crt.sh, Shodan, SPF record analysis |
| **Surface Mapping** | JavaScript static analysis, API endpoint extraction |
| **Auth Testing** | JWT manipulation, session persistence, token lifecycle |
| **Injection** | SQLi, XSS, command injection, path traversal |
| **Infrastructure** | Real IP discovery, port scanning, service fingerprinting |
| **Impact** | Exploit chaining, CVSS scoring, business risk |

📄 [Detailed Methodology →](zynhost-portal/methodology.md)

---

## 📜 Disclosure Policy

- Vendors are contacted **before** any publication
- Minimum **90-day** remediation window
- Published reports are **sanitized** — no live exploits
- Findings reported with **actionable remediation guidance**

📄 [Full Policy →](disclosure-policy.md)

---

## 🛠️ Tools

Reusable security testing tools (AI-assisted development):

| Tool | Purpose |
|------|---------|
| [`crawl_webapp.js`](tools/crawl_webapp.js) | Cloudflare bypass crawler + JS analysis |
| [`test_api_basic.js`](tools/test_api_basic.js) | IDOR, privilege escalation, mass assignment |
| [`test_api_advanced.js`](tools/test_api_advanced.js) | JWT attacks, SQLi, race conditions |
| [`recon_infrastructure.js`](tools/recon_infrastructure.js) | Subdomain enum, DNS recon |
| [`bruteforce_paths.js`](tools/bruteforce_paths.js) | Hidden path discovery |
| [`test_real_ip.js`](tools/test_real_ip.js) | Direct IP testing (CDN bypass) |

---

## 📁 Repository Structure

```
security-research/
│
├── README.md
├── disclosure-policy.md
│
├── zynhost-portal/                   # Case Study
│   ├── report.md                     # Full vulnerability report
│   ├── attack-chain.md               # Multi-stage attack visualization
│   ├── timeline.md                   # Discovery timeline (story format)
│   ├── methodology.md                # Case-specific methodology
│   └── screenshots/
│
└── tools/                            # Reusable security tools
    ├── crawl_webapp.js
    ├── test_api_basic.js
    ├── test_api_advanced.js
    ├── recon_infrastructure.js
    ├── bruteforce_paths.js
    ├── test_real_ip.js
    └── wordlist_paths.txt
```

---

## 📬 Contact

- **GitHub:** [@thanledinh](https://github.com/thanledinh)
- **Email:** thanle.webdev@gmail.com

---

<div align="center">

*Independent security research · Responsible disclosure · AI-assisted tooling*

</div>
