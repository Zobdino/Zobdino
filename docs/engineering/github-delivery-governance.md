# Zobdino GitHub Delivery Governance

Status: active engineering contract
Tracking issue: #156

## Purpose

Every meaningful Zobdino implementation slice must be auditable from idea to release inside GitHub. Chat decisions are not a substitute for repository evidence.

## Required lifecycle

1. **Issue** — define problem, scope, acceptance criteria, safety boundary and release impact.
2. **Branch** — create a dedicated feature/fix/chore branch linked to the issue.
3. **Commits** — keep commits atomic and descriptive; no direct feature work on `main`.
4. **Draft PR** — open early and link the issue.
5. **CI evidence** — record the relevant workflow run and require green checks before merge.
6. **Code review** — record a review or review comment on the PR. Material findings must be resolved before merge.
7. **Ready transition** — move the PR out of Draft only after implementation and CI gates are satisfied.
8. **Squash merge** — merge to `main` with a traceable title and issue/PR relationship.
9. **Post-merge verification** — confirm `main` CI and any required deployment/media verification.
10. **GitHub Release / prerelease** — publish when a merged slice changes user-visible behavior, release contracts, media contracts, production workflows, product capabilities, or a material engineering capability relied upon by production.
11. **Release evidence** — release notes must include issue, PR, merge SHA, CI evidence, production/media impact, migration or rollback boundary, and explicitly state when production was not changed.

## Release cadence rule

Merged release-worthy work must not accumulate indefinitely without a GitHub Release. A release gap audit is required whenever release-worthy changes exist after the latest published release.

The release version does not need to imply production promotion. Infrastructure and controlled pipeline work may ship as a prerelease when the repository contract changes but public media/player promotion remains gated.

## What is release-worthy

Publish a Release or prerelease when at least one of these changes:

- public or preview product behavior;
- catalog/player/voice behavior;
- production workflow semantics;
- media generation, QA, checkpoint or resume contract;
- canonical voice or metadata contract;
- deployment or release safety behavior;
- a material bug fix affecting production correctness.

Documentation-only clarifications that do not change an operational contract may be batched into the next release.

## Release-note template

```md
## <Release title>

Tracks: #<issue>
PR: #<pr>
Merge SHA: `<sha>`
CI: <run id / result>

### Shipped
- ...

### Production / media impact
- ...

### Safety / rollback
- ...

### Next gate
- ...
```

## Current release-gap baseline

As of 2026-08-26, the latest published GitHub Release is `v0.2.0-beta.5.1.20`, published 2026-08-18. Since then, multiple release-worthy changes have merged, including preview product wiring, the Atomic Habits production cover repair, the approved Zobdino voice contract, durable free-tier checkpoint state, and quota-paused TTS failure state.

These changes must be represented in the next prerelease before the current delivery cycle is considered complete.

## Enforcement

For future implementation work, completion means **Issue → Branch → Commits → Draft PR → CI → Code Review → Ready → Merge → Post-merge verification → Release when release-worthy**.

A task is not considered fully shipped merely because code was committed or merged.
