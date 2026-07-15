# Editing the Prod Lab article

The site is one file (`index.html`). The Prod Lab article inside it is a sequence of
`<!-- MODULE: name -->` blocks. Two ways to edit:

## Edit mode (recommended)

1. From this folder run: `python3 -m http.server 8741`
2. Open **http://localhost:8741/editor.html**
3. Edit:
   - **Click any text** to edit it in place (double-click collapsible titles).
   - **Hover a block** for the toolbar: move ↑↓, edit raw HTML, ＋ add a module below, delete.
   - **＋ Add section** (top bar) appends at the end. Module types: stage, substage, prose,
     photo/GIF, collapse, code, callout, table, checklist, steps.
   - Photos/GIFs are auto-named `NN-slug.ext` continuing the existing numbering.
4. **Preview site** opens the assembled result in a new tab (check it before applying).
5. **Apply ⬇** downloads:
   - `index.html` → replace the one at the site root
   - any new images → move into `images/homelab/`
6. Reload the site to verify. If anything looks wrong, `git checkout index.html` restores
   the last committed version.

The editor rebuilds the TOC automatically from `data-toc` attributes, and the page's
router picks up section ids automatically — no script edits needed.

## By hand (fallback)

Copy an existing `<!-- MODULE: … -->` block in `index.html` and edit it. For a new
stage: give it a unique `id` and a `data-toc="Short label"` attribute, and add a matching
`<li>` inside the `<!-- toc:auto:start -->` markers (or just open the editor and hit
Apply — it regenerates the TOC for you). Number new images continuing from the highest
`NN-` in `images/homelab/`.
