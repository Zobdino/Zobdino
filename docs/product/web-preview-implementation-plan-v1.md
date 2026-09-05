# Zobdino Web Preview v1 Implementation Plan

## Goal
Build the first user-testable Zobdino experience after Golden Pipeline v7.

## Routes

- `/catalog`
  - Show preview-ready books
  - Display title, cover, language, status

- `/catalog/:id`
  - Show episode details
  - Render summary preview
  - Render audio preview player

## Components

### BookCard
- title
- cover
- language
- preview status

### BookDetail
- episode metadata
- summary preview
- voice options

### PreviewAudioPlayer
- play/pause
- voice selector
- duration
- preview-only access

## Safety Boundary

```yaml
status: preview
humanApproved: false
productionAllowed: false
publishAllowed: false
```

## Next Implementation Steps

1. Create frontend routes
2. Connect catalog API contract
3. Add preview audio player
4. Deploy preview environment
