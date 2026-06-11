# Cursor Directive — pottstownattorney.com Bug Fixes
## Prepared by: Jenny McGregor, MFT
## Date: 2026-06-11

---

## CONTEXT

This is an existing static HTML/CSS/JS website for Paul A. Bauer III, DUI Defense Attorney, Pottstown PA.
Live staging URL: https://pottstownattorney.fueledbymft.com
Stack: Plain HTML5, CSS3, Vanilla JavaScript. No frameworks. Google Fonts only.
All files are in this repo. Do NOT change the tech stack or redesign the site.

---

## ISSUES TO FIX

### BUG 1 — Mobile navigation menu is cut off / clipped (PRIORITY)

**Problem:** On mobile, when the hamburger menu is tapped and `.site-nav.is-open` expands, the
dropdown menu items are clipped or hidden behind other content. The nav opens inside the sticky
header flex container but gets cut off.

**Root cause in `assets/css/main.css`:**
- `.site-header` is `position: sticky; z-index: 50` — correct
- `.site-nav` expands as `width: 100%; order: 3` inside the header flex container
- The header doesn't have `overflow: visible` explicitly set, and the expanded nav may be
  clipped by parent overflow or stacking context issues
- The mobile call bar `.mobile-call` is `position: fixed; z-index: 40` — lower than header,
  which is fine, but the nav items need to clear it

**Fix:**
1. Ensure `.site-header` has `overflow: visible` so the expanded nav isn't clipped
2. Bump `.site-nav.is-open` to have a proper `z-index` so it layers above all page content
3. The expanded nav should visually drop below the header bar cleanly, full width, no clipping
4. Test at 390px viewport width (iPhone viewport)
5. Make sure tapping a nav link closes the menu (check `main.js` — add close-on-link-click if missing)

### BUG 2 — Sticky header height inconsistency on mobile

**Problem:** On mobile the header wraps to two lines (logo + hamburger button) and the
`--header-h` CSS variable (used for scroll-margin-top on anchor targets) may not match
the actual rendered header height, causing anchored sections to be hidden behind the header.

**Fix:**
- Check `--header-h` value and all `scroll-margin-top` usages
- Either set a taller mobile value for `--header-h` in a `@media (max-width: 64rem)` block,
  or use JS to measure and update `--header-h` dynamically on resize in `main.js`

### BUG 3 — Review all pages for any remaining placeholder text

**Problem:** The old site had placeholder text like "NEED ANSWER HERE, PAUL :-)". 
Search all HTML files for: TODO, PLACEHOLDER, NEED, TBD, FIXME, ":-)"
If any are found, flag them in a comment at the top of the file — do NOT fabricate content,
just mark them clearly so we know what needs client input.

---

## DELIVERABLES

- Fixed `assets/css/main.css`
- Fixed `assets/js/main.js` (if needed for nav close-on-click and header height)
- All HTML files checked for placeholder text, flagged if found
- All changes committed to this repo on `main` branch
- No redesign, no new pages, no framework changes

---

## DO NOT

- Do NOT redesign or restyle the site
- Do NOT change the color palette, fonts, or layout
- Do NOT add new dependencies or frameworks
- Do NOT modify content in HTML files (except removing placeholder text if clearly marked)
- Do NOT touch robots.txt, sitemap.xml, or form-submit.php

---

## DEPLOYMENT NOTE

Once fixes are committed to `main`, Jenny will deploy via FTP to:
`pottstownattorney.fueledbymft.com` on the MFT Plesk server.
No GitHub Actions needed for this project yet.
