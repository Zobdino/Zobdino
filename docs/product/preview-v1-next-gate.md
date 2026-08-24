# Preview v1 — Visual + Playback Gate

## Objective
Turn the currently deployed book-detail preview into a reliable human-testable slice.

## Acceptance criteria

- [ ] Atomic Habits cover renders without broken-image fallback.
- [ ] Cover URL returns HTTP 200 in production.
- [ ] Audio source uses an explicit production origin/configuration.
- [ ] Player can start and pause a real preview track.
- [ ] Seek/progress state works.
- [ ] Duration is correct.
- [ ] Missing or failed audio produces a deliberate user-facing error state.
- [ ] Desktop RTL layout passes visual review.
- [ ] Mobile RTL layout passes visual review.
- [ ] No console/runtime errors during the core book → play flow.

## Release decision
Do not label Preview v1 complete until every P0 acceptance criterion above is verified against the deployed production URL.
