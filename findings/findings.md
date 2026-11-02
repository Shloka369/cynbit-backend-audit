
# Findings

Passive observation only (Chrome DevTools, single page load of https://www.cynbit.in).

| ID | Category | Finding | Evidence | Severity | Recommendation |
|----|----------|---------|----------|----------|----------------|
| F-01 | Security | Content-Security-Policy header not present | evidence/headers.txt | Medium | Add CSP (start in Report-Only mode) |
| F-02 | Security | X-Content-Type-Options not present | evidence/headers.txt | Low | Add `nosniff` |
| F-03 | Security | No X-Frame-Options / frame-ancestors (clickjacking) | evidence/headers.txt | Low-Medium | Add `frame-ancestors 'none'` or X-Frame-Options |
| F-04 | Security | Referrer-Policy and Permissions-Policy not present | evidence/headers.txt | Low | Add both headers |
| F-05 | Security | `access-control-allow-origin: *` on the HTML document | evidence/headers.txt | Low (informational) | Confirm it is not set on any API/data routes; restrict origins if so |
| F-06 | Security | HSTS present but without includeSubDomains/preload | evidence/headers.txt | Low | Add includeSubDomains; consider preload |
| F-07 | Privacy | Google Analytics 4 beacon (`collect?v=2&tid=G-...`, 204) fires on load. Verify whether a consent banner appears; delete this row if it does | Network screenshot | Low | Load analytics only after consent |
| F-08 | Data handling | Local storage holds only `cynbit_newsletter_seen=true`, no tokens or personal data | Application screenshot | None (positive) | None |
| F-09 | Performance | Brotli compression on, CDN cache HIT, ETag revalidation (304s) working | headers + Network | None (positive) | None |
| F-10 | Performance | Home page prefetches ~9 route payloads (`?_rsc=`), small (~4 kB) | Network screenshot | Info | Fine; keep prefetch limited to visible links |

## Positive observations
- HTTPS with HSTS (2-year max-age)
- No X-Powered-By header (no framework version leak)
- Hosted on Vercel edge (Mumbai, bom1) with static prerendering