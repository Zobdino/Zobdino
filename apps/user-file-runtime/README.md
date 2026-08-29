# Zobdino User-File Runtime

Issue #166.

## MVP architecture

The MVP intentionally does not use R2.

Flow:

1. User selects a file in the browser.
2. Supported content is extracted client-side.
3. Browser sends structured text sections to the Worker.
4. Worker validates section and content integrity.
5. D1 stores job metadata and extracted text sections.
6. AI / summary / audio stages consume the normalized job later.

## Runtime

- Cloudflare Worker
- Cloudflare D1
- no R2
- no payment-card-dependent storage

## Security

The Worker credential must never be embedded in the public static site.

The current protected API is for runtime smoke testing and trusted clients.

A browser-safe public ingestion boundary will be added separately before enabling production uploads.

## API

- GET /health
- POST /v1/jobs
- POST /v1/jobs/:jobId/content
- GET /v1/jobs/:jobId

## MVP formats

First browser-ingestion slice:
- TXT
- Markdown

Next:
- PDF browser extraction
- EPUB browser extraction
