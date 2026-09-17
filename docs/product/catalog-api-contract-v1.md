# Zobdino Catalog API Contract v1

## Purpose
Define the first product-facing contract between catalog data and UI.

## Endpoints

### GET /api/catalog
Returns preview-enabled catalog entries.

### GET /api/catalog/{episodeId}
Returns episode detail metadata.

## Episode fields

- id
- title
- language
- summaryPreview
- duration
- voices
- status

## Preview rules

```yaml
status: preview
humanApproved: false
productionAllowed: false
publishAllowed: false
```

## Audio

Supported preview voices:

- Sulafat
- Iapetus

The API must not expose public release URLs before approval.
