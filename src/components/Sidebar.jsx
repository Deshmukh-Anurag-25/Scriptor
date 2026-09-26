import { useMemo, useState } from 'react';
import { stripHtml } from '../utils.js';
import { buildIndex, searchPages } from '../utils/searchIndex.js';
import TagEditor from './TagEditor.jsx';

export default function Sidebar({
  pages,
  activeId,
  onSelect,
  onTogglePin,
  onTrash,
  onRestore,
  metrics,
  outline,
  notesRef,
  onNotesInput,
  activeTags,
  onUpdateTags,
}) {
  const [tab, setTab] = useState('page');
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState([]);

  const index = useMemo(() => buildIndex(pages), [pages]);

  const allTags = useMemo(() => {
    const s = new Set();
    pages.forEach((p) => !p.trashed && (p.tags || []).forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [pages]);

  const visible = useMemo(() => {
    let list = searchPages(pages, index, query);
    if (tagFilter.length) list = list.filter((p) => (p.tags || []).some((t) => tagFilter.includes(t)));
    list = [...list].sort((a, b) => b.pinned - a.pinned || (query.trim() ? 0 : b.updated - a.updated));
    return list;
  }, [pages, index, query, tagFilter]);

  const trashed = pages.filter((p) => p.trashed);

  const toggleTagFilter = (t) => setTagFilter((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <div className="sidebar" id="sidebar">
      <div className="sidebar-tabs">
        <button className={'sidebar-tab' + (tab === 'page' ? ' active' : '')} onClick={() => setTab('page')}>
          Page
        </button>
        <button className={'sidebar-tab' + (tab === 'all' ? ' active' : '')} onClick={() => setTab('all')}>
          All pages
        </button>
      </div>
      <div className="sidebar-scroll">
        <div className={'tabpanel' + (tab === 'page' ? ' active' : '')}>
          <div className="panel">
            <div className="panel-header">Details</div>
            <div className="panel-body">
              <div className="row"><span className="row-label">Words</span><span className="row-value">{metrics.words}</span></div>
              <div className="row"><span className="row-label">Characters</span><span className="row-value">{metrics.chars}</span></div>
              <div className="row"><span className="row-label">Reading time</span><span className="row-value">{metrics.readMin} min</span></div>
              <div className="row"><span className="row-label">Last edited</span><span className="row-value">{metrics.edited}</span></div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header">Tags</div>
            <div className="panel-body">
              <TagEditor tags={activeTags || []} onChange={onUpdateTags} />
            </div>
          </div>
          <div className="panel">
            <div className="panel-header">Outline</div>
            <div className="panel-body">
              {outline.length === 0 ? (
                <div style={{ color: 'var(--text-3)' }}>No headings yet</div>
              ) : (
                outline.map((h, i) => (
                  <div
                    key={i}
                    className="outline-item"
                    style={{ paddingLeft: h.level === 1 ? 0 : h.level === 2 ? 12 : 24 }}
                    onClick={h.scrollTo}
                  >
                    {h.text || '(untitled heading)'}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="panel">
            <div className="panel-header">Notes &amp; outline</div>
            <div className="panel-body">
              <textarea id="notesbox" ref={notesRef} onInput={onNotesInput} placeholder="Jot down an outline or notes for this page…" />
            </div>
          </div>
        </div>
        <div className={'tabpanel' + (tab === 'all' ? ' active' : '')}>
          <input id="search" placeholder="Search pages…" value={query} onChange={(e) => setQuery(e.target.value)} />
          {allTags.length > 0 && (
            <div className="tag-filter-row">
              {allTags.map((t) => (
                <span
                  key={t}
                  className={'tag-chip tag-filter-chip' + (tagFilter.includes(t) ? ' active' : '')}
                  onClick={() => toggleTagFilter(t)}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div id="pagelist">
            {visible.map((p) => (
              <div key={p.id} className={'page-row' + (p.id === activeId ? ' active' : '')}>
                <span className="pname" onClick={() => onSelect(p.id)}>
                  {stripHtml(p.title) || 'Untitled'}
                  {(p.tags || []).length > 0 && (
                    <span className="pname-tags"> {(p.tags || []).map((t) => `#${t}`).join(' ')}</span>
                  )}
                </span>
                <span className="pact">
                  <span
                    className={'pinbtn' + (p.pinned ? ' pin-on' : '')}
                    title="Pin"
                    onClick={(e) => { e.stopPropagation(); onTogglePin(p.id); }}
                  >📌</span>
                  <span className="delbtn" title="Trash" onClick={(e) => { e.stopPropagation(); onTrash(p.id); }}>🗑</span>
                </span>
              </div>
            ))}
            {visible.length === 0 && <div style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 13 }}>No pages match.</div>}
            {trashed.length > 0 && (
              <>
                <div className="trash-heading">Trash ({trashed.length})</div>
                {trashed.map((p) => (
                  <div key={p.id} className="page-row" style={{ opacity: 0.6 }}>
                    <span className="pname">{stripHtml(p.title) || 'Untitled'}</span>
                    <span className="pact">
                      <span className="restbtn" title="Restore" onClick={(e) => { e.stopPropagation(); onRestore(p.id); }}>↺</span>
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
