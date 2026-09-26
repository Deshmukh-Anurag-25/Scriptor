import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TopBar from './components/TopBar.jsx';
import BlockToolbar from './components/BlockToolbar.jsx';
import FindBar from './components/FindBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Editor from './components/Editor.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import { usePages } from './hooks/usePages.js';
import { FONT_MAP, THEME_KEY, FONT_KEY, LH_KEY, THEMES, TEMPLATES } from './constants.js';
import { stripHtml, escapeHtml, downloadBlob } from './utils.js';
import { resizeImageFile } from './utils/imageResize.js';
import { htmlToMarkdown } from './utils/markdown.js';
import { exportPdf } from './utils/pdf.js';

const TOGGLE_COMMANDS = [
  'bold', 'italic', 'underline', 'strikeThrough', 'superscript', 'subscript',
  'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
  'insertUnorderedList', 'insertOrderedList',
];

export default function App() {
  const {
    pages, activeId, setActiveId, activePage, saveStatus,
    newPage, newPageFromTemplate, newPageFromImport, updatePageMeta,
    scheduleSave, togglePin, trashPage, restorePage,
  } = usePages();

  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const notesRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [theme, setThemeState] = useState('light');
  const [fontKey, setFontKey] = useState('sourceserif');
  const [lineHeight, setLineHeight] = useState('1.8');
  const [active, setActive] = useState({});
  const [blockStyle, setBlockStyle] = useState('');
  const [, forceTick] = useState(0); // re-render to refresh word count / breadcrumb after a save

  // Load display prefs once on mount (theme/font/line-height are global, not per-page).
  useEffect(() => {
    try {
      const t = localStorage.getItem(THEME_KEY);
      if (t) setThemeState(t);
      const f = localStorage.getItem(FONT_KEY);
      if (f && FONT_MAP[f]) setFontKey(f);
      const lh = localStorage.getItem(LH_KEY);
      if (lh) setLineHeight(lh);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-content', FONT_MAP[fontKey] || FONT_MAP.sourceserif);
    try { localStorage.setItem(FONT_KEY, fontKey); } catch {}
  }, [fontKey]);

  useEffect(() => {
    document.documentElement.style.setProperty('--content-lh', lineHeight);
    try { localStorage.setItem(LH_KEY, lineHeight); } catch {}
  }, [lineHeight]);

  useEffect(() => {
    document.body.classList.toggle('focus', focusMode);
  }, [focusMode]);

  const focusContent = () => contentRef.current?.focus();

  const triggerSave = useCallback(() => {
    scheduleSave({
      title: titleRef.current?.innerHTML ?? '',
      content: contentRef.current?.innerHTML ?? '',
      notes: notesRef.current?.value ?? '',
    });
    // let word count / outline / breadcrumb catch up once the debounce commits
    setTimeout(() => forceTick((n) => n + 1), 420);
  }, [scheduleSave]);

  const refreshToolbarState = useCallback(() => {
    if (document.activeElement !== contentRef.current) return;
    const next = {};
    TOGGLE_COMMANDS.forEach((c) => {
      try { next[c] = document.queryCommandState(c); } catch { next[c] = false; }
    });
    setActive(next);
    try {
      const blk = (document.queryCommandValue('formatBlock') || '').toUpperCase();
      setBlockStyle(['H1', 'H2', 'H3', 'BLOCKQUOTE'].includes(blk) ? blk : '');
    } catch {}
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', refreshToolbarState);
    return () => document.removeEventListener('selectionchange', refreshToolbarState);
  }, [refreshToolbarState]);

  const insertResizedImage = useCallback((file) => {
    resizeImageFile(file).then((dataUrl) => {
      focusContent();
      document.execCommand('insertImage', false, dataUrl);
      triggerSave();
    });
  }, [triggerSave]);

  const exec = useCallback(
    (name, val) => {
      focusContent();
      if (name === 'fontSizePx') {
        document.execCommand('fontSize', false, '7');
        contentRef.current?.querySelectorAll('font[size="7"]').forEach((f) => {
          f.removeAttribute('size');
          f.style.fontSize = val + 'px';
        });
      } else if (name === 'insertImagePrompt') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = () => { const file = input.files[0]; if (file) insertResizedImage(file); };
        input.click();
        return;
      } else if (name === 'insertTablePrompt') {
        const rows = parseInt(prompt('Rows:', '3'), 10);
        const cols = parseInt(prompt('Columns:', '3'), 10);
        if (!rows || !cols) return;
        let html = '<table>';
        for (let r = 0; r < rows; r++) { html += '<tr>'; for (let c = 0; c < cols; c++) html += '<td>&nbsp;</td>'; html += '</tr>'; }
        html += '</table><p><br></p>';
        document.execCommand('insertHTML', false, html);
      } else if (name === 'insertPageBreak') {
        document.execCommand('insertHTML', false, '<div class="page-break"></div><p><br></p>');
      } else if (name === 'foreColor' || name === 'hiliteColor') {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(name, false, val);
      } else {
        document.execCommand(name, false, val ?? null);
      }
      triggerSave();
      refreshToolbarState();
    },
    [triggerSave, refreshToolbarState, insertResizedImage]
  );

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e) {
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (mod && k === 'b') { e.preventDefault(); exec('bold'); }
      if (mod && k === 'i') { e.preventDefault(); exec('italic'); }
      if (mod && k === 'u') { e.preventDefault(); exec('underline'); }
      if (mod && k === 'y') { e.preventDefault(); exec('redo'); }
      if (mod && k === 'z') { e.preventDefault(); exec('undo'); }
      if (mod && k === 'f') { e.preventDefault(); setFindOpen((o) => !o); }
      if (mod && k === 'k') { e.preventDefault(); const url = prompt('Link URL:', 'https://'); if (url) exec('createLink', url); }
      if (mod && k === '/') { e.preventDefault(); setPaletteOpen((o) => !o); }
      if (e.key === 'F11') { e.preventDefault(); setFocusMode((f) => !f); }
      if (e.key === 'Escape') { setFindOpen(false); setFocusMode(false); setPaletteOpen(false); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [exec]);

  const metrics = useMemo(() => {
    if (!activePage) return { words: 0, chars: 0, readMin: 0, edited: '—' };
    const text = stripHtml(activePage.content);
    const words = (text.trim().match(/\S+/g) || []).length;
    const edited = activePage.updated
      ? new Date(activePage.updated).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—';
    return { words, chars: text.length, readMin: Math.max(1, Math.round(words / 200)), edited };
  }, [activePage]);

  const outline = useMemo(() => {
    if (!activePage) return [];
    const doc = new DOMParser().parseFromString(activePage.content, 'text/html');
    return Array.from(doc.querySelectorAll('h1,h2,h3')).map((h) => ({
      level: Number(h.tagName[1]),
      text: h.textContent,
      scrollTo: () => {
        const heads = contentRef.current?.querySelectorAll('h1,h2,h3');
        const match = Array.from(heads || []).find((el) => el.textContent === h.textContent);
        match?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    }));
  }, [activePage]);

  const breadcrumb = activePage ? (stripHtml(activePage.title) || 'Untitled') : 'No page open';

  const handleExport = async (kind) => {
    const p = activePage;
    if (!p) return;
    const titleText = stripHtml(p.title) || 'Untitled';
    const fname = (titleText.replace(/[^a-z0-9]+/gi, '-').toLowerCase()) || 'untitled';
    if (kind === 'txt') {
      const bodyText = stripHtml(p.content.replace(/<\/p>|<br>/g, '\n').replace(/<\/(h1|h2|h3|div|li)>/g, '\n').replace(/<li>/g, '• '));
      downloadBlob(titleText + '\n\n' + bodyText, fname + '.txt', 'text/plain');
    } else if (kind === 'md') {
      const md = '# ' + titleText + '\n\n' + htmlToMarkdown(p.content);
      downloadBlob(md, fname + '.md', 'text/markdown');
    } else if (kind === 'html') {
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(titleText)}</title></head><body><h1>${p.title}</h1>${p.content}</body></html>`;
      downloadBlob(html, fname + '.html', 'text/html');
    } else if (kind === 'doc') {
      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${escapeHtml(titleText)}</title></head><body><h1>${p.title}</h1>${p.content}</body></html>`;
      downloadBlob(html, fname + '.doc', 'application/msword');
    } else if (kind === 'pdf') {
      try {
        await exportPdf({
          titleHtml: p.title,
          contentHtml: p.content,
          fontFamily: FONT_MAP[fontKey],
          filename: fname + '.pdf',
        });
      } catch {
        window.print(); // fall back to the browser's print dialog if rendering fails
      }
    }
  };

  const handleFindNext = (q) => { if (q && window.find) window.find(q, false, false, true, false, true, false); };
  const handleReplaceAll = (q, r) => {
    if (!q || !contentRef.current) return;
    const walker = document.createTreeWalker(contentRef.current, NodeFilter.SHOW_TEXT);
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    let n;
    while ((n = walker.nextNode())) {
      if (re.test(n.nodeValue)) { re.lastIndex = 0; n.nodeValue = n.nodeValue.replace(re, r); }
    }
    triggerSave();
  };

  const handleUpdateTags = (tags) => { if (activeId) updatePageMeta(activeId, { tags }); };

  const commands = useMemo(() => {
    const list = [
      { id: 'new-blank', label: 'New page (blank)', shortcut: '', run: newPage },
      ...TEMPLATES.filter((t) => t.key !== 'blank').map((t) => ({
        id: 'new-' + t.key, label: 'New page from template: ' + t.label, run: () => newPageFromTemplate(t),
      })),
      { id: 'toggle-sidebar', label: 'Toggle sidebar', run: () => setSidebarOpen((o) => !o) },
      { id: 'toggle-focus', label: 'Toggle focus mode', shortcut: 'F11', run: () => setFocusMode((f) => !f) },
      { id: 'toggle-find', label: 'Find & replace', shortcut: 'Ctrl+F', run: () => setFindOpen((o) => !o) },
      ...THEMES.map((t) => ({ id: 'theme-' + t.key, label: 'Theme: ' + t.label, run: () => setThemeState(t.key) })),
      { id: 'exec-bold', label: 'Bold', shortcut: 'Ctrl+B', run: () => exec('bold') },
      { id: 'exec-italic', label: 'Italic', shortcut: 'Ctrl+I', run: () => exec('italic') },
      { id: 'exec-underline', label: 'Underline', shortcut: 'Ctrl+U', run: () => exec('underline') },
      { id: 'exec-h1', label: 'Heading 1', run: () => exec('formatBlock', 'H1') },
      { id: 'exec-h2', label: 'Heading 2', run: () => exec('formatBlock', 'H2') },
      { id: 'exec-quote', label: 'Quote', run: () => exec('formatBlock', 'BLOCKQUOTE') },
      { id: 'exec-ul', label: 'Bullet list', run: () => exec('insertUnorderedList') },
      { id: 'exec-ol', label: 'Numbered list', run: () => exec('insertOrderedList') },
      { id: 'exec-table', label: 'Insert table', run: () => exec('insertTablePrompt') },
      { id: 'exec-image', label: 'Insert image', run: () => exec('insertImagePrompt') },
      { id: 'exec-hr', label: 'Insert divider', run: () => exec('insertHorizontalRule') },
      { id: 'exec-clear', label: 'Clear formatting', run: () => exec('removeFormat') },
      { id: 'export-md', label: 'Export as Markdown', run: () => handleExport('md') },
      { id: 'export-html', label: 'Export as HTML', run: () => handleExport('html') },
      { id: 'export-pdf', label: 'Export as PDF', run: () => handleExport('pdf') },
      { id: 'export-doc', label: 'Export as Word (.doc)', run: () => handleExport('doc') },
      { id: 'export-txt', label: 'Export as plain text', run: () => handleExport('txt') },
    ];
    return list;
  }, [exec, newPage, newPageFromTemplate, activePage]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div id="root-app">
      {focusMode && (
        <button className="focus-exit" style={{ display: 'flex' }} onClick={() => setFocusMode(false)}>
          ✕ Exit focus mode
        </button>
      )}
      <div id="root">
        <TopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          onFocusMode={() => setFocusMode(true)}
          onToggleFind={() => setFindOpen((o) => !o)}
          theme={theme}
          onSetTheme={setThemeState}
          breadcrumb={breadcrumb}
          saveStatus={saveStatus}
          onExport={handleExport}
          onImport={newPageFromImport}
          onNewPage={newPage}
          onNewFromTemplate={newPageFromTemplate}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <FindBar open={findOpen} onClose={() => setFindOpen(false)} onFindNext={handleFindNext} onReplaceAll={handleReplaceAll} />
        <BlockToolbar
          exec={exec}
          fontKey={fontKey}
          onFontChange={setFontKey}
          lineHeight={lineHeight}
          onLineHeightChange={setLineHeight}
          blockStyle={blockStyle}
          active={active}
        />
        <div className="body">
          <div className="canvas-outer">
            <Editor
              page={activePage}
              titleRef={titleRef}
              contentRef={contentRef}
              exec={exec}
              onInput={triggerSave}
              onSelectionUpdate={refreshToolbarState}
              metaLine={activePage ? `${metrics.words} words · edited ${metrics.edited}` : ''}
              onNewPage={newPage}
            />
          </div>
          {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
          {sidebarOpen && (
            <Sidebar
              pages={pages}
              activeId={activeId}
              onSelect={setActiveId}
              onTogglePin={togglePin}
              onTrash={trashPage}
              onRestore={restorePage}
              metrics={metrics}
              outline={outline}
              notesRef={notesRef}
              onNotesInput={triggerSave}
              activeTags={activePage?.tags}
              onUpdateTags={handleUpdateTags}
            />
          )}
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
    </div>
  );
}
