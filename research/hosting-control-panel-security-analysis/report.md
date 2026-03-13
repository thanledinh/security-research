# Hosting Control Panel — Security Analysis Report

## Executive Summary

This report documents the findings from a security assessment of a cloud hosting control panel and its associated infrastructure. The assessment was conducted over four days (March 9–12, 2026) using a standard user account.

The platform provides cloud VPS, Minecraft game server hosting, and web hosting services. It utilizes a Next.js frontend behind Cloudflare CDN/WAF and a Go-based REST API backend.

**18 vulnerabilities** were identified across authentication, API security, and infrastructure layers. The most critical finding involves JWT tokens that remain valid indefinitely — even after expiration, logout, or password changes — enabling persistent unauthorized access if a token is compromised.

All findings have been reported to the vendor via responsible disclosure.

---

## Summary of Findings

| Severity | Count | Key Findings |
|----------|-------|-------------|
| 🔴 **High** | 4 | JWT expiration bypass, exposed database, exposed SSH, stored XSS |
| 🟡 **Medium** | 5 | User enumeration, API map disclosure, Docker registry leak, dangling DNS, improper error handling |
| 🔵 **Info** | 9 | Version disclosure, SPF IP leak, certificate transparency, subdomain exposure |

---

## Attack Surface Discovery

### Frontend Reconnaissance

The application frontend is built with **Next.js** (Turbopack) and served behind **Cloudflare** CDN with Turnstile CAPTCHA. Anti-debugging measures (`disable-devtool`) are deployed but can be bypassed.

**JavaScript Bundle Analysis:**  
A single JavaScript chunk (26KB) was found to contain the complete API client implementation, exposing:
- 100+ API endpoints with full method signatures
- Authentication and authorization flow
- Admin-only functionality (user management, payments, system settings)
- Third-party integration details (Pterodactyl, Virtualizor, VestaCP)
- Payment processing logic

### Infrastructure Discovery

| Component | Technology | Discovery Method |
|-----------|-----------|-----------------|
| Frontend | Next.js + Turbopack | HTTP headers |
| API Backend | Go + GORM | Error response format, `/health` endpoint |
| Reverse Proxy | OpenResty | Error response on malformed requests |
| Database (staging) | MariaDB 10.6.23 | Nmap service detection |
| Mail Server | MDaemon | Shodan, port scanning |
| Docker Registry | Private registry (port 5000) | API response disclosure |
| CDN/WAF | Cloudflare | DNS, HTTP headers |

**Real IP Discovery:**  
Three non-Cloudflare IP addresses were identified through:
- SPF DNS records (`v=spf1 ... ip4:x.x.x.x`)
- Certificate Transparency logs (crt.sh)
- Subdomain DNS resolution

**Subdomain Enumeration:**  
110+ subdomains were discovered across two domains (current and legacy brand) via certificate transparency logs, revealing historical infrastructure including server nodes, game panels, Docker registries, and internal services.

---

## Vulnerability Details

### VULN-01: JWT Token Expiration Not Enforced

| Attribute | Value |
|-----------|-------|
| **Severity** | 🔴 High |
| **Category** | Authentication |
| **CVSS 3.1** | 7.4 (High) |

**Description:**  
The API accepts JWT tokens after their `exp` (expiration) claim has passed. Additionally, tokens are not revoked upon logout or password change.

**Verification:**  
A token with `exp: 2026-03-10` was successfully used to access authenticated endpoints on 2026-03-12 — two full days after expiration. After logging in with new credentials, the previous token remained functional.

**Impact:**  
A compromised token provides indefinite access to the victim's account. Standard remediation actions (password reset, logout) do not revoke the attacker's access.

---

### VULN-02: Staging Database Exposed to Internet

| Attribute | Value |
|-----------|-------|
| **Severity** | 🔴 High |
| **Category** | Infrastructure |
| **CVSS 3.1** | 7.2 (High) |

**Description:**  
A staging server, identified via certificate transparency (`CN=test1.[redacted]`), exposes MariaDB 10.6.23 on port 3306 to the public internet.

**Technical Details:**
- Authentication plugin: `mysql_native_password` (weaker than `caching_sha2_password`)
- `SupportsLoadDataLocal` capability enabled — allows arbitrary file read upon successful authentication
- The server auto-blocks IPs after approximately 20 failed connection attempts

---

### VULN-03: Staging SSH Exposed with Password Authentication

