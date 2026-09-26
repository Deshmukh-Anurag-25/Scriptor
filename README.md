# writecode

A distraction-free, notebook-style rich text editor — originally a
single HTML file, now a React + Vite project. Everything runs
client-side; there is no backend or account system. All data lives in
the browser’s `localStorage`.

**Live Demo:**
[writecode](https://deshmukh-anurag-25.github.io/Scriptor/)

## Feature overview

### Core editor

- Rich text editing via `contentEditable` + `document.execCommand`:
  bold, italic, underline, strikethrough, super/subscript, text color &
  highlight, alignment, ordered/unordered lists, indent/outdent, links,
  images, tables, horizontal rules, page breaks, clear formatting,
  undo/redo.
- Paragraph styles (Normal / H1 / H2 / H3 / Quote), font family picker
  (14 serif/sans/mono fonts), font size, and line-height control.
- 6 color themes (Light, Sepia, Slate, Forest, Nord, Dark), persisted
  independently of any page.
- Focus mode (hides all chrome except the page) and a find & replace
  bar.
- Live word count, character count, estimated reading time, and an
  auto-generated outline (from H1/H2/H3) with click-to-scroll.
- Autosave, debounced 400ms after you stop typing, with a
  “Saving…/Saved” status chip.

### Editing quality

- **Markdown shortcuts** — type `#`, `##`, `###`, `>`, `-`/`*`, or `1.`
  at the start of a line to auto-convert it to a heading, quote, or
  list. Type `**bold**`, `*italic*` / `_italic_`, or `` `code` `` inline
  in a plain paragraph to convert it on the fly.
- **Slash-command menu** — type `/` on an empty line for a quick-insert
  menu (Heading, Quote, Bullet/Numbered list, Table, Image, Divider).
- **Image compression** — inserted images are downscaled and re-encoded
  on a canvas before being embedded, instead of storing the original
  file byte-for-byte, to keep the `localStorage` footprint smaller.

### Organization

- **Tags** — add/remove tags per page from the sidebar; filter the “All
  pages” list by one or more tags via chip toggles; tags also show
  inline next to each page’s title.
- **Indexed full-text search** — an in-memory inverted index (token →
  page ids) built from title + content + tags, ranked by matching-token
  count with prefix matching (so “meet” matches “meeting”), rebuilt
  whenever pages change.
- **Page templates** — “New page” is a split button: click for a blank
  page, or open the caret for Meeting Notes / Blog Draft / To-do List
  starting points.
- Pin pages to the top of the list, trash/restore, and search across all
  non-trashed pages.

### Export / Import

- **Export**: plain text (`.txt`), Markdown (`.md`), a standalone web
  page (`.html`), Word (`.doc`), and a real generated PDF (`.pdf`) — not
  just the browser’s print dialog.
- **Import**: drop in a `.md`, `.html`, `.txt`, or `.docx` file and it
  becomes a new page (Markdown parsed via `marked`, Word via `mammoth`,
  plain text paragraph-wrapped, HTML used as-is).

### Polish

- **Command palette** (`Ctrl+/` or the ⌘ icon) — fuzzy-searchable list
  of every action: new page/template, theme switch, formatting commands,
  exports, toggles.
- **Mobile-responsive layout** — below ~780px wide the sidebar becomes a
  slide-over panel with a tap-to-close backdrop instead of squeezing the
  editor; the breadcrumb and save-status chip hide on very narrow
  screens.
- Full keyboard shortcut support (see table below).

## Keyboard shortcuts

| Shortcut                                    | Action                                    |
|---------------------------------------------|-------------------------------------------|
| `Ctrl/Cmd + B`                              | Bold                                      |
| `Ctrl/Cmd + I`                              | Italic                                    |
| `Ctrl/Cmd + U`                              | Underline                                 |
| `Ctrl/Cmd + Z` / `Y`                        | Undo / Redo                               |
| `Ctrl/Cmd + F`                              | Find & replace                            |
| `Ctrl/Cmd + K`                              | Insert link                               |
| `Ctrl/Cmd + /`                              | Command palette                           |
| `F11`                                       | Toggle focus mode                         |
| `Esc`                                       | Close find bar / palette, exit focus mode |
| `/` (start of line)                         | Open slash-command menu                   |
| `#`, `##`, `###`                            | Heading 1 / 2 / 3                         |
| `>`                                         | Quote                                     |
| `-`, `*`, `1.`                              | Bullet / numbered list                    |
| `**text**`, `*text*`/`_text_`, `` `text` `` | Bold / italic / inline code               |

## Project structure

``` text
writecode-react/
├── index.html               Vite HTML entry (fonts, #root mount point)
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx              React root render
    ├── App.jsx               Top-level state, exec() command dispatcher,
    │                          keyboard shortcuts, import/export handlers,
    │                          command palette wiring
    ├── styles.css              All CSS (themes, layout, components, mobile
    │                          media queries) — ported from the original file
    ├── constants.js             localStorage keys, font map, color palettes,
    │                          theme list, page templates
    ├── utils.js                 stripHtml / escapeHtml / downloadBlob
    ├── hooks/
    │   └── usePages.js          All page state: load/save to localStorage,
    │                           create (blank/template/import), autosave,
    │                           pin/trash/restore, "last active page" logic
    ├── utils/
    │   ├── editorHelpers.js     Markdown auto-format + current-block lookup
    │   ├── searchIndex.js       Inverted-index full-text search
    │   ├── imageResize.js       Canvas-based image downscale/compress
    │   ├── markdown.js          HTML ⇄ Markdown (marked / turndown)
    │   ├── docx.js               .docx → HTML (mammoth)
    │   └── pdf.js                HTML → PDF (jsPDF + html2canvas)
    └── components/
        ├── TopBar.jsx            Logo, sidebar/focus/find toggles, command
        │                        palette trigger, theme popover, Import
        │                        button, Export select, New Page menu
        ├── NewPageMenu.jsx       Split "New page" button + template popover
        ├── ImportButton.jsx      File picker + per-format parsing
        ├── BlockToolbar.jsx      Formatting buttons, style/font/size/
        │                        line-height selects, color popovers
        ├── FindBar.jsx            Find & replace
        ├── SlashMenu.jsx          Floating quick-insert menu
        ├── CommandPalette.jsx     Fuzzy-filterable action list (Ctrl+/)
        ├── Sidebar.jsx            Page tab (Details/Tags/Outline/Notes) +
        │                        All Pages tab (search, tag filter, pin,
        │                        trash, restore)
        ├── TagEditor.jsx          Tag chip input for the current page
        └── Editor.jsx             The title + content contentEditable divs,
                                   markdown auto-format & slash-menu wiring
```

## Setup

``` bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

## Data & storage model

Everything lives in the browser’s `localStorage` — there is no server,
no accounts, and no cross-device sync.

- **`writecode.pages.v1`** — a single JSON array holding every page:

  ``` js
  { id, title, content, notes, tags, pinned, trashed, updated }
  ```

  Every edit re-serializes the whole array to this one key, debounced
  400ms after you stop typing (`scheduleSave` in `usePages.js`).

- **`writecode.theme`**, **`writecode.font`**, **`writecode.lh`** —
  display preferences (theme, content font, line height), independent of
  any page.

**“Last session” isn’t stored as an explicit pointer.** There’s no “page
X was open when you closed the tab” record. Instead, on every load the
app picks whichever non-trashed page has the most recent `updated`
timestamp — i.e., the page you *edited* most recently, not necessarily
whichever page happened to be on screen:

``` js
pages.filter(p => !p.trashed).sort((a, b) => b.updated - a.updated)[0]?.id
```

This is computed once, synchronously, in `usePages`’ initial state
(`pickLastActiveId`). If you want it to instead persist the literal last
*viewed* page id (even if you didn’t edit it), that’s a small,
deliberate change — ask and I can add it as an explicit
`writecode.lastActiveId` key.

All `localStorage` reads/writes are wrapped in try/catch, so private
browsing or a full storage quota fail quietly rather than crashing the
app.

## Known limitations / possible next steps

- **No sync or backup**: data is single-browser, single-device. Clearing
  site data or switching browsers loses everything. A real backend (or
  at minimum an export-all/import-all backup file) would fix this.
- **`document.execCommand` is deprecated.** It still works everywhere
  today, but a real editor engine (TipTap or Lexical) would fix
  occasional cursor/list-nesting quirks and remove the deprecation risk
  long-term. This is a rewrite of the editing core, not a small add-on.
- **Inline markdown conversion moves the cursor to the end of the
  block** — a trade-off of doing this without a full editor engine.
- **No real-time collaboration** — single-user only, by design so far.
- **No version history** — no way to roll back to an earlier draft of a
  page beyond browser undo within the current session.
