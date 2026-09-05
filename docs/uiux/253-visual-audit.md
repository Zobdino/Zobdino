# Zobdino UI/UX Visual Audit — Issue #253

Baseline: Product Completion RC `v0.2.0-rc.1` / source `c32bc8969968521dfea3b2800a3dc4924a12f70d`
Live target: `https://zobdino.ir/`
Audit Run: `33901438259`
Artifact: `9947812833`
Digest: `sha256:1ea1d8678e039863abfac19ff43b4cb41ccb1a2ecb2e9f2e3f265994df43e6c9`

## Measured baseline

- 8 routes captured at desktop 1440px and mobile 390px = 16 screenshots.
- HTTP failures: 0.
- Horizontal overflow failures: 0.
- Unlabelled buttons: 0.
- Images without alt: 0.
- Mobile homepage document height: 7,222px.
- Mobile Atomic Habits document height: 15,880px.
- Mobile Features document height: 7,448px.
- Desktop homepage contains 20 card-like surfaces; Features contains 38.

## Priority findings

### P0 — Product narrative is dominated by engineering state
The homepage gives large visual priority to RC/media/QA/development status. This is valuable evidence but it is not the primary user job. Move engineering evidence into a compact trust/status surface and make the main narrative about transforming a book/document into a concise Persian summary, source evidence, and listenable audio.

### P0 — Primary CTA points to listening instead of the product creation journey
The verified core journey starts with upload, but the hero primary CTA currently sends users to `/books`. The redesign must make `/upload` the dominant action and keep catalog/listening as a secondary path.

### P1 — Excessive cardification and weak hierarchy
The RC shell uses many similarly weighted rounded bordered containers. The homepage has 20 card-like surfaces and Features has 38. This flattens hierarchy and makes proof, navigation, product capability and content feel equally important. Use fewer containers, larger compositional regions and stronger type/space hierarchy.

### P1 — Mobile pages are too long
The mobile homepage is 7,222px and the Atomic Habits detail is 15,880px. Content must be progressively disclosed and repeated metadata/status reduced. The book detail needs a strong sticky/compact player and clearer Summary / Evidence / Audio navigation.

### P1 — Brand/product distinction is too generic
The purple accent is recognizable, but the current visual language is mostly generic dark SaaS cards. Establish a Zobdino-specific editorial/audio visual thesis: calm reading surfaces, confident Persian typography, book/evidence motifs and restrained purple as a signal rather than a fill everywhere.

### P1 — Book cards have inconsistent visual weight
Missing/placeholder covers create large empty navy rectangles while one real cover becomes visually dominant. Cards should use a deliberate cover fallback system, consistent aspect ratio, compact status treatment and clearer title/author/audio hierarchy.

### P2 — Mixed Persian/English engineering vocabulary leaks into product UI
Labels such as AI, Automation, MVP, Release Candidate, immutable, media and variant appear prominently. Keep technical proof where useful, but user-facing hierarchy should be Persian-first and task-oriented.

### P2 — Footer and mobile navigation consume too much low-value space
Mobile footer is 555px. Simplify navigation, group secondary links, and make the header/mobile menu support the core journeys: تبدیل فایل، کتابخانه، امکانات, درباره.

## Strengths to preserve

- Correct RTL and `lang=fa` across all audited pages.
- No measured horizontal overflow at 1440/390.
- No unlabeled buttons in the audit.
- No missing image alt attributes in the audit.
- Existing dark/light architecture.
- Verified dual-voice player behavior and canonical media contracts.
- Existing responsive route structure and stable public URLs.

## Redesign thesis

**Zobdino is a Persian book-intelligence workspace, not an engineering dashboard.**

The experience should feel editorial, intelligent and audio-native: a user gives Zobdino a document, sees what matters, verifies where it came from, and listens in the voice they prefer. Product proof remains visible but subordinate to this journey.

## First implementation slice

1. design tokens and global surface/type rhythm
2. header + mobile navigation + footer
3. homepage hero with Upload as primary CTA
4. capability story: Summary → Evidence → Audio → Private Library
5. compact verified dual-voice proof
6. simplified curated-library preview
7. preserve all existing routes/runtime/player contracts
