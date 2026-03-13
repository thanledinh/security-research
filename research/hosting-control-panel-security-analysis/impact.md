# Impact Assessment

## Risk Matrix

| Finding | Confidentiality | Integrity | Availability | Overall |
|---------|:-:|:-:|:-:|:-:|
| VULN-01: JWT No Expiration | High | Medium | Low | **High** |
| VULN-02: Database Exposed | High | High | Medium | **High** |
| VULN-03: SSH Exposed | High | High | High | **High** |
| VULN-04: Stored XSS | Medium | Low | None | **Medium** (High in chain) |
| VULN-05: User Enumeration | Low | None | None | **Medium** |
| VULN-06: Infra Disclosure | Medium | None | None | **Medium** |
| VULN-07: API Map Exposure | Medium | None | None | **Medium** |
| VULN-08: Error Handling | Low | None | None | **Low** |
| VULN-09: Dangling DNS | Medium | Medium | None | **Medium** |

---

## Business Impact

### Account Security (VULN-01 + VULN-04)

Token theft via any channel (XSS, network interception, device compromise) results in **indefinite unauthorized access**. Standard incident response actions — forcing password resets and session invalidation — are ineffective because:

- Expired tokens remain valid
- Password changes do not revoke existing tokens  
- No mechanism exists to invalidate specific tokens

**Affected users:** All registered platform users.

### Infrastructure Risk (VULN-02, VULN-03)

The staging server shares the same application codebase as production. Compromise of the staging environment could expose:

- Application source code and configuration
- Database schema (useful for crafting SQL injection or understanding business logic)
- Shared secrets (if JWT signing keys are reused between environments)

### Information Disclosure (VULN-06, VULN-07)

Exposure of internal Docker registry URLs, image names, startup commands, and the complete API map significantly reduces the effort required for a targeted attack. An attacker with this information can:

- Map the full application architecture without active scanning
- Identify specific technology versions for CVE exploitation
- Understand admin functionality for privilege escalation attempts

---

## Affected Components

| Component | Vulnerabilities | Risk Level |
|-----------|----------------|:----------:|
| Authentication System | VULN-01 | 🔴 High |
| Staging Infrastructure | VULN-02, VULN-03, VULN-09 | 🔴 High |
| User Input Handling | VULN-04 | 🟡 Medium |
| Authentication Endpoint | VULN-05 | 🟡 Medium |
| API Configuration | VULN-06, VULN-07, VULN-08 | 🟡 Medium |
| DNS Configuration | VULN-09 | 🟡 Medium |
| General Hardening | VULN-10 to VULN-18 | 🔵 Info |
