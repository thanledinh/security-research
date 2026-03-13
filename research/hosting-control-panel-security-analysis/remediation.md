# Remediation Recommendations

## Priority: Immediate (Critical)

### 1. Enforce JWT Expiration Validation

**Finding:** VULN-01

**Action:**
- Enable `exp` claim validation in the JWT verification middleware
- Recommended token lifetime: 15–30 minutes (access token) with refresh token rotation
- Implement token blacklisting for logout and password change events

**Implementation (Go):**
```go
// Ensure the JWT library validates expiration
token, err := jwt.Parse(tokenString, keyFunc, jwt.WithExpirationRequired())
if err != nil {
    // Token is expired or invalid
    return unauthorized(c)
}
```

### 2. Restrict Staging Server Access

**Finding:** VULN-02, VULN-03

**Action:**
- Configure firewall rules to block public access to ports 3306 (MariaDB) and 22 (SSH)
- Restrict access to VPN or IP whitelist
- Disable `LOAD DATA LOCAL INFILE` in MariaDB configuration
- Migrate to `caching_sha2_password` authentication plugin

### 3. Implement Server-Side Input Sanitization

**Finding:** VULN-04

**Action:**
- Sanitize all user input fields on the server side before database storage
- Use an allowlist approach (alphanumeric, spaces, common Unicode characters)
- Add `Content-Security-Policy` headers to prevent inline script execution

---

## Priority: Short-Term (30 days)

### 4. Minimize API Information Disclosure

**Finding:** VULN-06

**Action:**
- Remove Docker registry URLs and startup command templates from the `/gameserver/configure-options` response
- Return only the minimum data required for the frontend (nest/egg names, location names)

### 5. Fix Error Handling

**Finding:** VULN-08

**Action:**
- Implement authorization checks before database queries in the VPS endpoints
- Return 403 Forbidden for unauthorized access, 404 Not Found for missing resources
- Never expose database error messages to clients

### 6. Remove Dangling DNS Records

**Finding:** VULN-09

**Action:**
- Audit all DNS records and remove entries pointing to decommissioned infrastructure
- Implement a DNS record lifecycle process tied to server provisioning/decommissioning

### 7. Generic Authentication Responses

**Finding:** VULN-05

**Action:**
- Return identical responses for `/auth/lookup` regardless of account existence
- Example: `{"message": "If this account exists, a verification email has been sent"}`

---

## Priority: Long-Term (90 days)

### 8. Separate Admin API Client

**Finding:** VULN-07

**Action:**
- Implement code splitting to ensure admin-only API client code is not included in user-facing JavaScript bundles
- Consider lazy-loading admin routes behind authentication checks

### 9. Update Reverse DNS

**Finding:** VULN-12

**Action:**
- Update reverse DNS PTR records to reflect current brand

### 10. Implement Security Headers

**Action:**
- `Content-Security-Policy: default-src 'self'; script-src 'self'`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### 11. Remove Debug Information

**Finding:** VULN-10

**Action:**
- Remove or restrict `/health` endpoint version disclosure in production
- Suppress OpenResty server identification in error responses
