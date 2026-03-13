# Technical Analysis

## Authentication Architecture

The application uses **JWT (HS256)** bearer tokens for API authentication. Tokens are stored in browser cookies (`access_key`) with a 7-day browser expiry.

### JWT Token Structure

```
Header:  {"alg": "HS256", "typ": "JWT"}
Payload: {
  "user_id":  "UUID",
  "email":    "",
  "role":     "user",
  "iss":      "[redacted]-backend",
  "sub":      "username",
  "aud":      ["[redacted]-backend"],
  "exp":      unix_timestamp,
  "nbf":      unix_timestamp,
  "iat":      unix_timestamp
}
```

### Expiration Bypass Analysis

The JWT `exp` claim is set to approximately **24 hours** after issuance. However, the backend does not validate this claim during request processing:

| Time | Token Status | API Response |
|------|-------------|--------------|
| `iat` (issue time) | Valid | 200 OK |
| `exp` (24h later) | Should be invalid | 200 OK ← vulnerability |
| `exp` + 48 hours | Should be invalid | 200 OK ← vulnerability |
| After password change | Should be revoked | 200 OK ← vulnerability |
| After re-login | Old token should be revoked | 200 OK ← vulnerability |

**Root Cause:** The backend likely verifies the JWT **signature** but does not validate the `exp` claim, or the validation library's expiration check is disabled/misconfigured.

---

## API Architecture

### Backend Stack
- **Language:** Go
- **ORM:** GORM (confirmed via error message format)
- **Reverse Proxy:** OpenResty (Nginx-based)
- **API Prefix:** `/api`
- **Version:** `1.0.0` (from `/health` endpoint)

### API Client Exposure

The frontend JavaScript bundle contains a complete API client object with method definitions for:

| Category | Endpoint Count | Access Level |
|----------|---------------|-------------|
| User & Auth | 8 | User |
| Billing & Payments | 15 | User/Admin |
| Tickets | 14 | User/Admin |
| Game Servers | 25+ | User/Admin |
| VPS | 12 | User/Admin |
| Admin (Users, Roles, Permissions) | 18 | Admin |
| System (Settings, Webhooks, Emails) | 20+ | Admin |
| Blog, Cart, Services | 15 | Mixed |

---

## Infrastructure Architecture

### Network Topology (Observed)

```
Internet
  │
  ├── Cloudflare CDN/WAF
  │     ├── portal.[redacted] (Next.js frontend)
  │     └── api-production.[redacted] (Go backend)
  │
  ├── Mail Server (IP: discovered via SPF)
  │     └── MDaemon Webmail (ports: 25,110,143,465,587,993,995,3000)
  │
  ├── Staging Server (IP: discovered via crt.sh)
  │     ├── Port 22:   SSH (password auth)
  │     ├── Port 3306: MariaDB 10.6.23
  │     └── Port 8080: API (same codebase, separate database)
  │
  └── Docker Registry (internal, not internet-accessible)
        ├── docker.[current-domain]:5000
        └── docker.[legacy-domain]:5000
```

### Staging Server Details

| Attribute | Value |
|-----------|-------|
| OS | Ubuntu 22.04 LTS |
| Database | MariaDB 10.6.23 |
| Auth Plugin | mysql_native_password |
| Capabilities | SupportsLoadDataLocal (file read risk) |
| SSL Certificate | Let's Encrypt R12, CN=test1.[redacted] |
| API | Same codebase as production, separate user database |

### Docker Configuration

The `configure-options` endpoint reveals complete Docker integration:

- **Registry:** Private registry on port 5000 (not internet-exposed)
- **Images:** `java22`, `graalvm-22-jdk`, `python_3.12`, `nodejs_21`, `debian`
- **Startup:** Full command templates with environment variable interpolation
- **Platform:** Pterodactyl Panel for game server orchestration

---

## Exploit Chain Analysis

### Chain 1: Persistent Account Takeover (Theoretical)

```
Stored XSS (VULN-04) → Token Theft → Permanent Access (VULN-01)
```

1. Attacker sets profile name to JavaScript payload
2. If name is rendered without escaping in any context (email, PDF, admin panel)
3. Victim's JWT token is exfiltrated
4. Token provides permanent access — no expiration, no revocation

**Prerequisites:** A rendering context that does not escape HTML (currently mitigated by React frontend auto-escaping).

### Chain 2: Infrastructure Reconnaissance → Targeted Attack (Theoretical)

```
API Disclosure (VULN-06) → Docker URLs → Internal Network Mapping
                        → Startup Commands → Command Injection Surface
```

If an attacker gains access to the internal network (e.g., via compromised game server container), the disclosed Docker registry URLs and startup command templates provide a roadmap for lateral movement.
