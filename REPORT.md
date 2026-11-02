# Backend Technical Audit: Cynbit

## 1. Scope and methodology
Passive observation only, using Chrome DevTools (Network, Application, Console) and Lighthouse on https://www.cynbit.in. Only what a normal browser receives was inspected. No exploitation, scanning, fuzzing, load testing, or access to unlinked endpoints. Date: 2 Nov 2026.

## 2. Architecture overview
Next.js (App Router) hosted on Vercel, served from the Mumbai edge region (bom1). Pages are statically prerendered (`x-nextjs-prerender: 1`) and cached at the CDN (`x-vercel-cache: HIT`). The client prefetches route data for linked pages using React Server Component requests (`?_rsc=`). Google Analytics 4 is used for analytics. No custom REST API was observed on page load.

Request flow: Browser -> Vercel edge/CDN (cache HIT) -> prerendered HTML + RSC payloads -> client-side route prefetch -> GA4 beacon.

## 3. API analysis

| Method | URL pattern | Status | Purpose | Notes |
|--------|-------------|--------|---------|-------|
| GET | /<route>?_rsc=<hash> | 200 / 304 | Next.js RSC route prefetch | Revalidation via 304 works; payloads are small |
| GET | google-analytics.com/g/collect?v=2&tid=G-... | 204 | GA4 beacon | Third party; check consent handling |

Local storage holds only `cynbit_newsletter_seen=true` (a UI flag). No tokens or personal data were found in storage.

## 4. Findings
See [findings/findings.md](findings/findings.md). Raw headers: [evidence/headers.txt](evidence/headers.txt).

## 5. Performance
- Brotli compression enabled (`content-encoding: br`)
- CDN cache HIT with ETag revalidation (304 responses on prefetches)
- Route prefetches are small (about 4 kB combined on the home page)
- Lighthouse (Mobile): Performance XX, Accessibility XX, Best Practices XX, SEO XX

## 6. Recommended improvements
| Finding | Improvement | Code |
|---------|-------------|------|
| F-01 to F-04, F-06 | Add CSP (start Report-Only), nosniff, frame-ancestors, Referrer-Policy, Permissions-Policy, fuller HSTS | recommendations/nextjs-security-headers/next.config.js |
| F-05 | Restrict CORS to known origins on any API route | recommendations/express-hardening/server.js |
| F-07 | Load analytics only after consent | Consent gating before GA loads |
| General | Server-side validation, rate limiting and consistent errors for form endpoints | recommendations/express-hardening/server.js |

A strict CSP can break scripts and styles, so test it in `Content-Security-Policy-Report-Only` mode first.

## 7. Limitations
Passive observation only; backend internals are inferred from headers and network behaviour. Things that looked fine (HTTPS with HSTS, compression, CDN caching, no X-Powered-By, no sensitive data in storage) are reported as such rather than padded into findings.