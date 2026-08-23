# Zobdino Web Preview v1 Implementation Checklist

## Goal
Enable the first internal product test experience.

## Routes

- `/catalog`
- `/catalog/:id`

## Components

- BookCard
- BookDetail
- PreviewAudioPlayer

## Data

- catalog metadata
- episode summary preview
- voice selection
- preview audio references

## Release Safety

- status: preview
- humanApproved: false
- productionAllowed: false
- publishAllowed: false

## Validation

- UI rendering
- metadata contract
- audio preview flow
