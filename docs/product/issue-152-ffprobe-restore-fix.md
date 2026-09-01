# Issue #152 — quota-safe restore ffprobe fix

Run `33516098632` failed before generation because `dual-voice-resume-seed.mjs` requires `ffprobe`, while the quota-safe workflow did not install or verify the FFmpeg runtime before restoring a checkpoint.

This fix:

- installs FFmpeg when `ffmpeg` or `ffprobe` is unavailable;
- verifies both binaries before checkpoint restore;
- creates `.dual-voice` before restore so a restore-stage failure can still produce a durable failure artifact;
- does not change production audio, release assets, voice selection, or source content.

Validation target after merge: rerun `batch-a-atomic` with `resume_run_id=33511885553` and confirm restore reaches generation without regenerating already verified segments.
