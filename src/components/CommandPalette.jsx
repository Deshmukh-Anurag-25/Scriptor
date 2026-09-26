import { useEffect, useMemo, useRef, useState } from 'react';

export default function CommandPalette({ open, onClose, commands }) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  if (!open) return null;

  const run = (cmd) => { if (cmd) { cmd.run(); onClose(); } };

  return (
    <div className="cmdk-backdrop" onMouseDown={onClose}>
      <div className="cmdk-panel" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="cmdk-input"
          placeholder="Type a command…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(i + 1, filtered.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)); }
            if (e.key === 'Enter') { e.preventDefault(); run(filtered[index]); }
            if (e.key === 'Escape') { e.preventDefault(); onClose(); }
          }}
        />
        <div className="cmdk-list">
          {filtered.length === 0 && <div className="cmdk-empty">No matching commands</div>}
          {filtered.map((c, i) => (
            <div
              key={c.id}
              className={'cmdk-item' + (i === index ? ' active' : '')}
              onMouseEnter={() => setIndex(i)}
              onMouseDown={(e) => { e.preventDefault(); run(c); }}
            >
              <span>{c.label}</span>
              {c.shortcut && <span className="cmdk-shortcut">{c.shortcut}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
