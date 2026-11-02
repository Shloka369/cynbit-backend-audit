# Backend Technical Audit: Cynbit

Target: https://www.cynbit.in | Date: 2 Nov 2026 | Author: Shloka Sonawane

## 1. Scope and methodology
Passive observation only, using Chrome DevTools (Network, Application, Lighthouse) on https://www.cynbit.in. Only what a normal browser receives during ordinary page loads was inspected. No exploitation, scanning, fuzzing, load testing, brute force, or access to unlinked endpoints. No credentials or personal data were collected.

## 2. Architecture overview
Next.js (App Router) hosted on Vercel, served from the Mumbai edge region (`bom1`). Pages are statically prerendered (`x-nextjs-prerender: 1`) and cached at the CDN (`x-vercel-cache: HIT`). The client prefetches route data for linked pages using React Server Component requests (`?_rsc=`). Google Analytics 4 is used for analytics. No custom REST API was observed on page load.

Request flow:

```
Browser -> Vercel edge/CDN (bom1, cache HIT, Brotli)
        -> prerendered HTML + RSC payloads
        -> client-side route prefetch (?_rsc=)
        -> GA4 beacon (collect?v=2)
```

## 3. API analysis

| Method | URL pattern | Status | Purpose | Notes |
|--------|-------------|--------|---------|-------|
| GET | /<route>?_rsc=<hash> | 200 / 304 | Next.js RSC route prefetch (story, team, careers, impact, services, products, contact, case-studies, ai-agents-business-operations) | Revalidation via 304 works; payloads are small (about 0.1 to 2.7 kB each) |
| GET | google-analytics.com/g/collect?v=2&tid=G-... | 204 | GA4 analytics beacon | Third party; consent handling not verified |

Storage: Local storage holds only `cynbit_newsletter_seen=true` (a UI flag). No tokens or personal data were found in storage. Cookies and form submission endpoints were not inspected in this pass.

## 4. Findings
Full table: [findings/findings.md](findings/findings.md). Raw response headers: [evidence/headers.txt](evidence/headers.txt).

Summary:
- Security: security headers beyond HSTS are missing (CSP, X-Content-Type-Options, frame protection, Referrer-Policy, Permissions-Policy); permissive CORS on the HTML document.
- Performance: server delivery is healthy, but mobile FCP is 8.1 s and LCP is 10.5 s due to render-blocking resources and heavy JavaScript.
- Accessibility: contrast, list markup, and heading order issues.
- Positive: HTTPS with HSTS, Brotli, CDN caching, no `X-Powered-By`, no sensitive data in browser storage.

## 5. Performance

Lighthouse (single run, Mobile, Navigation mode, 2 Nov 2026, https://www.cynbit.in/):

| Category | Score |
|----------|-------|
| Performance | 57 |
| Accessibility | 82 |
| Best Practices | 100 |
| SEO | 100 |

| Metric | Value | Status |
|--------|-------|--------|
| First Contentful Paint | 8.1 s | Poor |
| Largest Contentful Paint | 10.5 s | Poor |
| Speed Index | 8.1 s | Poor |
| Total Blocking Time | 0 ms | Good |
| Cumulative Layout Shift | 0 | Good |

Main contributors reported by Lighthouse:
- Render-blocking requests: estimated savings of 6,390 ms
- Reduce unused JavaScript: estimated savings of 120 KiB
- Legacy JavaScript: estimated savings of 11 KiB
- JavaScript execution time 3.9 s; main-thread work 9.1 s
- 20 long main-thread tasks
- LCP breakdown and network dependency tree flagged

Server-side signals are healthy (CDN cache HIT, Brotli, ETag revalidation, nearby edge region). The slowness appears to be client-side: render-blocking resources and heavy JavaScript delay first paint, and the filmstrip shows a blank page for the first frames. This is a single lab run on throttled Mobile settings, so absolute numbers vary between runs; the pattern is the finding.

## 6. Recommended improvements

| Finding | Improvement | Code |
|---------|-------------|------|
| F-01 to F-04, F-06 | Add CSP (start in Report-Only), nosniff, frame-ancestors, Referrer-Policy, Permissions-Policy, fuller HSTS | [recommendations/nextjs-security-headers/next.config.js](recommendations/nextjs-security-headers/next.config.js) |
| F-05 | Restrict CORS to known origins on any API route | [recommendations/express-hardening/server.js](recommendations/express-hardening/server.js) |
| F-07 | Load analytics only after user consent | Consent gating before GA loads |
| F-11 to F-14 | Optimize the LCP image, remove render-blocking assets, code-split JavaScript, modern build target | [recommendations/nextjs-performance/page-example.jsx](recommendations/nextjs-performance/page-example.jsx) |
| F-15, F-16 | Fix contrast, link styling, list and heading semantics | Markup and CSS changes |
| General | Server-side validation, rate limiting, and a consistent error format for any form endpoint | [recommendations/express-hardening/server.js](recommendations/express-hardening/server.js) |

A strict CSP can break scripts and styles, so test it in `Content-Security-Policy-Report-Only` mode first.

## 7. Limitations
Passive observation only; backend internals are inferred from headers and network behaviour. Cookies, form submission endpoints, and 404 behaviour were not inspected in this pass. Lighthouse results come from one lab run. Things that looked fine (HTTPS with HSTS, compression, CDN caching, no `X-Powered-By`, no sensitive data in storage) are reported as such rather than padded into findings.