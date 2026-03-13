# Research Methodology

## Overview

This document describes the structured approach used for web application and infrastructure security assessments. The methodology draws from established frameworks including the [OWASP Testing Guide v4.2](https://owasp.org/www-project-web-security-testing-guide/) and the [Penetration Testing Execution Standard (PTES)](http://www.pentest-standard.org/).

---

## Phase 1: Reconnaissance

### Passive Reconnaissance
- **Certificate Transparency:** Query crt.sh for historical SSL certificates to discover subdomains
- **DNS Analysis:** Enumerate A, MX, TXT, NS, CNAME records via Google DoH (`dns.google`)
- **SPF/DKIM Records:** Extract real IP addresses from email authentication records
- **Shodan/Censys:** Identify exposed services, open ports, and technology fingerprints
- **WHOIS:** Registration details, nameserver configuration, registrar information

### Active Reconnaissance
- **Subdomain Brute Force:** Dictionary-based enumeration with concurrency control
- **Technology Fingerprinting:** HTTP headers, error pages, JavaScript framework detection
- **WAF Identification:** Cloudflare, AWS WAF, and similar CDN/WAF fingerprinting

---

## Phase 2: Surface Mapping

### Frontend Analysis
- **JavaScript Bundle Download:** Automated download of all JS chunks via authenticated session
- **Static Analysis:** Extract API endpoints, routes, authentication patterns from minified code
- **Secret Detection:** Scan for hardcoded tokens, API keys, internal URLs
- **Build Configuration:** Identify frameworks (Next.js, React, Vue), build tools, source maps

### API Discovery
- **Endpoint Enumeration:** Map all API routes from JavaScript analysis and documentation
- **HTTP Method Testing:** Test each endpoint with GET, POST, PUT, PATCH, DELETE
- **Parameter Analysis:** Identify required/optional parameters, data types, validation rules
- **Authentication Flow:** Document login, token refresh, session management mechanisms

---

## Phase 3: Vulnerability Testing

### Authentication & Session
| Test | Technique |
|------|-----------|
| JWT None Algorithm | Forge token with `{"alg": "none"}` header |
| JWT Weak Secrets | Brute force HMAC secret with common wordlist |
| JWT Expiration | Verify server-side `exp` claim validation |
| Token Revocation | Test token validity after logout / password change |
| Algorithm Confusion | Attempt RS256 → HS256 substitution |

### Authorization & Access Control
| Test | Technique |
|------|-----------|
| IDOR | Access resources using other users' identifiers |
| Privilege Escalation | Attempt admin endpoints with user token |
| Mass Assignment | Submit unauthorized fields (role, balance, permissions) |
| Path Bypass | Admin path variations (/admin, /ADMIN, /admin./) |

### Injection
| Test | Technique |
|------|-----------|
| SQL Injection | Classic, union-based, time-based blind |
| Stored XSS | HTML/JS injection in persistent fields (profile, tickets) |
| Command Injection | Shell metacharacters in parameters |
| Path Traversal | `../../etc/passwd` in file operations |

### Business Logic
| Test | Technique |
|------|-----------|
| Payment Manipulation | Negative amounts, zero values, currency switching |
| Race Conditions | Concurrent requests to state-changing endpoints |
| Discount Abuse | Invalid/expired codes, stacking, parameter tampering |

---

## Phase 4: Infrastructure Assessment

### Network
- **Port Scanning:** Nmap SYN scan on discovered IPs (top 1000 + targeted full scan)
- **Service Fingerprinting:** Version detection on open ports
- **SSL/TLS Analysis:** Certificate details, cipher suites, protocol support

### Services
- **Database Exposure:** Test connectivity to MySQL/MariaDB (3306), PostgreSQL (5432)
- **Docker Registry:** Probe port 5000 for unauthenticated catalog access
- **SSH Configuration:** Password authentication, key-based auth, version
- **Debug Endpoints:** `/debug/pprof/`, `/metrics`, `/debug/vars`

### Configuration
- **Sensitive Files:** `.env`, `.git/config`, `config.json`, backup files
- **Directory Listing:** Test for unprotected directory browsing
- **CVE Scanning:** Nuclei templates against discovered service versions

---

## Phase 5: Impact Analysis

- Assess each finding against **CVSS v3.1** scoring criteria
- Identify **exploit chains** (e.g., XSS + JWT no-expiry = persistent account takeover)
- Classify severity: Critical, High, Medium, Low, Informational
- Document realistic attack scenarios and affected user populations

---

## Phase 6: Reporting & Disclosure

- Prepare structured report with executive summary, technical details, and remediation
- Contact vendor through official security channels
- Provide **90-day** remediation window before public disclosure
- Sanitize published reports to remove exploitable details

---

## Tools

| Tool | Purpose | Type |
|------|---------|------|
| Nmap | Port scanning, service detection | CLI |
| Puppeteer | Web crawling, Cloudflare bypass | Node.js |
| Nuclei | CVE and misconfiguration scanning | CLI |
| Hydra | Credential testing (controlled) | CLI |
| Custom scripts | API testing, JWT attacks, recon | Node.js (AI-assisted) |
| Shodan | Internet-wide service discovery | Web |
| crt.sh | Certificate transparency logs | Web |
| Google DoH | DNS resolution and enumeration | API |

> 🤖 Custom tooling is developed with AI assistance (Google Gemini). The researcher directs all testing decisions, target selection, and analysis.
