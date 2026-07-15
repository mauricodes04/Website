/* ====================================================================
   Prod Lab edit mode — editor.js
   Pure transform core (also loadable in Node for tests) + browser UI.
   The editor never writes files: Apply downloads the regenerated
   index.html and any new images, already renamed for images/homelab/.
==================================================================== */
(function (global) {
  'use strict';

  const MODULE_MARK = '<!-- MODULE:';
  const MAIN_OPEN = '<main>';
  const FOOTER_MARK = '<footer class="footer">';
  const TOC_START = '<!-- toc:auto:start -->';
  const TOC_END = '<!-- toc:auto:end -->';
  const IMG_DIR = 'images/homelab/';

  /* ---------------- pure core ---------------- */

  // Split the whole site file around the article's <main> content.
  // Everything in head/tail is preserved byte-for-byte (except the TOC
  // markers region, regenerated on assemble).
  function splitSite(html) {
    const mainStart = html.indexOf(MAIN_OPEN);
    if (mainStart === -1) throw new Error('Could not find <main> in index.html');
    const contentStart = mainStart + MAIN_OPEN.length;
    const footerStart = html.indexOf(FOOTER_MARK, contentStart);
    if (footerStart === -1) throw new Error('Could not find the article footer');
    return {
      head: html.slice(0, contentStart),
      mainContent: html.slice(contentStart, footerStart),
      tail: html.slice(footerStart),
    };
  }

  // Split main content into MODULE blocks. A decorative banner comment
  // (<!-- ==== STAGE N ==== -->) directly above a MODULE comment is
  // folded into that block.
  function parseBlocks(mainContent) {
    const marks = [];
    let i = mainContent.indexOf(MODULE_MARK);
    while (i !== -1) { marks.push(i); i = mainContent.indexOf(MODULE_MARK, i + 1); }
    if (!marks.length) return { prefix: mainContent, blocks: [] };

    const starts = marks.map(k => {
      let j = k;
      for (;;) {
        let t = j;
        while (t > 0 && /\s/.test(mainContent[t - 1])) t--;
        if (!mainContent.slice(0, t).endsWith('-->')) break;
        const open = mainContent.lastIndexOf('<!--', t);
        if (open === -1) break;
        const comment = mainContent.slice(open, t);
        if (!/^<!--\s*=+[\s\S]*=+\s*-->$/.test(comment)) break;
        j = open;
      }
      return j;
    });

    const blocks = [];
    for (let k = 0; k < starts.length; k++) {
      const end = k + 1 < starts.length ? starts[k + 1] : mainContent.length;
      blocks.push({ html: mainContent.slice(starts[k], end) });
    }
    return { prefix: mainContent.slice(0, starts[0]), blocks };
  }

  // Build TOC <li> entries from every element carrying data-toc,
  // in document order. Stage blocks get their badge as a "N · " prefix
  // when it is alphanumeric (the "→" future badge is skipped).
  function buildToc(html) {
    const items = [];
    const tagRe = /<[a-zA-Z][^>]*\bdata-toc="([^"]*)"[^>]*>/g;
    let m;
    while ((m = tagRe.exec(html))) {
      const tag = m[0];
      const idm = tag.match(/\bid="([^"]+)"/);
      if (!idm) continue;
      let prefix = '';
      if (/\bclass="stage[\s"]/.test(tag)) {
        const after = html.slice(tagRe.lastIndex, tagRe.lastIndex + 300);
        const nm = after.match(/class="stage-num">([^<]*)</);
        if (nm && /^[0-9A-Za-z]+$/.test(nm[1].trim())) prefix = nm[1].trim() + ' · ';
      }
      items.push('        <li><a href="#' + idm[1] + '">' + prefix + m[1] + '</a></li>');
    }
    return items.join('\n');
  }

  function spliceToc(head, tocLis) {
    const a = head.indexOf(TOC_START);
    const b = head.indexOf(TOC_END);
    if (a === -1 || b === -1) throw new Error('TOC auto markers not found');
    return head.slice(0, a + TOC_START.length) + '\n' + tocLis + '\n        ' + head.slice(b);
  }

  // Reassemble the full index.html from parts + (possibly edited) blocks.
  function assemble(parts, prefix, blocks) {
    const body = blocks.map(b => b.html).join('');
    return spliceToc(parts.head, buildToc(body)) + prefix + body + parts.tail;
  }

  function nextImageNumber(html) {
    let max = 0;
    const re = /images\/homelab\/(\d+)-/g;
    let m;
    while ((m = re.exec(html))) max = Math.max(max, parseInt(m[1], 10));
    return max + 1;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }

  function slugify(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '').slice(0, 40) || 'image';
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  // Plain text -> prose paragraphs (blank line = new paragraph).
  // Inline HTML like <code> passes through; input starting with a tag
  // is treated as ready-made HTML.
  function proseBody(text, indent) {
    const t = String(text).trim();
    if (t.startsWith('<')) return indent + t.replace(/\n/g, '\n' + indent);
    return t.split(/\n\s*\n/).map(p =>
      indent + '<p class="prose">\n' + indent + '  ' +
      p.trim().replace(/\n/g, '\n' + indent + '  ') +
      '\n' + indent + '</p>'
    ).join('\n');
  }

  // Every template returns a block shaped exactly like the existing
  // ones: starts at "<!-- MODULE:" (or its stage banner) and ends with
  // "\n\n  " so blocks tile together cleanly.
  const templates = {
    stage(d) {
      return '<!-- ============================== STAGE ' + String(d.num).toUpperCase() +
        ' ============================== -->\n' +
        '  <!-- MODULE: stage -->\n' +
        '  <div class="stage" id="' + d.id + '" data-toc="' + escapeAttr(d.toc) + '">\n' +
        '    <span class="stage-num">' + escapeHtml(d.num) + '</span>\n' +
        '    <h2>' + escapeHtml(d.title) + '</h2>\n' +
        '  </div>\n\n  ';
    },
    substage(d) {
      return '<!-- MODULE: substage -->\n' +
        '  <div class="substage" id="' + d.id + '">\n' +
        '    <h3><span class="sub-num">' + escapeHtml(d.num) + '</span>' + escapeHtml(d.title) + '</h3>\n' +
        '  </div>\n\n  ';
    },
    prose(d) {
      return '<!-- MODULE: prose -->\n' + proseBody(d.text, '  ') + '\n\n  ';
    },
    photo(d) {
      return '<!-- MODULE: photo -->\n' +
        '  <figure class="photo">\n' +
        '    <img src="' + IMG_DIR + d.filename + '" alt="' + escapeAttr(d.alt) + '" loading="lazy">\n' +
        '    <figcaption>' + escapeHtml(d.caption) + '</figcaption>\n' +
        '  </figure>\n\n  ';
    },
    collapse(d) {
      return '<!-- MODULE: collapse -->\n' +
        '  <details class="collapse">\n' +
        '    <summary>' + escapeHtml(d.summary) + '</summary>\n' +
        '    <div class="collapse-body">\n' +
        proseBody(d.body, '      ') + '\n' +
        '    </div>\n' +
        '  </details>\n\n  ';
    },
    code(d) {
      return '<!-- MODULE: code -->\n' +
        '  <div class="codeblock">\n' +
        '    <button class="copy-btn" type="button">Copy</button>\n' +
        '    <pre>' + escapeHtml(String(d.code).replace(/\s+$/, '')) + '</pre>\n' +
        '  </div>\n\n  ';
    },
    callout(d) {
      return '<!-- MODULE: callout -->\n' +
        '  <div class="callout' + (d.kind === 'warning' ? ' warning' : '') + '">\n' +
        '    <span class="callout-label">' + escapeHtml(d.label) + '</span>\n' +
        '    ' + String(d.text).trim().replace(/\n/g, '\n    ') + '\n' +
        '  </div>\n\n  ';
    },
    table(d) {
      const rows = String(d.data).trim().split('\n').map(r => r.trim()).filter(Boolean);
      const delim = rows[0] && rows[0].includes('\t') ? '\t' : ',';
      const cells = r => r.split(delim).map(c => c.trim());
      const head = cells(rows[0] || '');
      const bodyRows = rows.slice(1).map(r =>
        '        <tr>' + cells(r).map(c => '<td>' + c + '</td>').join('') + '</tr>'
      ).join('\n');
      return '<!-- MODULE: table -->\n' +
        '  <div class="table-scroll">\n' +
        '    <table' + (d.wide ? ' class="table-wide"' : '') + '>\n' +
        '      <caption>' + escapeHtml(d.caption) + '</caption>\n' +
        '      <thead><tr>' + head.map(h => '<th>' + h + '</th>').join('') + '</tr></thead>\n' +
        '      <tbody>\n' + bodyRows + '\n      </tbody>\n' +
        '    </table>\n' +
        '  </div>\n\n  ';
    },
    checklist(d) {
      return '<!-- MODULE: checklist -->\n' +
        '  <ul class="checklist">\n' +
        d.items.map(i => '    <li>' + i + '</li>').join('\n') + '\n' +
        '  </ul>\n\n  ';
    },
    steps(d) {
      return '<!-- MODULE: steps -->\n' +
        '  <ol class="steps">\n' +
        d.items.map(i => '    <li>' + i + '</li>').join('\n') + '\n' +
        '  </ol>\n\n  ';
    },
  };

  const core = {
    splitSite, parseBlocks, buildToc, spliceToc, assemble,
    nextImageNumber, escapeHtml, escapeAttr, slugify, pad2, templates,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = core;
    return;
  }
  global.ProdLabEditorCore = core;
  if (typeof document === 'undefined') return;

  /* ---------------- browser UI ---------------- */

  let parts = null;        // { head, mainContent, tail }
  let prefix = '';         // whitespace before the first block
  let blocks = [];         // [{ html }]
  let pendingImages = [];  // [{ name, file, url }]
  let imageCounter = 0;    // next NN for new images
  let dirty = false;
  let insertIndex = 0;

  const $ = sel => document.querySelector(sel);

  function setDirty(v) {
    dirty = v;
    $('#ed-status').textContent = v ? 'Unsaved changes — hit Apply to download' : 'No changes';
    $('#ed-status').classList.toggle('ed-dirty', v);
  }

  window.addEventListener('beforeunload', e => {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  async function init() {
    let html;
    try {
      const res = await fetch('index.html?ts=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      html = await res.text();
    } catch (err) {
      $('#ed-blocks').innerHTML =
        '<div class="ed-error"><h2>Could not load index.html</h2>' +
        '<p>The editor needs the site served over HTTP. From the site folder run:</p>' +
        '<pre>python3 -m http.server 8741</pre>' +
        '<p>then open <code>http://localhost:8741/editor.html</code></p>' +
        '<p class="ed-error-detail">' + escapeHtml(String(err)) + '</p></div>';
      return;
    }
    // Adopt the site's own stylesheet so previews render pixel-true.
    const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
    if (styleMatch) {
      const styleEl = document.createElement('style');
      styleEl.textContent = styleMatch[1];
      document.head.insertBefore(styleEl, $('#ed-style'));
    }
    parts = splitSite(html);
    const parsed = parseBlocks(parts.mainContent);
    prefix = parsed.prefix;
    blocks = parsed.blocks;
    imageCounter = nextImageNumber(html);
    pendingImages = [];
    setDirty(false);
    render();
  }

  function displayHtml(html) {
    let out = html;
    for (const p of pendingImages) out = out.split(IMG_DIR + p.name).join(p.url);
    return out;
  }

  function serializeBack(html) {
    let out = html;
    for (const p of pendingImages) out = out.split(p.url).join(IMG_DIR + p.name);
    return out;
  }

  function readPreview(previewEl) {
    const clone = previewEl.cloneNode(true);
    clone.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable'));
    clone.querySelectorAll('details[open]').forEach(e => e.removeAttribute('open'));
    let html = serializeBack(clone.innerHTML);
    if (!/\n\s*$/.test(html)) html += '\n\n  ';
    return html;
  }

  function moduleName(html) {
    const m = html.match(/<!-- MODULE: *(\w+)/);
    return m ? m[1] : 'html';
  }

  function render() {
    const list = $('#ed-blocks');
    list.innerHTML = '';
    blocks.forEach((block, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'ed-block';
      wrap.innerHTML =
        '<div class="ed-tools">' +
        '<span class="ed-tag">' + moduleName(block.html) + '</span>' +
        '<button data-act="up" title="Move up">↑</button>' +
        '<button data-act="down" title="Move down">↓</button>' +
        '<button data-act="edit" title="Edit HTML">HTML</button>' +
        '<button data-act="add" title="Add module below">＋</button>' +
        '<button data-act="del" title="Delete">✕</button>' +
        '</div>' +
        '<div class="ed-preview"></div>';
      const preview = wrap.querySelector('.ed-preview');
      preview.innerHTML = displayHtml(block.html);
      wirePreviewEditing(preview, block);
      wrap.querySelector('.ed-tools').addEventListener('click', e => {
        const act = e.target.dataset && e.target.dataset.act;
        if (!act) return;
        if (act === 'up' && idx > 0) { [blocks[idx - 1], blocks[idx]] = [blocks[idx], blocks[idx - 1]]; setDirty(true); render(); }
        if (act === 'down' && idx < blocks.length - 1) { [blocks[idx + 1], blocks[idx]] = [blocks[idx], blocks[idx + 1]]; setDirty(true); render(); }
        if (act === 'edit') openHtmlEditor(block);
        if (act === 'add') openPalette(idx + 1);
        if (act === 'del' && confirm('Delete this ' + moduleName(block.html) + ' block?')) {
          pendingImages = pendingImages.filter(p => !block.html.includes(IMG_DIR + p.name));
          blocks.splice(idx, 1); setDirty(true); render();
        }
      });
      list.appendChild(wrap);
    });
  }

  // Click-to-edit: click text to edit in place (double-click for
  // collapsible titles, since a single click toggles them).
  const EDITABLE = '.prose, figcaption, h2, h3, pre, .callout, li';
  function wirePreviewEditing(preview, block) {
    const startEdit = el => {
      if (el.isContentEditable) return;
      el.setAttribute('contenteditable', 'true');
      el.focus();
      el.addEventListener('blur', () => {
        el.removeAttribute('contenteditable');
        const html = readPreview(preview);
        if (html !== block.html) { block.html = html; setDirty(true); }
      }, { once: true });
    };
    preview.addEventListener('click', e => {
      if (e.target.closest('button, a, summary')) return;
      const el = e.target.closest(EDITABLE);
      if (el && preview.contains(el)) startEdit(el);
    });
    preview.addEventListener('dblclick', e => {
      const s = e.target.closest('summary');
      if (s && preview.contains(s)) startEdit(s);
    });
  }

  /* --------- modals --------- */

  function openModal(title, bodyHtml, onSubmit) {
    $('#ed-modal-title').textContent = title;
    $('#ed-modal-body').innerHTML = bodyHtml;
    $('#ed-modal-save').textContent = 'Save';
    $('#ed-modal').classList.add('open');
    $('#ed-modal-save').onclick = () => { if (onSubmit() !== false) closeModal(); };
  }
  function closeModal() { $('#ed-modal').classList.remove('open'); }

  function openHtmlEditor(block) {
    openModal('Edit block HTML',
      '<textarea id="ed-f-html" rows="18" spellcheck="false"></textarea>',
      () => {
        let v = $('#ed-f-html').value;
        if (!/\n\s*$/.test(v)) v += '\n\n  ';
        if (v !== block.html) { block.html = v; setDirty(true); }
        render();
      });
    $('#ed-f-html').value = block.html;
  }

  const PALETTE_FORMS = {
    stage: '<label>Badge (e.g. 8)<input id="ed-f-num"></label>' +
      '<label>Title<input id="ed-f-title"></label>' +
      '<label>TOC label (short)<input id="ed-f-toc"></label>',
    substage: '<label>Badge (e.g. 8a)<input id="ed-f-num"></label>' +
      '<label>Title<input id="ed-f-title"></label>',
    prose: '<label>Text (blank line = new paragraph; inline HTML ok)<textarea id="ed-f-text" rows="8"></textarea></label>',
    photo: '<label>Image / GIF<input type="file" id="ed-f-file" accept="image/*"></label>' +
      '<label>Caption<input id="ed-f-caption"></label>' +
      '<label>Alt text (what the image shows)<input id="ed-f-alt"></label>',
    collapse: '<label>Title (the clickable summary)<input id="ed-f-summary"></label>' +
      '<label>Body (text or HTML)<textarea id="ed-f-body" rows="8"></textarea></label>',
    code: '<label>Code / console text<textarea id="ed-f-code" rows="8" spellcheck="false"></textarea></label>',
    callout: '<label>Type<select id="ed-f-kind"><option value="note">Note (blue)</option>' +
      '<option value="warning">Warning (amber)</option></select></label>' +
      '<label>Label<input id="ed-f-label" value="Note"></label>' +
      '<label>Text (inline HTML ok)<textarea id="ed-f-text" rows="4"></textarea></label>',
    table: '<label>Caption<input id="ed-f-caption"></label>' +
      '<label>Rows — first row is the header. Cells separated by Tab or comma' +
      '<textarea id="ed-f-data" rows="8" spellcheck="false"></textarea></label>' +
      '<label class="ed-check"><input type="checkbox" id="ed-f-wide"> Wide table (min-width 860px)</label>',
    checklist: '<label>Items, one per line<textarea id="ed-f-items" rows="6"></textarea></label>',
    steps: '<label>Steps, one per line<textarea id="ed-f-items" rows="6"></textarea></label>',
  };

  function openPalette(at) {
    insertIndex = at;
    const options = Object.keys(PALETTE_FORMS)
      .map(k => '<option value="' + k + '">' + k + '</option>').join('');
    openModal('Add module',
      '<label>Module type<select id="ed-f-type">' + options + '</select></label>' +
      '<div id="ed-f-fields">' + PALETTE_FORMS.stage + '</div>',
      submitPalette);
    $('#ed-f-type').addEventListener('change', e => {
      $('#ed-f-fields').innerHTML = PALETTE_FORMS[e.target.value];
    });
  }

  function val(id) { const el = $(id); return el ? el.value : ''; }

  function submitPalette() {
    const type = $('#ed-f-type').value;
    const currentHtml = assemble(parts, prefix, blocks);
    let html;

    if (type === 'stage' || type === 'substage') {
      const num = val('#ed-f-num').trim();
      const title = val('#ed-f-title').trim();
      if (!num || !title) { alert('Badge and title are required.'); return false; }
      const id = 'stage-' + slugify(num);
      if (currentHtml.includes('id="' + id + '"')) { alert('A section with id "' + id + '" already exists.'); return false; }
      html = type === 'stage'
        ? templates.stage({ num, title, id, toc: val('#ed-f-toc').trim() || title })
        : templates.substage({ num, title, id });
    } else if (type === 'photo') {
      const fileEl = $('#ed-f-file');
      const file = fileEl.files && fileEl.files[0];
      if (!file) { alert('Pick an image or GIF first.'); return false; }
      const caption = val('#ed-f-caption').trim() || file.name;
      const ext = (file.name.match(/\.(\w+)$/) || [, 'png'])[1].toLowerCase();
      const name = pad2(imageCounter++) + '-' + slugify(caption) + '.' + ext;
      pendingImages.push({ name, file, url: URL.createObjectURL(file) });
      html = templates.photo({ filename: name, caption, alt: val('#ed-f-alt').trim() || caption });
    } else if (type === 'prose') {
      if (!val('#ed-f-text').trim()) { alert('Text is required.'); return false; }
      html = templates.prose({ text: val('#ed-f-text') });
    } else if (type === 'collapse') {
      if (!val('#ed-f-summary').trim()) { alert('Title is required.'); return false; }
      html = templates.collapse({ summary: val('#ed-f-summary').trim(), body: val('#ed-f-body') || 'Content…' });
    } else if (type === 'code') {
      html = templates.code({ code: val('#ed-f-code') });
    } else if (type === 'callout') {
      html = templates.callout({ kind: val('#ed-f-kind'), label: val('#ed-f-label').trim() || 'Note', text: val('#ed-f-text') });
    } else if (type === 'table') {
      if (!val('#ed-f-data').trim()) { alert('Table rows are required.'); return false; }
      html = templates.table({ caption: val('#ed-f-caption').trim(), data: val('#ed-f-data'), wide: $('#ed-f-wide').checked });
    } else {
      const items = val('#ed-f-items').split('\n').map(s => s.trim()).filter(Boolean);
      if (!items.length) { alert('Add at least one item.'); return false; }
      html = templates[type]({ items });
    }

    blocks.splice(insertIndex, 0, { html });
    setDirty(true);
    render();
    document.querySelectorAll('.ed-block')[insertIndex]
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* --------- preview / apply --------- */

  function currentFullHtml(forPreview) {
    let html = assemble(parts, prefix, blocks);
    if (forPreview) {
      html = displayHtml(html);
      html = html.replace('<head>', '<head><base href="' + location.origin + '/">');
    }
    return html;
  }

  function previewSite() {
    const blob = new Blob([currentFullHtml(true)], { type: 'text/html' });
    window.open(URL.createObjectURL(blob) + '#homelab', '_blank');
  }

  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function apply() {
    download(new Blob([currentFullHtml(false)], { type: 'text/html' }), 'index.html');
    pendingImages.forEach((p, i) =>
      setTimeout(() => download(p.file, p.name), 400 * (i + 1)));
    const imgLines = pendingImages.map(p =>
      '<li><code>' + p.name + '</code> → <code>images/homelab/</code></li>').join('');
    openModal('Files downloaded — move them into place',
      '<ol class="ed-apply-list">' +
      '<li><code>index.html</code> → site root (replace the old one)</li>' +
      imgLines +
      '</ol><p>Then reload the site to verify. Your previous version is safe in git.</p>',
      () => true);
    $('#ed-modal-save').textContent = 'Done';
    setDirty(false);
  }

  /* --------- boot --------- */

  document.addEventListener('DOMContentLoaded', () => {
    $('#ed-add-end').addEventListener('click', () => openPalette(blocks.length));
    $('#ed-preview-btn').addEventListener('click', previewSite);
    $('#ed-apply-btn').addEventListener('click', apply);
    $('#ed-discard-btn').addEventListener('click', () => {
      if (!dirty || confirm('Discard all unsaved changes?')) init();
    });
    $('#ed-modal-cancel').addEventListener('click', closeModal);
    $('#ed-modal').addEventListener('click', e => { if (e.target === $('#ed-modal')) closeModal(); });
    init();
  });

})(typeof window !== 'undefined' ? window : globalThis);
