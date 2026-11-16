---
name: Dorian Black
description: Synth-pop from the city after dark. Near-black rooms lit by magenta, violet and blue neon.
colors:
  void: "#04000a"
  void-2: "#0a0512"
  surface: "#120a1c"
  surface-2: "#1c1128"
  surface-border: "#2e1f3d"
  field-border: "#7a6c94"
  ink-1: "#f3eef9"
  ink-2: "#b8aec9"
  ink-3: "#9389a8"
  magenta: "#f900f9"
  magenta-hover: "#ff33ff"
  blue: "#0168ff"
  violet: "#ae00f8"
  cyan: "#22d3f7"
  cyan-hover: "#7fe8fb"
  success: "#00f5a0"
  error: "#ff3366"
typography:
  display:
    fontFamily: "Audiowide, sans-serif"
    fontSize: "clamp(48px, 7vw, 96px)"
    fontWeight: 400
    lineHeight: 1.05
  display-2:
    fontFamily: "Audiowide, sans-serif"
    fontSize: "clamp(36px, 5vw, 64px)"
    fontWeight: 400
    lineHeight: 1.05
  headline:
    fontFamily: "Audiowide, sans-serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1.15
  title:
    fontFamily: "Audiowide, sans-serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.15
  title-sm:
    fontFamily: "Audiowide, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.15
  body-lg:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.55
    letterSpacing: "0.22em"
  nav:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    letterSpacing: "0.22em"
  button:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    letterSpacing: "0.06em"
  script:
    fontFamily: "Dancing Script, cursive"
    fontSize: "22px"
    fontWeight: 400
rounded:
  sm: "4px"
  md: "10px"
  lg: "20px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
  "9": "96px"
  "10": "144px"
components:
  button-primary:
    backgroundColor: "{colors.magenta}"
    textColor: "{colors.void-2}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "13px 28px"
  button-primary-hover:
    backgroundColor: "{colors.magenta-hover}"
    textColor: "{colors.void-2}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-1}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "13px 28px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "13px 28px"
  button-ghost-hover:
    textColor: "{colors.ink-1}"
  button-lg:
    padding: "17px 36px"
  button-sm:
    padding: "9px 20px"
  badge:
    backgroundColor: "transparent"
    textColor: "{colors.magenta}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  badge-filled:
    backgroundColor: "{colors.magenta}"
    textColor: "{colors.void-2}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "clamp(20px, 3vw, 32px)"
  input:
    backgroundColor: "{colors.void-2}"
    textColor: "{colors.ink-1}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  nav-link:
    textColor: "{colors.ink-3}"
    typography: "{typography.nav}"
    padding: "8px 12px"
  nav-link-active:
    textColor: "{colors.ink-1}"
  social-icon:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    size: "40px"
  social-icon-hover:
    textColor: "{colors.cyan}"
---

# Design System: Dorian Black

## Overview

**Creative North Star: "The Neon Afterhours"**

The site is the club after last call: the room has gone dark, but the signs
are still lit. Every page starts from near-black (`void`) with two faint
washes of light in the background, violet from above and blue from the lower
right, like a sign glowing off-screen. Against that dark, color is light, not
paint. Magenta, violet and blue appear as glows, hairlines, underlines and
the one button you are meant to press, never as flat fills behind text.

Density is low and the mood is nocturnal. Content sits in a single 1200px
column with generous vertical gaps. Type does the scene-setting: a wide,
rounded display face for titles, a narrow technical sans for everything
else, and one handwritten flourish in the footer. Album covers are the only
imagery and carry most of the color.

The system is allowed to get brighter. Future work may push more neon
(gradient rules, glowing panels, tinted washes) where it serves a release,
as long as text stays legible and the room stays dark. It must never tip
into 80s-parody synthwave, gaming HUD chrome, or a flat streaming-app clone.

**Key Characteristics:**
- Near-black, violet-tinted base with fixed radial light washes.
- Neon used as emitted light: glows, 1–2px lines, text-shadow, and one primary action.
- Audiowide titles, Rajdhani body and labels, Dancing Script as a single signature.
- Pill-shaped controls, softly rounded panels, square-ish fields.
- Album cover art as the only imagery.

## Colors

A dark, violet-tinted room lit by four neons: magenta for action, cyan for
information, blue and violet for atmosphere.

