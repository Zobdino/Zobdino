# Free-Tier TTS Checkpoint Contract

Tracks Issue #152.

## State machine

`running` → `quota-paused` → `running` → completion.

A 429 / `RESOURCE_EXHAUSTED` / quota-exceeded response is capacity exhaustion, not a corrupt production batch. The runner must persist successful work before stopping and must never promote partial media.

## Durable unit

The durable key is book slug + role + provider voice + SHA-256 of exact spoken text. A segment is reusable only when this identity matches and a recorded output path exists. Production integration must additionally verify the output digest/file before reuse.

## Persistence

Checkpoint writes are atomic (`.tmp` + rename). The checkpoint is machine-readable JSON and is intended to be included in the failed/paused GitHub Actions artifact so a later `resume_run_id` can restore it.

GitHub Actions artifacts are the cross-run persistence boundary; they are not a dependency cache.

## Promotion rule

No partial or quota-paused run may publish product metadata or replace the current production audio. Sulafat + Schedar are promoted only after both final assets pass existing audio QA and immutable release verification.

## Next integration step

Wire this module into `dual-voice-render.mjs` at the per-segment synthesis boundary, verify digest before reuse, and make the workflow upload the checkpoint for both failure and controlled quota pause.