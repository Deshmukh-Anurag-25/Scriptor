# writecode (React port)

A React + Vite port of the single-file `writecode` HTML app. Same look, same
`contentEditable` + `document.execCommand` editing approach, same
`localStorage`-based persistence — just split into components/hooks.

## Run it

```bash
npm install
npm run dev
```

## Project layout

```
src/
  constants.js       LS keys, font map, color palettes, theme list
  utils.js           stripHtml / escapeHtml / downloadBlob
  hooks/usePages.js  all page state + localStorage read/write (see below)
  components/
    TopBar.jsx        logo, sidebar/focus/find toggles, theme popover, export, "New page"
    BlockToolbar.jsx   formatting buttons, style/font/size/line-height selects, color pickers
    FindBar.jsx        find & replace
    Sidebar.jsx        Details/Outline/Notes tab + All pages tab (search, pin, trash, restore)
    Editor.jsx         the two contentEditable divs (title + content)
  App.jsx            wires it all together, holds exec()/keyboard shortcuts/theme prefs
```

## How storage works (and how "last session" is restored)

Nothing changed about the storage model — I kept it exactly as it was, just
moved into `usePages.js`.

**One localStorage key holds everything:** `writecode.pages.v1`. It's a JSON
array of page objects:

```js
{ id, title, content, notes, pinned, trashed, updated }
```

Every edit (title, body, or notes) is written back to this array and the
whole array is re-serialized to that key, debounced 400ms after you stop
typing (`scheduleSave` in `usePages.js` — identical timing to the original's
`scheduleSave()`).

**There is no dedicated "last open page" record.** The app never stores
"page X was the one open when you closed the tab." Instead, on every load it
*recomputes* which page to open with this rule (`pickLastActiveId`):

```js
pages.filter(p => !p.trashed).sort((a, b) => b.updated - a.updated)[0]?.id
```

In plain terms: **"last session" = whichever non-trashed page has the most
recent `updated` timestamp** — i.e. the page you *edited* most recently, not
necessarily the page that happened to be open on screen when you left. If you
opened Page B to read it but only typed in Page A, reloading will bring you
back to Page A, because that's the one with the newer `updated` value.

This happens once, synchronously, in `usePages`' initial state:

```js
const [activeId, setActiveId] = useState(() => pickLastActiveId(loadPagesFromStorage()));
```

Three other, unrelated preferences persist the same way but under separate
keys, and are restored in `App.jsx` on mount:
- `writecode.theme` — color theme
- `writecode.font` — content font family
- `writecode.lh` — line height

These aren't tied to a page, so they don't participate in the "last active
page" logic at all — they just get re-applied to `<html data-theme>` /
CSS variables on load.

### If you want *true* "reopen exactly what I was looking at" behavior

The current rule is a reasonable approximation but can surprise you (see the
Page A/B example above). If you'd rather persist the actual last-viewed page
id explicitly, it's a small change to `usePages.js`:

```js
const LAST_ACTIVE_KEY = 'writecode.lastActiveId';

// on activeId change:
useEffect(() => {
  if (activeId) localStorage.setItem(LAST_ACTIVE_KEY, activeId);
}, [activeId]);

// on load, prefer the stored id if it still points at a real, non-trashed page:
function pickLastActiveId(pages) {
  const stored = localStorage.getItem(LAST_ACTIVE_KEY);
  if (stored && pages.some(p => p.id === stored && !p.trashed)) return stored;
  return pages.filter(p => !p.trashed).sort((a, b) => b.updated - a.updated)[0]?.id ?? null;
}
```

I didn't make this change by default since it's a behavior change from the
original app, not just a framework port — happy to add it if you want that
instead.

## New features

### Editing quality
- **Markdown shortcuts**: type `# `, `## `, `### `, `> `, `- `/`* `, or `1. ` at
  the start of a line to auto-format as heading/quote/list. Type `**bold**`,
  `*italic*`/`_italic_`, or `` `code` `` in an otherwise-plain paragraph to
  convert it inline (implemented in `utils/editorHelpers.js`). Note: on an
  inline conversion the cursor jumps to the end of that block — a known
  trade-off of doing this without a full editor engine.
- **Slash-command menu**: type `/` on an empty line to get a small menu
  (Heading, Quote, Lists, Table, Image, Divider) — `SlashMenu.jsx`.
- **Image compression**: inserted images are now downscaled/re-encoded via a
  canvas (`utils/imageResize.js`) before being embedded as base64, instead of
  storing the original file byte-for-byte. Keeps the single `localStorage`
  blob (all pages live in one key) from bloating as fast.
- I did **not** swap `document.execCommand` for a real editor engine
  (TipTap/Lexical). That's a genuine rewrite of the editing core, not a
  feature add — say the word if you want that separately.

### Organization
- **Tags**: add/remove tags on the current page from the new "Tags" panel in
  the sidebar (`TagEditor.jsx`). Filter the "All pages" list by tag with the
  chip row at the top, and see `#tag` next to each page's title.
- **Indexed full-text search**: `utils/searchIndex.js` builds a token →
  page-id inverted index (title + content + tags) and ranks results by
  matching-token count with prefix matching, instead of the old plain
  substring scan. Rebuilt via `useMemo` whenever `pages` changes.
- **Templates**: "New page" is now a split button — click for a blank page,
  click the caret for Meeting notes / Blog draft / To-do list templates
  (`constants.js` → `TEMPLATES`, `NewPageMenu.jsx`).

### Export / Import
- **Markdown export** (`.md`) via `turndown` (HTML → Markdown).
- **Import**: an "Import" button accepts `.md`, `.html`, `.txt`, and `.docx`
  files and creates a new page from them — Markdown via `marked`, Word via
  `mammoth`, plain text is paragraph-wrapped (`ImportButton.jsx`).
- **Real PDF export**: replaced `window.print()` with an actual generated
  PDF via `jspdf` + `html2canvas` (`utils/pdf.js`), falling back to the print
  dialog if rendering throws.

### Polish
- **Command palette** (`Ctrl+/` or the ⌘ icon in the top bar): fuzzy-filter
  and run any action — new page/template, theme, formatting, export, etc.
  (`CommandPalette.jsx`).
- **Mobile-responsive layout**: below ~780px the sidebar becomes a slide-over
  panel with a tap-to-close backdrop instead of squeezing the canvas; the
  breadcrumb and save-status chip hide on very narrow screens to avoid
  overlap. Pure CSS, in the `@media` blocks at the bottom of `styles.css`.
- Did not add word-count goals/streaks — that felt like it depends on which
  direction (personal notes vs. writing app) you want to take this, so I
  left it out rather than guess.

## Notes on the port

- Editing stays **uncontrolled**: the title/content `contentEditable` divs
  are driven by refs, not React state, and `document.execCommand` is still
  used for formatting — matching the original rather than rewriting the rich
  text engine.
- `localStorage` is same-origin/browser-only, so data doesn't sync across
  devices or browsers — identical limitation to the original file.
- All localStorage reads/writes are wrapped in try/catch, same as the
  original (private browsing / storage-full edge cases fail quietly).
