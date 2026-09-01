# Review checklist — Issue #152 quota-paused state

- [x] Deterministic quota classifier
- [x] Offline self-test using the real free-tier failure signature
- [x] Quota-safe generation wrapper
- [x] Dedicated checkpoint workflow
- [x] Durable `.dual-voice` artifact on quota pause
- [x] Machine-readable `quota-paused.json`
- [x] Generic transient 429 remains non-quota
- [x] Non-quota failures remain failures
- [x] No production release/promotion in the quota-safe workflow
- [ ] Repository CI green
- [ ] Live checkpoint-resume validation after merge
