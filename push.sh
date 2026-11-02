#!/usr/bin/env bash
# Run after replacing TODOs with real observations
set -e
git init -b main
git add README.md && git commit -m "docs: add README and scope"
git add REPORT.md && git commit -m "docs: add audit methodology and report structure"
git add findings evidence && git commit -m "docs: add findings table and header evidence"
git add recommendations && git commit -m "feat: add express hardening example (helmet, zod, rate limit, errors)"
git add -A && git commit -m "chore: finalize" || true
git remote add origin https://github.com/Shloka369/cynbit-backend-audit.git
git push -u origin main
