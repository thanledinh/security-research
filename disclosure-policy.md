# Responsible Disclosure Policy

## Principles

This research is conducted under the following responsible disclosure principles:

1. **Good Faith** — All testing is performed with the intent of improving security, not causing harm
2. **Minimal Impact** — No denial-of-service, data exfiltration, or service disruption
3. **Vendor First** — Vulnerabilities are reported to the vendor before any public disclosure
4. **Reasonable Timeline** — Vendors receive a minimum 90-day window to address findings
5. **Sanitized Publication** — Published reports remove exploitable details, credentials, and specific endpoints

---

## Disclosure Process

```
Discovery → Documentation → Vendor Contact → Remediation Window → Publication
```

### Step 1: Discovery & Documentation
- Vulnerability is identified and verified
- Detailed report is prepared with:
  - Steps to reproduce
  - Evidence (sanitized screenshots, HTTP requests/responses)
  - Impact assessment
  - Remediation recommendations

### Step 2: Vendor Contact
- Report is sent to the vendor via:
  - Official security contact (security@, abuse@)
  - Bug bounty program (if available)
  - General support channels (as fallback)
- Report is sent encrypted when possible (PGP/GPG)

### Step 3: Remediation Window
- **Critical/High:** 30-day minimum before disclosure
- **Medium/Low:** 90-day minimum before disclosure
- Extensions are granted upon request if active remediation is in progress
- Re-testing is offered after fixes are deployed

### Step 4: Publication
- Published reports are sanitized:
  - No valid credentials or tokens
  - No specific exploitation code targeting the vendor
  - Infrastructure details are generalized
- Vendor is credited for fixes and cooperation
- Timeline is published for transparency

---

## Scope Limitations

The following are **out of scope** for this research:

- Social engineering or phishing
- Physical security testing
- Denial-of-service attacks
- Testing of systems without a reasonable legal basis
- Accessing, modifying, or deleting other users' data

---

## Legal

This research is conducted in compliance with applicable laws. The researcher:

- Uses only **standard user accounts** created for testing purposes
- Does not access systems beyond the minimum necessary to verify a vulnerability
- Does not store or transmit any personal data of other users
- Reports all findings to the affected vendor

---

## Contact

For questions about this disclosure policy or to report a security concern:

- **GitHub:** [@thanledinh](https://github.com/thanledinh)
- **Email:** thanle.webdev@gmail.com