### Primary
- **Last Call Magenta** (`magenta`): the one action that matters on a
  screen (the primary button), the active nav underline, the hero title's
  glow, release badges. Hover brightens it to `magenta-hover`. On `void` it
  passes 4.5:1, so it may carry small text such as badges.

### Secondary
- **Midnight Blue Neon** (`blue`): the outline of secondary buttons and the
  glow on hover for secondary buttons, social icons and focused fields; also
  the lower-right background wash. At roughly 4.4:1 on `void` it fails
  normal-size text: use it for lines and light, never for body copy.

### Tertiary
- **Afterglow Violet** (`violet`): atmosphere only. The top background wash,
  the hero cover's halo, the contact panel's ambient glow, the dev-note rule,
  and the middle stop of the neon gradient. About 4.1:1 on `void`: never text.
- **Streetlight Cyan** (`cyan`): information, not action. Eyebrow labels,
  links (hover `cyan-hover`), the artist name and date in the hero, the
  Spotify facade title, and the focus outline on every element.

### Neutral
- **Void** (`void`): the page background. **Void Deep** (`void-2`) sits
  under form fields and is the text color on magenta fills.
- **Booth** (`surface`) and **Booth Raised** (`surface-2`): panels, the
  cookie banner, track-row hover, the skip link.
- **Hairline** (`surface-border`): every 1px border and divider.
  **Field Edge** (`field-border`) is the stronger input border, kept at 3:1
  against the panel.
