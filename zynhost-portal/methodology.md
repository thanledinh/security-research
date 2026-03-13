# Methodology
### Zynhost Portal — Case-Specific Approach

---

## Recon

### JavaScript Bundle Analysis
- Downloaded all Next.js static chunks via Puppeteer (Cloudflare bypass)
- Identified API client file through file size analysis (26KB — unusually large for a utility)
- Extracted endpoint definitions, HTTP methods, and parameter structures
- Mapped authentication flow: cookie-based JWT → Bearer token → API calls

### DNS & Infrastructure
- Google DoH queries for A, MX, TXT, NS, CNAME records
- SPF record analysis → mail server IP extraction
- Certificate Transparency via crt.sh → 110+ subdomains
- Reverse DNS → legacy brand references

---

## Authentication Testing

### JWT Security
| Test | Method | Result |
|------|--------|--------|
| None algorithm | `{"alg":"none"}` with empty signature | ✅ Rejected |
| Weak secrets | 26 common secrets via HMAC forge | ✅ All rejected |
| Expiration | Use token after `exp` claim | 🔴 **Accepted** |
| Revocation | Use old token after re-login | 🔴 **Accepted** |
| Password change | Use token after credential change | 🔴 **Accepted** |

### Session Persistence
- Tokens stored in `access_key` cookie with 7-day browser expiry
- Server does not maintain a token blacklist
- No refresh token rotation mechanism observed

---

## API Testing

### Access Control
- Tested 20+ admin endpoints with user token → all 403
- IDOR testing with random UUIDs → gameserver returns 403, VPS returns 500
- Mass assignment testing (role, balance, is_staff) → silently ignored

### Input Validation
- SQL injection: classic, union, time-based blind → no injection (parameterized)
- Stored XSS: profile name → stored without sanitization
- Path traversal: not testable without file management access

### Business Logic
- Payment: negative/zero amounts → blocked
- Currency: locked after initial selection
- Discount codes: validation endpoint functional
- Race conditions: tested on bulk operations → no observable race

---

## Infrastructure Discovery

### Real IP Discovery
| Method | IP Found | Service |
|--------|----------|---------|
| SPF DNS record | 103.95.196.91 | Mail server (MDaemon) |
| crt.sh + DNS A | 138.252.133.111 | Staging (API + DB + SSH) |
| API config response | docker.[redacted]:5000 | Docker registry (internal) |

### Port Scanning
Nmap SYN scan on discovered IPs:

**Staging (138.252.133.111):**
- 22/tcp — SSH (OpenSSH, password auth)
- 3306/tcp — MariaDB 10.6.23 (Ubuntu 22.04)
- 8080/tcp — HTTP API (same codebase)

**Mail (103.95.196.91):**
- 25, 110, 143, 465, 587, 993, 995 — standard mail ports
- 443, 3000 — MDaemon Webmail

---

## Impact Analysis

### Exploit Chain Construction
Mapped individual findings into compound attack scenarios:

1. **XSS → JWT theft → Permanent access** (VULN-01 + VULN-04)
2. **crt.sh → Real IP → DB brute force → Data breach** (VULN-02)
3. **API disclosure → Docker URLs → Image swap → RCE** (VULN-06)

### CVSS Scoring
Applied CVSS v3.1 scoring to each finding, with adjustments for chain impact.

---

## Tools Used

| Tool | Purpose |
|------|---------|
| Nmap | Port scanning, service fingerprint |
| Puppeteer | Cloudflare bypass crawling |
| Nuclei | CVE scanning (12K+ checks) |
| Hydra | SSH/MySQL credential testing |
| Custom Node.js scripts | API testing, JWT attacks, recon |
| crt.sh | Certificate transparency |
| Shodan InternetDB | Quick IP intel |
| Google DoH | DNS enumeration |

> 🤖 Custom scripts developed with AI assistance (Google Gemini)

---

📄 [Full Report →](report.md) · [Attack Chain →](attack-chain.md) · [Timeline →](timeline.md)
