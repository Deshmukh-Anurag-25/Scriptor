const ITEMS = [
  { key: 'h1', label: 'Heading 1', run: (exec) => exec('formatBlock', 'H1') },
  { key: 'h2', label: 'Heading 2', run: (exec) => exec('formatBlock', 'H2') },
  { key: 'quote', label: 'Quote', run: (exec) => exec('formatBlock', 'BLOCKQUOTE') },
  { key: 'ul', label: 'Bullet list', run: (exec) => exec('insertUnorderedList') },
  { key: 'ol', label: 'Numbered list', run: (exec) => exec('insertOrderedList') },
  { key: 'table', label: 'Table', run: (exec) => exec('insertTablePrompt') },
  { key: 'image', label: 'Image', run: (exec) => exec('insertImagePrompt') },
  { key: 'hr', label: 'Divider', run: (exec) => exec('insertHorizontalRule') },
];

export default function SlashMenu({ position, onPick }) {
  if (!position) return null;
  return (
    <div
      className="popover open slash-menu"
      style={{ position: 'fixed', top: position.top + 4, left: position.left, width: 170 }}
    >
      {ITEMS.map((item) => (
        <div key={item.key} className="theme-item" onMouseDown={(e) => { e.preventDefault(); onPick(item); }}>
          {item.label}
        </div>
      ))}
    </div>
  );
}

export { ITEMS as SLASH_ITEMS };