- **Ink** (`ink-1`) for headings and anything you must read first;
  **Ink Soft** (`ink-2`) for body copy (the body's default color);
  **Ink Dim** (`ink-3`) for meta, durations, track numbers and inactive nav.
  `ink-3` passes 4.5:1 on every surface (5.5:1 on `surface-2`, the worst case).
- **Status:** `success` and `error` appear only on the contact form's status
  line, field errors and invalid-field borders.

**The neon gradient** (`magenta → violet → blue`, left to right) is used as
a hairline only: the section rule at 35% opacity and the contact panel's top
edge at 75%.

### Named Rules
**The Light, Not Paint Rule.** Neon is emitted light: glows, hairlines,
outlines, text-shadow and the primary button. Large flat neon fills behind
running text are not part of the system. When adding more neon, add it as
light around things, not as the background of reading surfaces.

**The One Magenta Action Rule.** Each view has at most one magenta-filled
control in a group. Everything beside it is a blue-outlined secondary or a
ghost button.

**The Measured Contrast Rule.** Text stays in `ink-1`, `ink-2` or `ink-3`,
or in `magenta` / `cyan`, which pass 4.5:1 on `void`. Blue and violet never
carry text below large-text size. Check any new color with the WCAG
luminance formula against its real background.

## Typography

**Display Font:** Audiowide (with sans-serif)
**Body Font:** Rajdhani (with sans-serif)
**Script Font:** Dancing Script (with cursive)

**Character:** Audiowide's wide, rounded letters read like a lit sign;
Rajdhani's narrow, squared-off strokes read like a machine readout beneath
it. The script appears once, as a signature.

**These families are provisional.** They're self-hosted stand-ins for brand
fonts that haven't been chosen. Future work keeps the three roles and their
relationship (wide display, narrow technical body, one handwritten mark), but
treat the specific families as replaceable. Don't add a fourth family.

### Hierarchy
- **Display** (400, `clamp(48px, 7vw, 96px)`, 1.05): the Home hero album
  title only, in white with the magenta glow, max 12ch, balanced wrapping.
- **Display 2** (400, `clamp(36px, 5vw, 64px)`, 1.05): release titles on
  the Music page.
- **Headline** (400, 40px, 1.15): page `<h1>`s.
- **Title** (400, 30px, 1.15) and **Title Small** (400, 22px, 1.15): `<h2>`
  and `<h3>`; Title Small also sets the hero's artist line and release date
  in cyan.
- **Body Large** (400, 19px, 1.55): ledes, hero copy, track titles (at 600–700),
  form inputs. Ledes cap at 60ch, hero copy at 46ch.
- **Body** (400, 16px, 1.55): default running text in `ink-2`.
- **Body Small** (400, 14px): meta rows, track notes, durations, footer,
  form hints. Numbers use tabular figures.
- **Label** (600, 12px, 0.22em, uppercase): eyebrows in cyan and badges.
  Nav links use the same treatment at 14px. Buttons are 700 at 15px with
  0.06em tracking, uppercase.
- **Script** (400, 22px): the artist name in the footer. Nowhere else.

### Named Rules
**The Sign and Readout Rule.** Audiowide is for names and titles
(artist, albums, page headings) at 22px and up. Everything you read in
sequence (copy, labels, buttons, data) is Rajdhani. Never set paragraphs in
the display face.

**The Single Signature Rule.** The script face marks the artist's name once
per page, in the footer. It is never a heading, label or button.

## Layout

A single centered column: max 1200px, side padding `clamp(16px, 3vw, 32px)`
(24px container token). Pages open with 64px top padding and 96px bottom;
major sections are separated by 96px, and sub-blocks by 48px. Spacing comes
from a 4px-based scale (4, 8, 12, 16, 24, 32, 48, 64, 96, 144); stay on it.

- **Header:** sticky, 80% `void` with a 16px backdrop blur and a hairline
  bottom border. Logo left (96px tall, 64px under 480px), nav and social
  icons right, separated by a short vertical hairline.
- **Home hero:** full-bleed band (`min(78vh, 620px)`) with the cover art
  blurred and dimmed behind a dark scrim; copy left, cover right (up to
  520px). Stacks to one column at 900px.
- **Release layout:** cover (up to 340px) beside its meta; stacks at 900px.
- **Tracklists:** a 3-column grid row (number, title + note, duration),
  hairline-separated. The Home tracklist flows into two newspaper columns
  that read down then across, so the sequence stays in order; one column
  at 900px.
- **Narrow pages** (Contact) cap at 820px.

Breakpoints: **900px** (header collapses to a toggle menu, two-column
layouts stack, footer centers, fixed background stops) and **480px**
(smaller logo, full-width hero and form buttons, tighter track grid).
Verify every change at desktop and at 320px wide.

## Elevation & Depth

Depth comes from light, not lift. Surfaces are flat and separated by
tone (`void` → `surface` → `surface-2`) and hairlines. The few real shadows
are deep and black, there to sink the page around a lit object; the
expressive depth is glow.

### Shadow Vocabulary
- **Neon glow** (magenta, blue, violet variants: a 1px white core, an 8px
  inner halo at 80% and a 28px outer halo at 45%): the primary button at
  rest, the hero title's text-shadow, and the blue variant on hover/focus
  for secondary buttons, social icons and fields.
- **Card** (`0 12px 32px rgba(0,0,0,.55)`): release cover art at rest;
  on hover it lifts 4px and picks up a faint magenta underglow.
- **Hero cover** (1px white ring at 8%, deep black drop, 80px violet halo):
  the latest album cover on Home, which reads as the brightest object in
  the room.
- **Ambient panel glow** (44px violet at 9% plus card shadow): the contact
  form panel.
- **Banner** (`0 12px 40px rgba(0,0,0,.45)`): the cookie banner only.

### Named Rules
**The Glow Means Live Rule.** A glow says "this is lit and you can touch
it", or it marks the hero title. Static containers don't glow at rest
(the contact panel's 9% ambient is the ceiling). Hover and focus may add
glow; nothing else should.

## Shapes

Three corner families, each tied to a job: **pills** (999px) for everything
you press or that labels a state (buttons, badges, social icons, the menu
toggle); **soft rounding** for containers (20px panels, 10px cover art and
the cookie banner); **near-square** 4px corners for form fields, small
thumbnails and the focus ring. Borders are always 1px hairlines; the only
heavier strokes are the 1.5px blue inset on secondary buttons and the 2px
magenta active-nav underline. No angled cuts, notches or clipped corners.

## Components

### Buttons
Glowing pills: confident, uppercase, quick to respond.
- **Shape:** full pill (999px), 13px × 28px padding at 15px; large is
  17px × 36px at 16px, small is 9px × 20px at 13px.
- **Primary:** Last Call Magenta fill, Void Deep text, magenta glow at rest.
  Hover brightens to `magenta-hover` and rises 1px.
- **Secondary:** transparent with a 1.5px inset blue outline and Ink text;
  hover adds the blue glow and rises 1px. This is the default for store
  links, page links and every non-primary action.
- **Ghost:** transparent with a 1px hairline inset and Ink Soft text; hover
  brightens text and outline. Used for low-stakes choices (Decline, the
  About page's profile list).
- **Disabled:** 40–50% opacity, no glow, no pointer.
- **Focus:** the global 2px cyan outline at 3px offset.

### Badges
- **Style:** pill, Label type, 5px × 12px. Outline variant is magenta text
  with a 1px magenta border; filled variant is magenta with Void Deep text.
- **Use:** release status ("Out now") on the Music page.

### Panels
- **Corner Style:** 20px.
- **Background:** `surface` with a hairline border.
- **Shadow Strategy:** flat, except the contact form (ambient violet glow
  and a neon-gradient hairline across its top edge).
- **Internal Padding:** `clamp(20px, 3vw, 32px)`.

### Inputs / Fields
- **Style:** `void-2` fill, 1px Field Edge border, 4px corners, Body Large
  text in Ink, 12px × 16px padding. Labels sit above in bold uppercase Ink
  with wide tracking; "optional" and hints in small Ink Dim.
- **Focus:** border turns cyan with a soft cyan ring and the blue glow
  (replaces the outline).
- **Error:** border and message in `error`; the message lives in a live
  region. Status line turns `success` or `error`.

### Navigation
- **Desktop:** uppercase Rajdhani 600 at 14px with 0.22em tracking, Ink Dim;
  hover goes to Ink; the active page is Ink with a 2px magenta underline.
- **Social icons:** 40px hairline-ringed circles with 18px brand glyphs in
  Ink Soft; hover turns cyan with the blue glow. Icon-only, so each has an
  `aria-label`.
- **Mobile (≤900px):** a 42px pill toggle with a hairline ring swaps
  hamburger and close icons; the menu slides open below the logo as a
  stacked list with hairline separators, and social icons center beneath it.

### Tracklist
The signature data component. A hairline-ruled list of rows: tabular track
number in Ink Dim, bold track title in Ink with an optional one-line note
in Ink Dim beneath, duration right-aligned in tabular Ink Dim. Rows tint to
`surface-2` at 60% on hover. Never reorder or truncate the sequence.

### Release Block
Cover art (10px corners, hairline, card shadow, lifts on hover) beside a
stack of: status badge, Display 2 title, lede blurb, uppercase meta row
(kind · track count · length · date) in Ink Dim, then a row of pill buttons.

### Player Facade
Before consent, the Spotify embed is a full-width `surface` button with a
cyan Title Small heading and a small note explaining nothing loads until
clicked; it hovers to `surface-2`. After consent it is replaced by the
embed in an 8px-cornered hairline frame.

### Cookie Banner
A floating `surface-2` card pinned 16px from the bottom and sides, 10px
corners, hairline border, banner shadow. Copy left, ghost "Decline" and
magenta "Accept" small pills right; it wraps on narrow screens.

## Do's and Don'ts

### Do:
- **Do** start every surface from `void` with the violet and blue radial washes, and let neon arrive as light: glows, 1–2px lines, text-shadow.
- **Do** keep one magenta-filled action per group; use blue-outlined secondary pills for everything else.
- **Do** use cyan for information (eyebrows, links, dates) and magenta for action and status.
- **Do** set names and titles in the display face at 22px and up, and everything read in sequence in the body face.
- **Do** push more neon when a release calls for it (gradient rules, glowing edges, tinted washes), as long as text keeps 4.5:1 against its actual background.
- **Do** keep album covers as the dominant imagery, with deep black shadows and colored halos rather than frames.
- **Do** respect `prefers-reduced-motion`; motion stays short (120–420ms) on the `cubic-bezier(0.16, 1, 0.3, 1)` ease-out.

### Don't:
- **Don't** set body copy, labels or small text in Midnight Blue Neon or Afterglow Violet; they fail 4.5:1 on `void`.
- **Don't** fill reading surfaces with flat neon or put running text on a neon background.
- **Don't** drift into retro synthwave kitsch: no outrun grids, chrome sunsets, palm trees, VHS scanlines or 80s-parody chrome type.
- **Don't** borrow gaming or esports UI: no angular HUD frames, notched corners, scan-line overlays or RGB-keyboard rainbow effects.
- **Don't** flatten into a generic streaming-app layout: no light theme, no grey card grids, no stock player chrome without the night around it.
- **Don't** use the script face anywhere except the artist's name in the footer, and don't add a fourth font family.
- **Don't** glow static containers at rest beyond the contact panel's faint ambient; glow is for the lit, the pressable, and the hero title.
