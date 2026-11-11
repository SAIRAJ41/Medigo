---
name: Clinical Clarity
colors:
  surface: '#f7f9ff'
  surface-dim: '#cadcef'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf4ff'
  surface-container: '#e2efff'
  surface-container-high: '#d8eafe'
  surface-container-highest: '#d2e4f8'
  on-surface: '#0b1d2b'
  on-surface-variant: '#41484e'
  inverse-surface: '#213241'
  inverse-on-surface: '#e7f2ff'
  outline: '#71787f'
  outline-variant: '#c0c7cf'
  surface-tint: '#19648f'
  primary: '#17628e'
  on-primary: '#ffffff'
  primary-container: '#397ba8'
  on-primary-container: '#fffdff'
  inverse-primary: '#8fcdfe'
  secondary: '#476272'
  on-secondary: '#ffffff'
  secondary-container: '#cae6fa'
  on-secondary-container: '#4d6878'
  tertiary: '#7f5400'
  on-tertiary: '#ffffff'
  tertiary-container: '#9c6c1b'
  on-tertiary-container: '#fffdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cbe6ff'
  primary-fixed-dim: '#8fcdfe'
  on-primary-fixed: '#001e30'
  on-primary-fixed-variant: '#004b71'
  secondary-fixed: '#cae6fa'
  secondary-fixed-dim: '#aecadd'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#2f4a5a'
  tertiary-fixed: '#ffddb2'
  tertiary-fixed-dim: '#f7bc64'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#624000'
  background: '#f7f9ff'
  on-background: '#0b1d2b'
  surface-variant: '#d2e4f8'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  caption-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  gutter-desktop: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an environment of utilitarian medical clarity, composure, and immediate comprehension. Built specifically for high-stress triage and acute first-aid contexts, the visual identity prioritizes cognitive de-escalation: pure light-mode cleanliness, unambiguous semantic feedback, and disciplined structural restraint.

The style rejects atmospheric novelties, saturated neon accents, heavy drop shadows, decorative gradients, and dark themes. Instead, it relies on precise structural minimalism: crisp division lines, gentle background tint shifts, generous target geometry, and predictable navigational anchors. Every screen behaves as an assistive clinical instrument—calm, authoritative, and direct.

## Colors

The palette is strictly locked to functional clinical values under a light-only mode. No dark themes or alternative color temperatures (teal, cyan) are permitted.

### Brand and Base Palette
- **Canvas Base (`#F8FAFC`)**: Applied uniformly to page backgrounds to soften screen glare without reducing daylight legibility.
- **Surface Elevation (`#FFFFFF`)**: Reserved for discrete cards, modal sheets, drawer surfaces, and input fields.
- **Surface Variant / Tint (`#E8F1F8`)**: Utilized for AI triage messages, info panels, metrics rows, and active navigation list tiles.
- **Primary Accent (`#397BA8`)**: Reserved for key calls-to-action, active indicators, and high-priority anchors. State transition for active/pressed interactions shifts directly to `#2F6A93`. Text on primary fills is always pure white (`#FFFFFF`).
- **Supportive Fill (`#B9D5E8`)**: Used solely as a background wash or container fill for active chips, non-critical highlights, subtle selection halos, and patient chat bubbles. Never use this tint for typographic rendering.
- **Typography Base (`#263746`)**: High-contrast, near-slate text for all primary headings, metrics, and standard body text.
- **Typography Subdued (`#5B6B7A`)**: Secondary disclaimers, timestamps, assistive sub-labels, and metadata.
- **Structural Outlines (`#D5E1EA`)**: Consistent 1px boundary lines dividing layout groups, cards, and input fields.

### Semantic Triage Indicators
Triage urgency operates entirely independently of brand blues:
- **Red - High**: Solid `#C62828` with `#FFFFFF` text or tint `#FDECEA` with `#C62828` text and iconography.
- **Yellow - Medium**: Solid `#F9A825` with `#263746` text or tint `#FFF4D6` with `#263746` text and iconography.
- **Green - Low**: Solid `#2E7D32` with `#FFFFFF` text or tint `#E6F4E8` with `#2E7D32` text and iconography.

## Typography

Typographic scale is structured around uniform rendering in the single family `Inter`. Because medical directives require instantaneous processing by stressed users, optical clarity and vertical cadence take precedence over expressive styling.

- Maintain explicit contrast hierarchy: use `Inter Semi-Bold (600)` or `Bold (700)` in `#263746` for titles and primary instructional triggers.
- Reserve `#5B6B7A` exclusively for secondary information: timestamps, observational meta tags, character limits, and legal triage disclaimers.
- Never set long-form clinical protocols in condensed or all-caps configurations. All-caps is prohibited with the sole exception of severity labels when paired with explicit category tokens (e.g., `RED - HIGH`).

## Layout & Spacing

The system adopts a fluid mobile-first architecture that flexes seamlessly toward desktop widths while constraining central triage content to an optimal reading column (maximum 720px width). 

### Grid and Framework Rules
- **Mobile (< 768px)**: Single-column stack with `margin: 1rem` (`16px`) and `gutter: 1rem` (`16px`). Touch targets have a strict minimum height of 48px to accommodate unsteady input.
- **Tablet & Desktop (>= 768px)**: Canvas expands using `margin-desktop: 2rem` (`32px`) and `gutter-desktop: 1.5rem` (`24px`). Conversational modules, action panels, and diagnostic data retain fixed card boundaries centered in the viewport.

