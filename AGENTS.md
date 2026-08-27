# Repository Agent Instructions

## Scope and source of truth

These instructions apply to the entire repository. More specific `AGENTS.md` files may add local rules but must not contradict this file.

This repository must remain equally maintainable by Codex CLI, Claude Code and Gemini CLI. No provider is the canonical development agent.

Provider entry points are intentionally thin:

- Codex CLI reads root `AGENTS.md` directly.
- Claude Code enters through `.claude/CLAUDE.md`, which imports this file.
- Gemini CLI enters through `GEMINI.md`, which imports this file.

Shared engineering policy and skills belong in provider-neutral files (`AGENTS.md`, `.agents/skills/`). Do not duplicate shared rules under provider-specific directories.

Before non-trivial work, read:

1. `AGENTS.md`.
2. Relevant product/architecture documentation under `docs/`.
3. `docs/product/pricing-policy.md` when pricing, plans, landing copy or commercial boundaries are affected.
4. The relevant skill under `.agents/skills/`.
5. The affected and adjacent code before editing.

## Project direction

`ar-simple-viewer` is a browser-first 3D/AR/XR product built around JavaScript, Three.js / model-viewer / WebXR, webpack bundles, Yandex Object Storage content and a small .NET backend for server-owned operations.

The product must stay usable as a simple web integration: public links, QR flows and embeds must work without requiring the recipient to possess the creator's browser state.

Do not turn this repository into a new framework or platform rewrite unless the owner explicitly requests it. Prefer incremental evolution of the existing product.

## Engineering rules

1. Inspect before editing. Understand existing ownership, page entry points, bundle usage and adjacent code before changing behavior.
2. Ask what established browser/platform solution already exists before inventing a custom mechanism.
3. Reuse suitable existing helpers and abstractions. Do not create parallel utilities for the same concept.
4. Make the smallest coherent change that completes the assigned task. Do not implement downstream features speculatively.
5. Do not add abstractions, frameworks, compatibility layers or extension points without a concrete current requirement.
6. Avoid unrelated cleanup in feature commits.
7. Keep deterministic mechanics in code. Do not introduce AI/LLM dependencies for behavior that normal application code can own.
8. Preserve explicit error handling at network, storage, parsing and XR boundaries. Do not silently convert failure into success.
9. A successful Promise chain is not proof of a successful HTTP operation: check `response.ok` / expected status before reporting success.
10. User-visible failure states must be truthful. Do not show a success notification before the underlying operation is confirmed.

## Hardcode and configuration rules

1. Do not hardcode business policy, pricing, environment routing, deployment hosts, recipient addresses, storage paths or feature policy in multiple call sites.
2. Pricing and commercial copy must follow `docs/product/pricing-policy.md`. Do not reintroduce retired prices or plan names by copying old HTML.
3. `local`, `dev` and `prod` environments must stay isolated. Environment-specific storage namespaces/folders must never be silently redirected to another environment.
4. Configuration values must have one clear owner. If a value differs by environment, keep it in environment configuration rather than scattering conditionals through application code.
5. Secrets must never be shipped in browser bundles. Any value imported into frontend JavaScript must be treated as public and recoverable by a visitor.
6. Operations requiring a private credential belong behind a server-owned boundary. Use the existing backend when suitable instead of calling privileged third-party APIs directly from the browser.
7. If a browser-side credential is intentionally public, it must be explicitly designed for public-client use and limited to the minimum required permissions. Never assume obscurity in bundled JavaScript protects it.
8. Example IDs, URLs, model names and demo values are acceptance/demo data, not hidden production policy.

## Browser and page invariants