| Attribute | Value |
|-----------|-------|
| **Severity** | 🔴 High |
| **Category** | Infrastructure |
| **CVSS 3.1** | 7.2 (High) |

**Description:**  
The same staging server exposes SSH (port 22) with password authentication enabled. The SSL certificate confirms ownership (`CN=test1.[redacted]`, issued by Let's Encrypt R12).

---

### VULN-04: Stored XSS in User Profile

| Attribute | Value |
|-----------|-------|
| **Severity** | 🔴 High |
| **Category** | Input Validation |
| **CVSS 3.1** | 6.1 (Medium) — elevated due to chain with VULN-01 |

**Description:**  
The profile update endpoint stores arbitrary HTML without sanitization:

```http
PUT /api/user/profile
Content-Type: application/json

{"name": "<script>alert(document.cookie)</script>"}
→ 200 OK
```

**Current Mitigation:** The React frontend auto-escapes HTML during rendering, preventing execution in the primary web interface.

**Chain Risk:** If the stored name is rendered without escaping in any secondary context (email templates, PDF invoices, admin panels using server-side rendering), the script executes. Combined with VULN-01 (tokens never expire), a successful XSS attack yields **permanent account access**.

---

### VULN-05: User Enumeration via Authentication Endpoint

| Attribute | Value |
|-----------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Authentication |

**Description:**  
The `/auth/lookup` endpoint returns distinct responses based on whether an email address is registered, enabling account enumeration.

---

### VULN-06: Internal Infrastructure Disclosed via Public API

| Attribute | Value |
|-----------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Information Disclosure |

**Description:**  
The `/gameserver/configure-options` endpoint returns internal infrastructure details to any authenticated user:

- Private Docker registry URLs (`docker.[redacted]:5000`)
- Docker image names and versions
- Server location identifiers
- Complete JVM startup commands with environment variable names
- Legacy infrastructure references

This information facilitates targeted attacks if an attacker gains internal network access.

---

### VULN-07: Complete API Client Exposed in JavaScript Bundle

| Attribute | Value |
|-----------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Information Disclosure |

**Description:**  
A single JavaScript file contains the complete API client with 100+ endpoints, including admin-only endpoints, providing a comprehensive map of the application's attack surface.

---

### VULN-08: Improper Error Handling

| Attribute | Value |
|-----------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Error Handling |

**Description:**  
The VPS endpoint returns HTTP 500 with a database error message when accessed with invalid resource IDs, suggesting the ownership check occurs after the database query rather than before.

---

### VULN-09: Dangling DNS Record

| Attribute | Value |
|-----------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Infrastructure |

**Description:**  
A DNS A record points to an IP address that may no longer be under the vendor's control, creating a potential subdomain takeover vector.

---

### VULN-10 to VULN-18: Informational Findings

| # | Category | Finding |
|---|----------|---------|
| 10 | Version Disclosure | Health endpoint returns backend name and version |
| 11 | Technology Disclosure | Reverse proxy identity revealed via malformed requests |
| 12 | DNS Hygiene | Reverse DNS not updated after brand migration |
| 13 | IP Exposure | Mail server IP discoverable via SPF record |
| 14 | Third-party Disclosure | Payment gateway verification token in DNS TXT |
| 15 | Service Exposure | Webmail interface accessible on non-standard port |
| 16 | Subdomain Exposure | 110+ subdomains discoverable via certificate transparency |
| 17 | Data Exposure | Internal server specifications in public product API |
| 18 | Data Exposure | Unnecessary internal field in user profile response |

---

## Security Controls Verified

The following controls were tested and found to be **correctly implemented**:

| Control | Method | Result |
|---------|--------|--------|
| JWT signature strength | 26 weak secrets tested | All rejected |
| JWT algorithm restriction | `none` algorithm variants | All rejected |
| Admin authorization | 20+ admin endpoints | All return 403 |
| Mass assignment protection | Unauthorized fields in profile update | Silently ignored |
| SQL injection prevention | Classic, union, time-based blind | No injection (parameterized queries) |
| Payment validation | Negative/zero amounts | Correctly blocked |
| IDOR on game servers | Cross-user resource access | 403 ownership check |
| CVE exposure | Nuclei scan (12,000+ checks) | 0 matches |
| Configuration file exposure | `.env`, `.git`, config files | All 404 or WAF-blocked |

---

📄 [Technical Analysis →](technical-analysis.md) · [Impact Assessment →](impact.md) · [Remediation →](remediation.md) · [Timeline →](timeline.md)