### Layout Mechanics
- Vertical spacing relies on strict multiples of 4px and 8px: `space-xs` (4px), `space-sm` (8px), `space-md` (16px), `space-lg` (24px), and `space-xl` (32px).
- Generous internal padding (typically `space-md` to `space-lg`) separates interactive options inside cards to prevent accidental taps during emergencies.

## Elevation & Depth

Visual hierarchy is communicated strictly through surface color stepping and hairline boundary dividers, rejecting heavy drop shadows, multi-layered blurs, and skeuomorphic gradients.

- **Surface Layering**: The foundation starts on `#F8FAFC`. Floating objects, cards, and input panels rest on `#FFFFFF`. Secondary sub-containers, AI message blocks, and stat monitors embed into the card via `#E8F1F8`.
- **Borders & Dividers**: Every structural card, input shell, and section divider features a 1px solid border set to `#D5E1EA`.
- **Shadow Treatment**: Default components carry zero elevation blur (`box-shadow: none`). Modals, slide-in drawers, and critical diagnostic alerts utilize only a clean, non-intrusive ambient shadow: `0px 4px 16px rgba(38, 55, 70, 0.06)` to confirm screen detachment without muddying the interface.

## Shapes

The geometric signature uses a standardized corner radius setting of `2` (8px base). In adherence with triage safety requirements, core content surfaces, modals, and container boundaries adopt `rounded-xl` (12px to 16px radius) to project an approachable, protective atmosphere.

- **Primary Cards & Modals**: Standardized at 12px (`rounded-xl` equivalent).
- **Buttons & Text Fields**: 8px radius (`rounded-md`), pairing functional crispness with tactile ease.
- **Chips, Badges, & Severity Indicators**: Fully rounded pill shapes (`9999px`) or continuous rounded tags (6px) to immediately distinguish informational status from actionable square elements.

## Components

### Global Header & Navigation
- **Navigation Mandate**: Bottom tab bars are strictly prohibited.
- **Top Navigation Bar**: Fixed at top, 56px height, surface `#FFFFFF`, bottom border 1px `#D5E1EA`. Top-left always hosts either:
  1. A 3-line hamburger menu icon (48px square tap target) that toggles the slide-in drawer on primary screens.
  2. A directional back arrow button with accessible label on deep sub-screens.
- **Slide-in Drawer**: Opens from the left, surface `#FFFFFF`, with a 1px right border `#D5E1EA` and subtle ambient backdrop tint. Drawer navigation links use 48px touch targets, with active states marked by background `#E8F1F8` and text `#397BA8`.

### Buttons
- **Primary Action**: Solid `#397BA8` fill, text `#FFFFFF`, 8px corner radius. Minimum height 48px. State change: `:active` and `:hover` transition to `#2F6A93`.
- **Secondary Action**: Background `#FFFFFF`, 1px border `#D5E1EA`, text `#263746`. Active transition: background `#E8F1F8`.
- **Disabled State**: Background `#E8F1F8`, text `#5B6B7A`, border `#D5E1EA`.

### Cards & Information Containers
- **Standard Card**: `#FFFFFF` background, 12px border radius, 1px `#D5E1EA` border, 16px internal padding.
- **Stat / Triage Summary Card**: Surface `#E8F1F8`, 12px radius, no border or subtle `#D5E1EA` stroke, typography `#263746`.
- **Chat Bubbles**:
  - *AI Assistant*: Aligned left, `#E8F1F8` surface, 12px radius with lower-left anchor, text `#263746`.
  - *Patient / User*: Aligned right, `#B9D5E8` surface fill, 12px radius with lower-right anchor, text `#263746`.

### Triage Severity Badges
Must always pair an explicit icon with clear uppercase label text. Primary brand blue (`#397BA8`) must never be used for severity states.
- **High Severity**:
  - *Solid Variant*: Background `#C62828`, Text `#FFFFFF`, Warning Icon `#FFFFFF`.
  - *Tint Variant*: Background `#FDECEA`, Text `#C62828`, Border `#C62828` (optional 1px), Icon `#C62828`. Label reads: `RED - HIGH`.
- **Medium Severity**:
  - *Solid Variant*: Background `#F9A825`, Text `#263746`, Alert Icon `#263746`.
  - *Tint Variant*: Background `#FFF4D6`, Text `#263746`, Icon `#F9A825`. Label reads: `YELLOW - MEDIUM`.
- **Low Severity**:
  - *Solid Variant*: Background `#2E7D32`, Text `#FFFFFF`, Check/Shield Icon `#FFFFFF`.
  - *Tint Variant*: Background `#E6F4E8`, Text `#2E7D32`, Icon `#2E7D32`. Label reads: `GREEN - LOW`.

### Form Controls & Inputs
- **Text Input Bar**: Minimum 48px height, `#FFFFFF` surface, 8px radius, 1px `#D5E1EA` border. Text `#263746`, placeholder `#5B6B7A`. Focused state: 2px ring halo using `#B9D5E8` with `#397BA8` border stroke.
- **Checkboxes & Radios**: 24px box size housed inside a 48px touch wrapper. Unchecked: `#FFFFFF` with 1.5px `#D5E1EA` border. Checked: `#397BA8` with `#FFFFFF` check/bullet mark.

### Chips & Filter Pills
- Heights fixed at 36px to 40px with a continuous rounded pill shape.
- Unselected: Surface `#FFFFFF`, border 1px `#D5E1EA`, text `#5B6B7A`.
- Selected: Surface `#B9D5E8`, border 1px `#397BA8`, text `#263746` (with bold weight).