1. Check every HTML page that consumes a modified webpack entry. Shared bundles must not assume DOM nodes that exist on only one page.
2. DOM lookup for optional/page-specific elements must be guarded, or page-specific behavior must use a separate entry point.
3. Public `viewer.html` / AR links and QR links must work in a fresh browser with empty `localStorage` when the URL contains enough identity to resolve the model.
4. Creator-local state may improve UX but must not be the only source of truth for a shared link.
5. Do not break existing URLs without an explicit migration/redirect decision.
6. Preserve desktop/mobile behavior unless the assigned task intentionally changes it.
7. Do not disable zoom, scrolling, accessibility or browser gestures globally without a concrete XR interaction need and verification on affected pages.

## Storage and model data

1. Keep model identity explicit. Do not infer a model from ambient browser state when an ID is available in the URL or persisted object.
2. When adding a parent/project/folder identifier to a public link, consume that identifier all the way through the data-loading path; do not dereference `localStorage` first and fail before using it.
3. Reads and writes must use the environment's intended namespace.
4. Do not broaden object-storage write/list permissions to solve a frontend design problem.
5. Treat user/project/model persistence formats as contracts. Changes require compatibility consideration and targeted verification.

## XR / room persistence rules

1. AR session world coordinates are not durable room coordinates across sessions.
2. Persistent placement must use an explicit room-local reference frame / calibration contract.
3. Stored room layouts must have identity (`roomId`/project identity or equivalent). A single global local-storage slot is not an acceptable multi-room persistence model.
4. Loading a saved room must never silently attach objects from an unrelated room/project.
5. Experimental XR behavior must be clearly isolated from stable public flows until its persistence and recovery behavior is verified.

## Product and security boundaries

1. `docs/product/pricing-policy.md` is the current source of truth for launch pricing until deliberately revised by the owner.
2. Manual 3D production, configurator work and custom integration are separate commercial concerns; do not accidentally bundle them in UI copy or code.
3. Frontend validation is UX, not a trust boundary. Any server-owned operation must validate its own inputs as appropriate.
4. Never expose SMTP/API private credentials, unrestricted storage credentials or other server secrets through webpack configuration.
5. Do not log secrets or personal contact data unnecessarily.

## Tests and verification

1. Unit/targeted deterministic checks are the default when practical.
2. Do not introduce or run live-provider/end-to-end/integration tests without explicit owner approval.
3. Build the affected target when build tooling is available. For frontend changes, use the relevant npm/webpack build (`build`, `build-dev` or `build-prod`) for the environment being changed.
4. For shared frontend bundles, verify every consuming page, not only the new landing page.
5. For public-link changes, verify with empty local storage / fresh-session assumptions.
6. For environment changes, explicitly verify that local/dev/prod resolve to their intended namespaces and endpoints.
7. For network forms, verify both success and non-2xx failure behavior.
8. Before declaring work complete, inspect the full diff for scope creep, hardcode, duplicated mechanisms, exposed secrets and accidental environment coupling.
9. Report exactly what was checked. A green build alone is not acceptance when runtime/browser behavior is the actual contract.

## Review rules

Independent review must evaluate repository state and the actual diff, not the implementer's explanation.

Review in this order:

1. Scope and task acceptance.
2. Runtime correctness and failure behavior.
3. Security / credential exposure.
4. Environment isolation.
5. Public-link and fresh-browser behavior.
6. Shared bundle / page regressions.
7. Pricing/documentation consistency when commercial UI changed.
8. XR persistence correctness when spatial state changed.
9. Verification evidence.

Use severities `P0` critical, `P1` high, `P2` normal, `P3` minor. Findings must be concrete and actionable.

## Skills

- Implementation and refactoring: `.agents/skills/web-xr-engineer/SKILL.md`.
- Independent code review: `.agents/skills/tech-lead-reviewer/SKILL.md`.

Use the relevant skill in addition to this file. Skills specialize workflow but do not override repository rules or expand task scope.

## Git rules

1. Do not commit, push, create branches or open pull requests unless explicitly requested.
2. When Git writes are requested, use the requested branch and keep commits focused.
3. Never force-push unless explicitly requested and justified.
4. Do not claim a commit, branch, build or test result exists without verifying it.
