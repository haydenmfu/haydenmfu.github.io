# Spec: The website *is* the desk

**Status:** draft, from interview 2026-10-14
**Owner:** Hayden Fu
**Files mainly affected:** `src/App.tsx`, `src/desk.css`, `src/resume.css`, `src/components/ResumeDocument.tsx`, `src/data/deskTargets.ts`, new `src/data/objectRegions.ts`

## 1. Problem

The current site is a web page that *contains* a desk: there are page margins, a beige backdrop, a header and footer, and an "Explore" index. Subpages are the same: art floats in margins, and a sticky menu bar provides "Back to desk" and sibling links. Navigation feels like using a website menu, not like picking things up off a desk and putting them down. Résumé is the closest to right, but its header bar and big page title still break the illusion.

## 2. Goal and audience

- **Audience:** peers and the general public. Memorability matters more than speed to a résumé.
- **Takeaway:** "How did he build this?" The craft of the world is the point.
- **Principle:** no web chrome is visible. Every visible thing is an object on or around the desk. All navigation is *pick up an object* or *put it down*.

## 3. Decisions (from the interview)

| Topic | Decision |
|---|---|
| Desk fit | Full-bleed **cover**, cropping the edges. Objects must stay within a safe zone (§4.1). |
| Intro text (name, sentence, location) | Lives **in the scene** on a card pinned to the wall above Snorlax. The art's nameplate already says "Hayden Fu". |
| Back to desk | **Click the desk/wood around the object** and/or the **Snorlax peek** cue. Esc and browser Back keep working, with no visible chrome. |
| Sibling navigation | **None.** You always go back via the desk: put one object down, pick up another. |
| Phones (portrait) | **One new portrait desk image**, the single exception to "reuse existing art". |
| Discovery | **Idle shimmer**: after ~4s idle, once per visit. |
| Accessibility nav | A real nav list, **visually hidden until focused**, then shown as an in-world card. |
| Overflow | **Per object, physically plausible** (§5). |
| Misclick guard | Only a *clean* click on the wood counts. No drag, no text selection. |
| Back cue | **Snorlax peeking in, bottom-left, small (~120px).** |
| Art | **Reuse and crop existing art**, except the one portrait desk. |
| Text on art | **Live HTML** styled to sit on the paper. |
| Fonts | A handwriting font (Caveat or Kalam) **for short bits only** (headings, notes, labels). Body text stays DM Sans and Fraunces. |
| Headings and footer | h1 becomes **visually hidden** (kept for screen readers). The footer is **removed**. |
| Résumé | **Two sheets in a stack**. Click the lower one to bring it on top. **Paper clip = Download**, **stamp = Open PDF**. The readable-text view is dropped. |
| Notebook (About) and books (Research) | **Click a page corner** to turn, with a page-turn animation. Research turns **between papers**, replacing the picker buttons. |
| Experience | **Flip through the stack.** One sheet per category (Research, Work, Community), replacing the tab buttons. |
| Laptop (Projects) | **Keep the scrolling document** inside the screen. Only the chrome is removed. |
| Contact | **Address lines are the links** (email, GitHub, LinkedIn). **Click the stamp to copy the email**, with a postmark "copied" stamp. |
| Snorlax easter egg | **Stir + "Zzz" bubble.** Sleepy one-liners cycle on repeat clicks. |
| Zoom transition | The existing cross-fade zoom is fine. No need to align the desk crop with the close-up art. |
| Touch | **Shimmer + Snorlax peek only.** Tapping the wood also goes back. No hover captions on touch. |
| Colophon / "how it's built" | **Out of scope** for this iteration. |
| Phasing | **Chrome removal first** (§7). |

## 4. Desk (home) view

### 4.1 Full-bleed stage

- `body` has no margin, and the desk view is `position:fixed; inset:0; overflow:hidden`. The home view never scrolls.
- A **stage** element holds the art and every overlay, sized to *cover* the viewport while keeping the art's aspect ratio. Overlays then stay aligned using percentages of the art:
  ```css
  .desk-stage{position:absolute;left:50%;top:50%;
    width:max(100vw, 100dvh * 2846 / 1602);
    height:max(100dvh, 100vw * 1602 / 2846);
    translate:var(--stage-x,-50%) -50%;}
  ```
  The `<img>` fills the stage at 100%×100%. The SVG hit-paths, intro card, caption and Snorlax hotspot are positioned inside the stage in art-percentage coordinates.
