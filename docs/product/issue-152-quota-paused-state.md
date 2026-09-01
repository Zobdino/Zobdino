# Issue #152 — quota-paused execution contract

This slice turns explicit Gemini free-tier quota exhaustion into a controlled, auditable pause without discarding verified dual-voice checkpoints.

## Contract

- Explicit `quota_exceeded` / `RESOURCE_EXHAUSTED`, or a 429 carrying quota language, is classified as `quota-paused`.
- Generic transient 429 responses remain ordinary retryable provider failures and are not silently converted into quota pauses.
- The quota-safe runner delegates generation to the existing `dual-voice-render.mjs` implementation; it does not alter narration semantics.
- On quota exhaustion, `.dual-voice/quota-paused.json` is persisted and the runner exits with `EX_TEMPFAIL` (75).
- The quota-safe workflow converts exit 75 into a successful controlled-pause job state, uploads the complete `.dual-voice` checkpoint tree, verifies the manifest, and deliberately skips release/promotion.
- Non-quota generation failures remain failures.
- A completed generation is handed off to the existing QA/release workflow; this slice does not publish production audio.

## Safety boundary

No current production audio metadata or release asset is changed by this implementation. Existing verified checkpoints remain reusable, and incomplete output cannot be promoted by the quota-safe workflow.
