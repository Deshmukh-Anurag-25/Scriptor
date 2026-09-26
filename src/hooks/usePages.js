import { useCallback, useRef, useState } from 'react';
import { LS_KEY } from '../constants';

function loadPagesFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// There is no separate "which page was open" record. On every load we just
// pick whichever non-trashed page has the most recent `updated` timestamp.
// See the README for why that's the behavior, not a bug.
function pickLastActiveId(pages) {
  const candidates = pages.filter((p) => !p.trashed).sort((a, b) => b.updated - a.updated);
  return candidates[0]?.id ?? null;
}

export function usePages() {
  const [pages, setPages] = useState(loadPagesFromStorage);
  const [activeId, setActiveId] = useState(() => pickLastActiveId(loadPagesFromStorage()));
  const [saveStatus, setSaveStatus] = useState('Saved');
  const saveTimer = useRef(null);

  const persist = useCallback((next) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      setSaveStatus('Save failed');
    }
  }, []);

  const activePage = pages.find((p) => p.id === activeId) || null;

  const createPage = useCallback(
    ({ title = '', content = '', tags = [] } = {}) => {
      const p = {
        id: 'p' + Date.now() + Math.random().toString(36).slice(2, 6),
        title,
        content,
        notes: '',
        tags,
        pinned: false,
        trashed: false,
        updated: Date.now(),
      };
      setPages((prev) => {
        const next = [p, ...prev];
        persist(next);
        return next;
      });
      setActiveId(p.id);
      return p.id;
    },
    [persist]
  );

  // Blank page - kept as a plain function for the default "New page" click / shortcut.
  const newPage = useCallback(() => createPage(), [createPage]);

  // Create from a template object ({ title, content }) - see constants.js TEMPLATES.
  const newPageFromTemplate = useCallback((tpl) => createPage({ title: tpl.title, content: tpl.content }), [createPage]);

  // Create from an imported file's parsed { title, content }.
  const newPageFromImport = useCallback(({ title, content }) => createPage({ title, content }), [createPage]);

  // Immediate (non-debounced) patch for metadata fields like tags/pinned that
  // aren't tied to the contentEditable autosave cadence.
  const updatePageMeta = useCallback(
    (id, patch) => {
      setPages((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...patch, updated: Date.now() } : p));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // Debounced save, mirrors the original 400ms setTimeout in scheduleSave().
  const scheduleSave = useCallback(
    (patch) => {
      setSaveStatus('Saving…');
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setPages((prev) => {
          const next = prev.map((p) => (p.id === activeId ? { ...p, ...patch, updated: Date.now() } : p));
          persist(next);
          return next;
        });
        setSaveStatus('Saved');
      }, 400);
    },
    [activeId, persist]
  );

  const togglePin = useCallback(
    (id) => {
      setPages((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const trashPage = useCallback(
    (id) => {
      setPages((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, trashed: true } : p));
        persist(next);
        return next;
      });
      setActiveId((curr) => (curr === id ? null : curr));
    },
    [persist]
  );

  const restorePage = useCallback(
    (id) => {
      setPages((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, trashed: false } : p));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return {
    pages,
    activeId,
    setActiveId,
    activePage,
    saveStatus,
    newPage,
    newPageFromTemplate,
    newPageFromImport,
    updatePageMeta,
    scheduleSave,
    togglePin,
    trashPage,
    restorePage,
  };
}
