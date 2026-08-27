# Zobdino User-File Runtime

Isolated processing runtime for Issue #166.

## Runtime boundary

The public Zobdino website remains statically deployed.

Private user files are handled only by this Worker runtime.

## Storage

- Cloudflare R2: private source and generated artifacts
- Cloudflare D1: durable job state
- Worker Secret: runtime bearer credential

## Current API

- `GET /health`
- `POST /v1/jobs`
- `PUT /v1/jobs/:jobId/source`
- `POST /v1/jobs/:jobId/extract`
- `GET /v1/jobs/:jobId`

## Security

- private-by-default objects
- SHA-256 verification before accepting source files
- declared file-size verification
- explicit rights confirmation
- bearer authentication
- fail-closed processing stages

## Current extraction

Direct runtime extraction:
- TXT
- Markdown

Routed to dedicated extraction workers:
- PDF
- EPUB
