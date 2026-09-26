import { useState } from 'react';
import { FONT_MAP, TEXT_COLORS, HILITE_COLORS } from '../constants';

function ColorPopover({ open, colors, onPick, showNone, custom, onCustom }) {
  if (!open) return null;
  return (
    <div className="popover open" onClick={(e) => e.stopPropagation()}>
      <div className="sw-grid">
        {showNone && <span className="sw sw-none" title="No highlight" onClick={() => onPick('transparent')}>✕</span>}
        {colors.map((c) => (
          <span key={c} className="sw" style={{ background: c }} title={c} onClick={() => onPick(c)} />
        ))}
      </div>
      <div className="sw-custom">
        <input type="color" defaultValue={custom} onInput={(e) => onCustom(e.target.value)} />
        <span>Custom</span>
      </div>
    </div>
  );
}

export default function BlockToolbar({ exec, fontKey, onFontChange, lineHeight, onLineHeightChange, blockStyle, active }) {
  const [colorAOpen, setColorAOpen] = useState(false);
  const [colorHOpen, setColorHOpen] = useState(false);

  const is = (name) => (active?.[name] ? ' active' : '');

  return (
    <div className="blocktoolbar" onClick={() => { setColorAOpen(false); setColorHOpen(false); }}>
      <button onClick={() => exec('undo')} title="Undo (Ctrl+Z)">↺</button>
      <button onClick={() => exec('redo')} title="Redo (Ctrl+Y)">↻</button>
      <div className="tb-sep" />

      <select id="stylesel" title="Paragraph style" value={blockStyle || ''} onChange={(e) => exec('formatBlock', e.target.value)}>
        <option value="">Style</option>
        <option value="P">Normal text</option>
        <option value="H1">Heading 1</option>
        <option value="H2">Heading 2</option>
        <option value="H3">Heading 3</option>
        <option value="BLOCKQUOTE">Quote</option>
      </select>

      <select id="fontsel" title="Font family" value={fontKey} onChange={(e) => onFontChange(e.target.value)}>
        <optgroup label="Serif">
          <option value="sourceserif">Source Serif</option>
          <option value="georgia">Georgia</option>
          <option value="times">Times New Roman</option>
          <option value="lora">Lora</option>
          <option value="merriweather">Merriweather</option>
          <option value="playfair">Playfair Display</option>
          <option value="crimson">Crimson Pro</option>
        </optgroup>
        <optgroup label="Sans-serif">
          <option value="inter">Inter</option>
          <option value="sysSans">System Sans</option>
          <option value="arial">Arial</option>
          <option value="verdana">Verdana</option>
        </optgroup>
        <optgroup label="Monospace">
          <option value="sysMono">System Mono</option>
          <option value="courier">Courier New</option>
          <option value="firacode">Fira Code</option>
          <option value="spacemono">Space Mono</option>
        </optgroup>
      </select>

      <select
        title="Font size"
        defaultValue="16"
        onChange={(e) => exec('fontSizePx', e.target.value)}
      >
        {[12, 14, 16, 18, 20, 24, 28, 32].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select title="Line spacing" value={lineHeight} onChange={(e) => onLineHeightChange(e.target.value)}>
        <option value="1.4">Spacing 1.0</option>
        <option value="1.6">Spacing 1.15</option>
        <option value="1.8">Spacing 1.5</option>
        <option value="2.2">Spacing 2.0</option>
      </select>

      <div className="tb-sep" />
      <button className={is('bold')} onClick={() => exec('bold')} title="Bold (Ctrl+B)"><b>B</b></button>
      <button className={is('italic')} onClick={() => exec('italic')} title="Italic (Ctrl+I)"><i>I</i></button>
      <button className={is('underline')} onClick={() => exec('underline')} title="Underline (Ctrl+U)"><u>U</u></button>
      <button className={'strike' + is('strikeThrough')} onClick={() => exec('strikeThrough')} title="Strikethrough">S</button>
      <button className={is('superscript')} onClick={() => exec('superscript')} title="Superscript">x²</button>
      <button className={is('subscript')} onClick={() => exec('subscript')} title="Subscript">x₂</button>

      <div className="colorwrap pop-anchor" title="Text color" onClick={(e) => { e.stopPropagation(); setColorHOpen(false); setColorAOpen((o) => !o); }}>
        <span className="swatch">A</span>
        <ColorPopover open={colorAOpen} colors={TEXT_COLORS} onPick={(c) => { exec('foreColor', c); setColorAOpen(false); }} onCustom={(c) => exec('foreColor', c)} custom="#d33333" />
      </div>
      <div className="colorwrap pop-anchor" title="Highlight" onClick={(e) => { e.stopPropagation(); setColorAOpen(false); setColorHOpen((o) => !o); }}>
        <span className="swatch">H</span>
        <ColorPopover open={colorHOpen} colors={HILITE_COLORS} showNone onPick={(c) => { exec('hiliteColor', c); setColorHOpen(false); }} onCustom={(c) => exec('hiliteColor', c)} custom="#fff2a8" />
      </div>

      <div className="tb-sep" />
      <button className={is('justifyLeft')} onClick={() => exec('justifyLeft')} title="Align left">⇤</button>
      <button className={is('justifyCenter')} onClick={() => exec('justifyCenter')} title="Align center">↔</button>
      <button className={is('justifyRight')} onClick={() => exec('justifyRight')} title="Align right">⇥</button>
      <button className={is('justifyFull')} onClick={() => exec('justifyFull')} title="Justify">☰</button>

      <div className="tb-sep" />
      <button className={is('insertUnorderedList')} onClick={() => exec('insertUnorderedList')} title="Bullet list">•≡</button>
      <button className={is('insertOrderedList')} onClick={() => exec('insertOrderedList')} title="Numbered list">1≡</button>
      <button onClick={() => exec('outdent')} title="Decrease indent">⟵|</button>
      <button onClick={() => exec('indent')} title="Increase indent">|⟶</button>

      <div className="tb-sep" />
      <button onClick={() => { const url = prompt('Link URL:', 'https://'); if (url) exec('createLink', url); }} title="Insert link (Ctrl+K)">🔗</button>
      <button onClick={() => exec('insertImagePrompt')} title="Insert image">🖼</button>
      <button onClick={() => exec('insertTablePrompt')} title="Insert table">▦</button>
      <button onClick={() => exec('insertHorizontalRule')} title="Horizontal line">―</button>
      <button onClick={() => exec('insertPageBreak')} title="Page break">⤓|</button>

      <div className="tb-sep" />
      <button onClick={() => exec('removeFormat')} title="Clear formatting">Tx</button>
    </div>
  );
}