- **Safe zone.** The clickable objects span roughly x = 4.7%–83.5% and y = 13%–91% of the art (computed from `deskTargets`). The content is right-heavy, so bias the horizontal crop with `--stage-x`, which ranges from `-50%` to about `-44%`, so trimming comes off the empty right edge first.
  - At a viewport aspect ratio of ≥ ~1.45, every object is visible. Verify this in code by computing each object's bounding box against the viewport, not by eye.
  - Between ~1.45 and the portrait breakpoint, adjust `--stage-x` so all targets stay inside. If they can't, switch to the portrait art (§4.6).
- Remove `.scene-topline`, `.desk-intro`, `.desk-index` and the page gradient from the visible UI.

### 4.2 Intro card (in-scene)

- A paper card pinned to the wall area above Snorlax, positioned in art coordinates near the existing pinned notes (about x 76–94%, y 4–22%; tune by eye). It is drawn in CSS: off-white paper, slight rotation, a pin or tape, a soft shadow.
- Content is live HTML from `src/data/about.ts` and `profile.ts`: a short line ("Hi, I'm Hayden"), the intro sentence, and "Ithaca, NY · 2026". The handwriting font is used only for the greeting line.
- It is not a link. The text stays selectable.
- It must stay legible at the smallest desktop stage size. If the text drops below ~12px rendered, the card scales up or shortens its copy.

### 4.3 Hover captions

- Keep `.desk-caption` (built in the previous pass), mouse and keyboard only. It is hidden under `(hover: none)`.

### 4.4 Idle shimmer

- Starts after 4s with no pointer movement, key press or scroll on the desk. It plays **once per page load**, using an in-memory flag; it does not persist in localStorage.
- A light sweep (a diagonal highlight gradient masked to each hit-path) runs over each clickable object in sequence, 100ms apart, about 600ms per object.
- Under `prefers-reduced-motion: reduce`, each object's outline instead brightens briefly to 0.6 opacity and fades, with no movement.
- It is skipped entirely if the user has already opened an object this visit.

### 4.5 Snorlax easter egg

- A new hit-path over Snorlax in `deskTargets`, typed as `kind: 'egg'`. It is not a link: a `<button>` inside the SVG via `foreignObject`, or an `<a role="button">` with a key handler.
- On click: a small wobble of a Snorlax-only cutout layer (rotate ±2°, 300ms, ease-out, reduced-motion gated), and a speech bubble with "Zzz…" that cycles through 4–6 sleepy one-liners on repeat clicks. The bubble disappears after 2.5s.
- The wobble needs a Snorlax layer. Reuse `public/snorlax-lying.png` (an RGBA cutout) only if it matches the pose in `Base.png`. Otherwise, animate only the bubble plus a subtle CSS `scale` "breath" on a clipped region of the art. **Open question, §9.**
- The bubble text goes in an `aria-live="polite"` region.

### 4.6 Phone portrait desk

- Uses **one new image**: a tall desk scene, 1290×2796 or a similar ~9:19.5 ratio, with the same style and objects rearranged vertically. The art brief is in §8.
- New traced hit-paths go in `deskTargets.portrait`, using the same view keys.
- Switch when the viewport aspect ratio is < 1.0, using `<picture>` / `matchMedia`, so the stage, paths and intro-card coordinates swap together.
- Until the art exists, keep the current phone layout behind this breakpoint (no regression).

## 5. Reading views (subpages)

### 5.1 Shared shell

- Remove `.reading-header`, `.reading-footer`, the visible h1 and `.reading-kicker`. The h1 stays, `sr-only`, and still receives focus on entry.
- Each view's art fills the viewport (cover) with no margins and no beige page. Where the art's aspect ratio crops important content, bias the crop per view, as on the desk.
- **Object region.** Each view defines the rectangle (or polygon) of the "picked-up" object in art coordinates, in `src/data/objectRegions.ts`. Everything outside it is "the desk".
- **Back by clicking the desk.** On `pointerup` outside the object region, go back only when all of these hold:
  - pointer movement since `pointerdown` < 4px;
  - `getSelection()` is empty or collapsed;
  - the target is not inside an interactive element (`a, button, input, [tabindex]`).

  When they hold, set `location.hash = ''`, which triggers the existing zoom-out transition.
