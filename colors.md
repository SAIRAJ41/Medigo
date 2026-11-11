## Colors

### Brand palette
| Role | Hex | Use |
|---|---|---|
| Primary | #397BA8 | Filled buttons, active menu item, headings, links. Always pair with white text. |
| Primary hover/pressed | #2F6A93 | Hover and pressed state of primary buttons. |
| Background tint | #E8F1F8 | Cards, info panels, stats row, AI reply bubbles. |
| Background | #F8FAFC | Main page background on all screens. |
| Surface | #FFFFFF | Input bar, modals, raised cards. |
| Text | #263746 | All body text and headings on light backgrounds. |
| Text muted | #5B6B7A | Secondary text such as timestamps and hints. |
| Accent | #B9D5E8 | Fills only: chips, highlights, card borders, user chat bubbles. |
| Border | #D5E1EA | Dividers and input outlines. |

### Severity colors (separate from the brand palette)
Severity colors must never be reused for decoration, and the brand blue must never be used for a severity badge.

| Category | Solid | Tint (badge background) | Tex t on solid |
|---|---|---|---|
| Red | #C62828 | #FDECEA | White |
| Yellow | #F9A825 | #FFF4D6 | #263746 (dark, not white) |
| Green | #2E7D32 | #E6F4E8 | White |

Level (Low / Medium / High) is shown as text inside the badge, for example "Red - High", never by color shade alone.

### Rules
- All body text uses #263746 on #F8FAFC or #FFFFFF.
- White text is allowed only on Primary (#397BA8), Red solid and Green solid.
- Never place text or thin icons in Accent (#B9D5E8) on a light background. Contrast is too low, so use it as a fill only.
- Every severity badge shows both a text label and an icon, so it works without color vision.
- Primary #397BA8 is for buttons, headings and large text, not small body text.

### Contrast check (approximate)
- White on Primary #397BA8: 4.6:1 (passes 4.5:1)
- Text #263746 on Background #F8FAFC: 11.7:1
- Text muted #5B6B7A on Background #F8FAFC: 5.2:1