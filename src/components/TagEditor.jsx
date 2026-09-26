import { useState } from 'react';

export default function TagEditor({ tags, onChange }) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const t = draft.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setDraft('');
  };

  const removeTag = (t) => onChange(tags.filter((x) => x !== t));

  return (
    <div className="tag-editor">
      <div className="tag-chips">
        {tags.map((t) => (
          <span key={t} className="tag-chip">
            {t}
            <span className="tag-chip-x" onClick={() => removeTag(t)}>✕</span>
          </span>
        ))}
      </div>
      <input
        className="tag-input"
        placeholder="Add a tag…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); addTag(); }
          if (e.key === 'Backspace' && !draft && tags.length) removeTag(tags[tags.length - 1]);
        }}
      />
    </div>
  );
}