- **Snorlax peek.** A ~120px cutout of Snorlax's head and paw rises from the bottom-left edge on every subpage.
  - It is a real `<a href="#">` with `aria-label="Back to desk"`.
  - On hover or focus it rises about 12px and shows a small "back to desk" tag; transitions are 150ms and reduced-motion gated.
  - On touch it is always visible.
  - It sits above the art and below any open object content, and must never cover text. Each view reserves its bottom-left corner.
  - The source is a crop of `snorlax-lying.png` or `Base.png`; no new art.
- Esc and browser Back keep working.
- **Hidden accessibility nav.** The first focusable element on every view is a skip-style nav list (desk plus all six objects).
  - It is `sr-only` until `:focus-within`, then shown as a small paper card in the top-left corner.
  - It replaces `.desk-index` and the header nav, and exists on the desk view too.

### 5.2 Projects: laptop

- The laptop art stays full-bleed. The project document keeps scrolling *inside the screen* (existing `.laptop-scroll`, `overscroll-behavior: contain`).
- The object region is the laptop body. Clicks on the wood around it go back.
- Phones (≤760px) keep the CSS-drawn laptop frame, but full-bleed with no header or footer.

### 5.3 Research: books

- The open-book art is full-bleed. **Each spread is one paper**: title, venue and date on the left; abstract and "Read paper ↗" on the right.
- **Page turn.**
  - A dog-eared corner on the bottom-right of the right page goes to the next paper, and the bottom-left corner goes to the previous one. They are `<button>`s labeled "Next paper: {short title}" and "Previous paper".
  - ←/→ arrow keys also turn pages while focus is inside the book.
  - The order is: featured first, then the rest.
- **Turn animation:** a page-curl. A right-page overlay rotates on `rotateY` from 0 to −180° around the spine over 450ms with `cubic-bezier(0.2,0,0,1)`. Content swaps at the midpoint. Under reduced motion it becomes a 200ms opacity cross-fade. The turn must be interruptible: a second click mid-turn jumps straight to the target.
- Remove `.paper-picker`. A small page indicator ("2 / 3") is written in the bottom margin of the page in the handwriting font.

### 5.4 About: notebook

- Full-bleed notebook art with live text on both pages, as now.
- If text overflows a page at the current viewport, split it into spreads and use the **same corner-turn mechanic** as §5.3. Pagination is computed by measuring, not by fixed character counts.
- "View my experience →" becomes plain text pointing at the desk ("the papers on the left of the desk"). Since there is no sibling navigation, it is either removed or turned into a line that zooms back out to the desk. **Decision: remove it.**

### 5.5 Experience: stack of papers

- Clipped stack art, full-bleed. **One sheet per category**: Research, Work, Community.
- The top sheet shows its category title in the handwriting font, with its entries in DM Sans and Fraunces. Long entries scroll *within the sheet* if needed (`overscroll-behavior: contain`).
- **Flip:** click the top sheet's bottom-right corner (a `<button>`, "Next: Work") to send the top sheet to the back. The sheet slides down and behind over 300ms with ease-out; reduced motion gets a cross-fade. The edges of the sheets underneath stay visible, offset 4–6px, so the stack reads as a stack.
- Remove `.experience-tabs`.

### 5.6 Résumé: two sheets

- Wood art is full-bleed (the existing `resume-wood-v3.png` treatment), with no header, footer, title or control panel.
- **Two sheets** (SWE, Data Analytics) lie slightly offset and rotated about 2°, with the lower sheet peeking out by about 40px.
  - Click the lower sheet, or press Tab to it and Enter, to bring it on top. The swap is a 300ms slide.
  - The lower sheet is a `<button>` labeled "Show Data Analytics résumé".
- **Paper clip** on the top sheet's top-left corner: Download PDF (`<a download>`, aria-label "Download {version} résumé PDF").
- **Stamp** on the top sheet's top-right corner: Open PDF in a new tab.
- The page scrolls down the desk as the sheet runs long (it "grows", as now). The wood background tiles vertically.
- The readable-text view is removed. The sheet image's `alt` points to the PDF, which has selectable text. Keep `resumeText.json` for now, unused, unless a later accessibility pass reinstates it.

### 5.7 Contact: postcard

- Full-bleed postcard art. The message side stays as now.
- **The address lines are the links**, written in the handwriting font on the address rules:
  - the email address (a `mailto:` link);
  - GitHub ↗;
  - LinkedIn ↗.
