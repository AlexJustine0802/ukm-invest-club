# Parahyangan Finance Club Website Rebrand  Design

**Date:** 2026-07-06
**Goal:** Restyle the public site to match the two attached mockups (Home + About) and the `color.jpeg` palette. Switch from dark navy/gold to light blue/white. Public site only  admin dashboard untouched.

## Palette (from color.jpeg)

Tailwind config swaps to:

- `primary`  DEFAULT `#144DC8`, dark `#103FA5`, light `#DCE9FF` (replaces `gold`'s role: buttons, links, active nav, accents)
- `navy` retinted to neutral text/surface family  DEFAULT `#1E293B` (Text Primary), light `#334155`, dark `#0F172A` (footer bg). Class names `text-navy`/`bg-navy` keep working, tone changes.
- `slate` (Tailwind default) used for secondary text `#64748B`, borders `#E2E8F0`, page bg `#F8FAFC`.
- Status colors added: `success #16A34A`, `warning #F59E0B`, `error #DC2626`, `info #0EA5E9`.
- Remove `gold`, `emerald`.

`globals.css`: `btn-primary` → blue bg / white text. `btn-secondary` → white bg, primary border/text. Body bg `#F8FAFC`. prose links → primary. `input`/`label` focus → primary.

## Shared components

- **Navbar**  light (`bg-white/95` + backdrop blur, bottom border). Blue logo mark. Nav order: Home, About, Research, Events, Gallery, Contact. **News removed** (was never a real page; "Research" label points to existing `/publications`). Active link `text-primary` w/ underline. "Join Us" primary button. Search icon (decorative, `lucide-react`).
- **Footer**  dark (navy-dark bg), recolored hovers to primary. Keep existing 3-column structure (brand, Explore, Connect). No fake Resources column, no non-functional newsletter box.
- **PageHeader**  light variant: `bg-primary-light` tint, `text-navy` title, primary eyebrow. Used by Events/Publications/Gallery/Contact/About.

## Home page (rebuild sections)

1. **Hero**  2-col. Left: eyebrow, headline "Empowering Future Investors" (Future in primary), subtext, 2 CTAs (Explore Research → /publications, View Events → /events). Right: static **Market Overview** card  hardcoded IHSG number, inline SVG line chart, 4-stat row (from real DB counts where cheap), ticker row. Purely decorative, no API.
2. **About strip**  "Building Knowledge, Creating Impact" + text + image placeholder + "Learn More" link.
3. **Latest Research**  3 newest publications via existing `PublicationCard` (restyled), "View All" link.
4. **Upcoming Events**  existing `EventCard` (restyled) or dark date-box variant.
5. **Impact stats**  4 icon stats: Members, Research, Events, Partners (Partners hardcoded, rest DB counts). Uses `lucide-react` icons.
6. **Partners**  wordmark text placeholders (Mandiri Sekuritas, BNI, CGS CIMB, Trimegah, Mirae Asset, ajaib, IDX).

## About page (rebuild sections)

1. **Hero**  "ABOUT US" eyebrow, big title, subtext, 3-stat card row (350+/120+/40+  hardcoded illustrative).
2. **Who We Are / Vision / Mission**  intro text panel + Vision card + Mission checklist card.
3. **Our Journey**  vertical timeline 2020 → 2024+ (hardcoded milestones, icons).
4. **Our Divisions**  5 cards: Investment Analyst, Media & Creative, Human Resource, Partnership, Event & Program (hardcoded).
5. **Meet Team**  existing DB team, horizontal cards w/ role badge + linkedin/mail icons.
6. **Partners**  same wordmark strip as Home.

## Data

DB-driven (unchanged queries): team, events, publications, counts. Everything else (market widget, journey, divisions, vision/mission copy, partner names, big "+" stat labels) is hardcoded static content living in the page files.

## Dependency

Add `lucide-react` for ~15 line icons across mockups (cheaper than hand-drawing).

## Out of scope

Admin dashboard styling, real market-data API, real partner logo images (text placeholders now), News page, newsletter subscribe.
