# Disclosure Timeline

| Date | Event |
|------|-------|
| **2026-03-09** | Initial reconnaissance — Cloudflare bypass, JavaScript bundle analysis |
| **2026-03-09** | API endpoint discovery — 100+ endpoints mapped from JS static analysis |
| **2026-03-09** | Vulnerability testing — JWT attacks, SQL injection, XSS, IDOR, race conditions |
| **2026-03-12** | Infrastructure reconnaissance — crt.sh, DNS records, Shodan, SPF analysis |
| **2026-03-12** | Real IP discovery — 3 non-Cloudflare IPs identified |
| **2026-03-12** | Port scanning — MariaDB and SSH exposure confirmed on staging server |
| **2026-03-12** | JWT expiration bypass confirmed — token valid 2 days past `exp` claim |
| **2026-03-12** | Docker infrastructure disclosure identified via configure-options endpoint |
| **2026-03-13** | Security report finalized |
| **2026-03-13** | **Report submitted to vendor** |
| 2026-XX-XX | Vendor acknowledgment *(pending)* |
| 2026-XX-XX | Remediation deployed *(pending)* |
| 2026-XX-XX | Public disclosure *(90-day window)* |

---

## Communication Log

| Date | Channel | Action |
|------|---------|--------|
| 2026-03-13 | [Channel used] | Initial disclosure report sent |
| — | — | *Awaiting vendor response* |

---

## Notes

- All testing was performed with a **standard user account**
- No automated exploitation tools were used against production systems
- No data was exfiltrated, modified, or shared
- No denial-of-service conditions were created
- The vendor has been given **90 days** from the date of disclosure to address findings before public disclosure is considered
