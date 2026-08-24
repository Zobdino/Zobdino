# Zobdino Preview v1 Data Wiring

## Routes

- /catalog
- /catalog/as-a-man-thinketh

## Data Flow

CatalogGrid -> getPreviewCatalog()

BookDetail -> getPreviewBook()

PreviewAudioPlayer -> preview audio metadata

## Validation

- Build must pass
- Preview state remains locked
- Public release remains disabled
