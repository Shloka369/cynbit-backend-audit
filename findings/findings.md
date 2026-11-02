# Findings

Passive observation only (Chrome DevTools and Lighthouse, https://www.cynbit.in, 2 Nov 2026).

Severity scale: High = data exposure or auth weakness; Medium = missing protection or clear user impact; Low = hardening or best practice; Info = noted for context.

## Security

| ID | Category | Finding | Evidence | Severity | Recommendation |
|----|----------|---------|----------|----------|----------------|
| F-01 | Security | `Content-Security-Policy` header not present | evidence/headers.txt | Medium | Add CSP, starting in Report-Only mode |
| F-02 | Security | `X-Content-Type-Options` not present | evidence/headers.txt | Low | Add `nosniff` |
| F-03 | Security | No `X-Frame-Options` / `frame-ancestors` (clickjacking protection) | evidence/headers.txt | Low-Medium | Add `frame-ancestors 'none'` or `X-Frame-Options: DENY` |
| F-04 | Security | `Referrer-Policy` and `Permissions-Policy` not present | evidence/headers.txt | Low | Add both headers |
| F-05 | Security | `access-control-allow-origin: *` on the HTML document | evidence/headers.txt | Low (informational) | Confirm it is not set on API/data routes; restrict origins if it is |
| F-06 | Security | HSTS present but without `includeSubDomains` / `preload` | evidence/headers.txt | Low | Add `includeSubDomains`; consider preload |

## Privacy and data handling

| ID | Category | Finding | Evidence | Severity | Recommendation |
|----|----------|---------|----------|----------|----------------|
| F-07 | Privacy | Google Analytics 4 beacon (`collect?v=2&tid=G-...`, 204) fires on page load; consent handling not verified | Network tab screenshot | Low | Load analytics only after consent (relevant to DPDP Act / GDPR) |
| F-08 | Data handling | Local storage holds only `cynbit_newsletter_seen=true`; no tokens or personal data | Application tab screenshot | None (positive) | None |

## Performance

| ID | Category | Finding | Evidence | Severity | Recommendation |
|----|----------|---------|----------|----------|----------------|
| F-09 | Performance | Brotli compression, CDN cache HIT, and ETag revalidation (304s) working | headers.txt, Network tab | None (positive) | None |
| F-10 | Performance | Home page prefetches about 9 route payloads (`?_rsc=`), small in size | Network tab screenshot | Info | Acceptable; keep prefetching limited to visible links |
| F-11 | Performance | Mobile FCP 8.1 s and LCP 10.5 s (both Poor); Performance score 57 | evidence/lighthouse-mobile.png | Medium | Optimize the LCP element, use `next/image` with `priority` for the hero |
| F-12 | Performance | Render-blocking requests (estimated 6,390 ms savings) | Lighthouse Insights | Medium | Inline critical CSS, defer non-critical CSS/JS, use `next/font` with `display: swap` |
| F-13 | Performance | About 120 KiB unused JavaScript, 3.9 s JS execution, 20 long main-thread tasks | Lighthouse Diagnostics | Medium | Code-split with dynamic imports, lazy-load below-the-fold components, remove unused libraries |
| F-14 | Performance | Legacy JavaScript shipped (estimated 11 KiB savings) | Lighthouse Insights | Low | Update the build target / browserslist to modern browsers |

## Accessibility

| ID | Category | Finding | Evidence | Severity | Recommendation |
|----|----------|---------|----------|----------|----------------|
| F-15 | Accessibility | Insufficient color contrast; links distinguishable by color alone | Lighthouse Accessibility | Low-Medium | Meet WCAG AA contrast (4.5:1); underline inline links |
| F-16 | Accessibility | Invalid list markup (`li` outside `ul`/`ol`, non-`li` children in lists) and headings out of order | Lighthouse Accessibility | Low | Use correct semantic lists and a sequential heading order |

## Positive observations
- HTTPS with HSTS (2-year max-age)
- No `X-Powered-By` header (no framework version leak)
- Hosted on Vercel edge (Mumbai, bom1) with static prerendering
- Best Practices 100 and SEO 100 in Lighthouse
- No sensitive data in browser storage

## Not covered in this pass
Cookies, form submission endpoints, and 404 behaviour were not inspected.