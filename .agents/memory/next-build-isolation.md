---
name: Next build isolation
description: Workflow constraint for reliable Next.js validation in this project.
---

Run `next build` only after stopping the development workflow, then restart the workflow after the build completes.

**Why:** The dev server and production build both write `.next`; overlapping them caused transient missing-chunk and stale-page errors that were not source-code failures.

**How to apply:** Stop `Start application`, run the production build, restart the workflow, and then perform live route or screenshot checks.