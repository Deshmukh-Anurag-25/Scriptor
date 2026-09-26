import { useState } from 'react';
import { TEMPLATES } from '../constants.js';

export default function NewPageMenu({ onNewBlank, onNewFromTemplate }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="pop-anchor new-page-menu">
      <button className="btn btn-primary" onClick={onNewBlank}>New page</button>
      <button className="btn btn-primary new-page-caret" title="Choose a template" onClick={() => setOpen((o) => !o)}>▾</button>
      <div className={'popover' + (open ? ' open' : '')} style={{ right: 0, left: 'auto', width: 170 }}>
        {TEMPLATES.map((t) => (
          <div key={t.key} className="theme-item" onClick={() => { onNewFromTemplate(t); setOpen(false); }}>
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
}
