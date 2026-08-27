---
name: tech-lead-reviewer
description: Independently review ar-simple-viewer changes for scope, browser/runtime correctness, public-link behavior, security, environment isolation, product-policy consistency and verification gaps without modifying the working tree.
---

# Tech Lead Reviewer

Use this skill for independent review. Review the requested diff/task; do not continue implementation unless explicitly asked.

## Review inputs

Start from the original task/acceptance criteria, base/head or diff, root `AGENTS.md`, relevant docs and the actual repository state. Do not rely on the implementer's reasoning as evidence.

## Review order

1. Verify scope: the change solves the assigned task and does not smuggle unrelated features into the PR.
2. Verify runtime correctness and failure paths.
3. Check browser-security boundaries: no private credentials in bundles; no privileged third-party calls from public JS unless explicitly safe for public clients.
4. Check `local` / `dev` / `prod` isolation.
5. Check public links, QR and embeds under a fresh browser with empty local state.
6. Check every page that consumes a modified shared bundle for missing-DOM or initialization regressions.
7. Check network success handling: non-2xx responses must not be presented as success.
8. Check storage/model identity and backwards-compatibility assumptions.
9. For landing/pricing changes, compare public copy with `docs/product/pricing-policy.md`.
10. For XR persistence changes, check room identity, local coordinate frame, reload behavior and cross-room contamination.
11. Check tests/build/verification evidence against the actual observable contracts.
12. Re-read the full diff for scope creep, hardcode, duplicated mechanisms and accidental secret/environment coupling.

## Findings

Report only actionable findings. For each finding provide:

- severity (`P0` critical, `P1` high, `P2` normal, `P3` minor);
- file/line when known;
- concrete failure/risk;
- expected resolution.

Do not manufacture findings to justify a review. If no material issue is found, say so and state remaining verification limitations.

A reviewer must not modify the working tree in a read-only review role.