- **Click the stamp to copy the email** (a `<button>`, "Copy email address").
  - On success, a circular postmark "COPIED · ITHACA" stamps over it: scale from 1.2 to 1, opacity 0 to 1, 300ms, reduced-motion → fade. The postmark stays visible for 2s.
  - The text in an `aria-live` region changes to "Email copied".
  - If the clipboard fails, the postmark reads "COPY FAILED" and the `mailto:` link stays available.

## 6. Transitions and motion

- Keep the existing View Transitions zoom: into the object on open, back out toward it on close, and a cross-fade for any other swap.
- With no sibling navigation, the only transitions are desk → object and object → desk.
- All motion is gated by `prefers-reduced-motion`. Reduced motion gets opacity cross-fades.
- Hover styles go only under `@media (hover: hover)`. Press feedback scales to 0.96 over 150ms (§ previous polish pass).

## 7. Phasing and acceptance criteria

### Phase 1: Remove the chrome
1. The desk is full-bleed with the cover stage, the safe-zone crop bias, and the intro card. The topline, intro, index and page gradient are removed.
2. All subpages are full-bleed with no header, footer, visible h1 or kicker.
3. The Snorlax peek back link is on every subpage.
4. Clean-click-on-wood goes back, with region data for all six views.
5. The hidden accessibility nav card appears on focus.

**Accept when:**
- At 1440×900, 1280×720, 1920×1080 and 1024×768, there is no visible margin, page background, scrollbar on the desk, or web chrome.
- Every desk object is fully visible and clickable at 1440×900, 1280×720 and 1920×1080.
- Tab from page load reaches the hidden nav first, then the objects.
- Selecting text on a page and releasing over the wood does *not* go back.
- A Playwright run (extend `scripts/verify-layout.mjs`) reports zero overflow and zero targets outside the viewport at aspect ratios ≥ 1.0.

### Phase 2: Objects behave like objects
1. Research page turns between papers.
2. Notebook pagination (if overflowing).
3. Experience flip stack.
4. Résumé two-sheet stack, with the clip and stamp.
5. Postcard address links and stamp copy.

**Accept when:**
- Every interaction works by mouse, keyboard (Enter/Space, plus arrows for the books) and touch.
- Each has a reduced-motion variant.
- The removed controls (`.paper-picker`, `.experience-tabs`, `.resume-controls`) are gone, and their CSS is deleted.

### Phase 3: Life and phones
1. Idle shimmer.
2. Snorlax stir and Zzz easter egg.
3. Portrait desk art, portrait hit-paths, and a portrait intro card.

**Accept when:**
- The shimmer plays exactly once per load, after 4s idle, and never after an object has been opened.
- At 390×844 and 360×780 the portrait desk shows every object with no cropping, and each tap target is ≥ 44px in its smaller dimension.

## 8. Art brief (the only new asset)

- **Portrait desk:** about 1290×2796 PNG. The same warm painted style, palette and lighting as `Assets Masked/Base.png`.
  - Same objects, each still showing its baked label: laptop "Projects", books "Research", notebook "About Me", clipped papers "Experience", postcard "Contact", drawer with "Resume" paper.
  - Also Snorlax asleep with the cookie tin and mug, and pinned wall notes at the top for the intro card.
  - Composition: window and wall at the top; Snorlax upper-middle; laptop and books middle; notebook and papers lower; postcard and drawer bottom.
  - Keep a ~6% margin from every edge clear of objects.
  - Keep the bottom-left 140×140px region free of important detail.
- Trace the hit-paths afterwards with the existing `scripts/trace-desk-masks.py` workflow, using green outline masks per object.

## 9. Open questions

1. **Snorlax wobble layer.** Does `snorlax-lying.png` match the pose in `Base.png` well enough to overlay? If not, should the easter egg be bubble-only?
2. **Intro card position on narrow desktop crops.** If the cover crop trims the right wall at about 1.45 aspect ratio, should the card move to the window area?
3. **Résumé text for screen readers.** Removing the readable view relies on the PDF. Is that acceptable, or should the sheet image get a `<details>` with the plain text that is visually hidden?
4. **Wood click on the laptop page.** The laptop art has a lot of window and wall in frame. Does clicking the *window* also count as "the desk"? The default is yes: everything outside the object region.

## 10. Out of scope

- A colophon or "how this was built" object.
- Sound.
- Time-of-day or seasonal art.
- Content rewrites.
- Removing the dead `.scene-*` CSS layers. This is optional cleanup, allowed when touching nearby rules.
