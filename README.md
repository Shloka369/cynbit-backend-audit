# Cynbit Backend Audit (Backend Developer Intern Task)

Passive, authorized analysis of cynbit.in from a backend perspective.

- `REPORT.md` - full audit
- `findings/findings.md` - categorized findings table
- `evidence/` - redacted header dumps and screenshots
- `recommendations/express-hardening/` - runnable example (helmet, zod, rate limit, error format, CORS)

## Run the example
```bash
cd recommendations/express-hardening
npm install
npm start
curl -X POST localhost:3000/api/v1/contact -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"a@b.co\",\"message\":\"hello world 123\"}"
```
Scope: only what a normal browser receives. No scanning, fuzzing, load testing or exploitation.
