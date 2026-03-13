# Discovery Timeline
### Full Infrastructure Compromise via Multiple Vulnerabilities

---

## Story

This timeline documents the discovery process of a multi-layer vulnerability chain in a cloud hosting platform. What started as routine JavaScript analysis led to the discovery of 18 security issues across authentication, API, and infrastructure layers.

---

## Hour 0:00 — JavaScript Bundle Analysis

Downloaded 34 JavaScript chunks from the Next.js frontend. Identified one file (26KB) containing the complete API client with 100+ endpoints.

```
GET /portal/_next/static/chunks/3efe43e11898d514.js
→ Full API client: auth, billing, tickets, gameserver, admin, payments
→ Third-party integrations: Pterodactyl, Virtualizor, VestaCP
→ Internal Docker registry URLs referenced in code
```

**Finding:** Complete API attack surface map obtained without authentication.

---

## Hour 0:20 — API Endpoint Extraction

Parsed the JavaScript to enumerate all API routes. Categorized endpoints by access level:

| Category | Endpoints | Access |
|----------|-----------|--------|
| User & Auth | 8 | User |
| Billing & Payments | 15 | User/Admin |
| Game Servers | 25+ | User/Admin |
| Admin | 40+ | Admin only |

Started systematic testing of each endpoint category.

---

## Hour 0:45 — Authentication Endpoint Testing

Tested authentication security controls:

- ✅ JWT `none` algorithm — rejected (4 variants)
- ✅ JWT weak secrets — rejected (26 tested)
- ✅ Admin endpoints — all return 403
- ✅ Mass assignment (role, balance) — silently ignored
- 🔴 User enumeration via `/auth/lookup` — exists vs not exists

---

## Hour 1:10 — JWT Expiration Bypass Discovered

Noticed my token should have expired. Tested:

```
Token exp:  2026-03-10T00:00:00Z
Current:    2026-03-12T14:00:00Z  (2 days later)
API call:   GET /api/user
Result:     200 OK ← token should be rejected
```

Further testing confirmed:
- Expired tokens remain valid **indefinitely**
- Logging in again does not revoke previous tokens
- Password changes do not invalidate existing tokens

**Severity: 🔴 HIGH** — A stolen token grants permanent access.

---

## Hour 1:40 — Infrastructure IP References

Found IP addresses mentioned in API responses and DNS records:

```
SPF record:    v=spf1 ... ip4:103.95.196.91     ← mail server
crt.sh:        test1.zynhost.vn → 138.252.133.111  ← staging
configure-options: docker.zynhost.net:5000        ← registry
```

Three real IPs discovered behind Cloudflare CDN.

---

## Hour 2:10 — Service Scanning

Ran Nmap against discovered IP addresses:

```
138.252.133.111 (Staging):
  PORT     STATE SERVICE
  22/tcp   open  ssh         ← password auth!
  3306/tcp open  mysql       ← MariaDB 10.6.23
  8080/tcp open  http        ← API backend

103.95.196.91 (Mail):
  PORT     STATE SERVICE
  25/tcp   open  smtp
  443/tcp  open  https       ← MDaemon Webmail
  3000/tcp open  http        ← MDaemon Webmail
```

---

## Hour 2:30 — MariaDB Exposure Confirmed

Connected to MariaDB on the staging server from the public internet:

```
mysql-info:
  Version: 5.5.5-10.6.23-MariaDB-0ubuntu0.22.04.1
  Capabilities: SupportsLoadDataLocal   ← file read possible
  Auth Plugin: mysql_native_password    ← weaker auth
```

**Severity: 🔴 HIGH** — Database accessible from internet with `LOAD DATA LOCAL` enabled.

---

## Hour 3:00 — SSH with Password Authentication

Confirmed SSH accepts password authentication:

```
$ ssh root@138.252.133.111
root@138.252.133.111's password: _
```

Same server hosting the exposed database. SSL certificate confirms ownership: `CN=test1.zynhost.vn` (Let's Encrypt R12).

**Severity: 🔴 HIGH** — Brute force → full server access.

---

## Hour 3:30 — Stored XSS Discovery

Tested profile name field for input validation:

```
PUT /api/user/profile
{"name": "<script>alert('xss')</script>"}
→ 200 OK — stored in database without sanitization
```

React frontend auto-escapes HTML (mitigated client-side), but the backend stores raw HTML. Combined with JWT never expiring: **XSS steal token → permanent access**.

---

## Hour 4:00 — Docker & Command Injection Surface

The `configure-options` endpoint reveals Docker infrastructure:

```json
{
  "docker_image": "docker.zynhost.net:5000/java22",
  "startup": "bash \"$CUSTOM_STARTUP_SCRIPT\" && {{SERVER_START}}"
}
```

The `updateDockerImage` API endpoint could allow replacing the Docker image with an attacker-controlled one. If no whitelist is enforced → **RCE inside hosting infrastructure**.

*Untested — requires purchasing a game server.*

---

## Hour 5:00 — Report Finalized

Compiled all findings into a structured report:

| Severity | Count |
|----------|-------|
| 🔴 High | 4 |
| 🟡 Medium | 5 |
| 🔵 Info | 9 |
| ✅ Tests Passed | 13 |

**Report submitted to vendor.**

---

## Key Observation

The interesting aspect of this case is the **vulnerability chaining**. Each finding alone is concerning, but together they create a path from unauthenticated JavaScript access to potential full infrastructure compromise:

```
Public JS → API Map → JWT Bypass → XSS Token Theft → Never Expires
                                                    → Permanent Access
                    → Real IPs → Open DB → Open SSH → Server Compromise
                              → Docker URLs → Image Swap → Container RCE
```

This is a textbook example of **multi-layer misconfiguration** — no single catastrophic vulnerability, but a chain of moderate issues that compounds into critical risk.

---

📄 [Full Report →](report.md) · [Attack Chain →](attack-chain.md) · [Methodology →](methodology.md)
