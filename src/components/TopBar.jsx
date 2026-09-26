import { useState } from 'react';
import { THEMES } from '../constants.js';
import ImportButton from './ImportButton.jsx';
import NewPageMenu from './NewPageMenu.jsx';

export default function TopBar({
  sidebarOpen, onToggleSidebar,
  onFocusMode, onToggleFind,
  theme, onSetTheme,
  breadcrumb, saveStatus,
  onExport, onImport,
  onNewPage, onNewFromTemplate,
  onOpenPalette,
}) {
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <div className="topbar">
      <div className="top-left">
        <div className="logo">W</div>
        <button className={'iconbtn' + (sidebarOpen ? ' active' : '')} title="Toggle sidebar" onClick={onToggleSidebar}>☰</button>
        <button className="iconbtn" title="Focus mode" onClick={onFocusMode}>◎</button>
        <button className="iconbtn" title="Find & replace (Ctrl+F)" onClick={onToggleFind}>🔍</button>
        <button className="iconbtn" title="Command palette (Ctrl+/)" onClick={onOpenPalette}>⌘</button>
        <div className="divider" />
        <div className="pop-anchor">
          <button className="iconbtn" title="Theme" onClick={() => setThemeOpen((o) => !o)}>🎨</button>
          <div className={'popover theme-pop' + (themeOpen ? ' open' : '')}>
            {THEMES.map((t) => (
              <div
                key={t.key}
                className={'theme-item' + (theme === t.key ? ' active' : '')}
                onClick={() => { onSetTheme(t.key); setThemeOpen(false); }}
              >
                <span className="theme-dots">
                  {t.dots.map((c, i) => <span key={i} style={{ background: c }} />)}
                </span>
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="top-center">{breadcrumb}</div>
      <div className="top-right">
        <span className="status-chip">{saveStatus}</span>
        <ImportButton onImport={onImport} />
        <select className="btn btn-outline" title="Export" defaultValue="" onChange={(e) => { onExport(e.target.value); e.target.value = ''; }}>
          <option value="" disabled>Export</option>
          <option value="txt">Plain text (.txt)</option>
          <option value="md">Markdown (.md)</option>
          <option value="html">Web page (.html)</option>
          <option value="doc">Word document (.doc)</option>
          <option value="pdf">PDF (.pdf)</option>
        </select>
        <NewPageMenu onNewBlank={onNewPage} onNewFromTemplate={onNewFromTemplate} />
      </div>
    </div>
  );
}
