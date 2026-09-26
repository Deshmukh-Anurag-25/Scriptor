const BLOCK_TAGS = ['P', 'DIV', 'H1', 'H2', 'H3', 'LI', 'BLOCKQUOTE'];

// Walks up from the current selection to the nearest block-level ancestor
// inside `root` (the contentEditable element). Falls back to `root` itself
// when the caret sits in loose text with no wrapping block yet - which is
// exactly what browsers do for the very first line typed into a fresh
// contentEditable, before the first Enter key creates a <p>/<div>. Without
// this fallback, markdown shortcuts silently do nothing on a page's first
// line.
export function getCurrentBlock(root) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  let node = sel.anchorNode;
  if (!node || !root.contains(node)) return null;
  let el = node.nodeType === 3 ? node.parentElement : node;
  while (el && el !== root && !BLOCK_TAGS.includes(el.tagName)) el = el.parentElement;
  if (el && el !== root) return el;
  // Only safe to treat root as "the block" when it has no element children
  // of its own yet (i.e. it's just loose text) - otherwise we'd risk
  // rewriting content across multiple existing blocks at once.
  return root.children.length === 0 ? root : null;
}

export function placeCursorAtEnd(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

// "# ", "## ", "- ", "1. ", "> " at the very start of an (otherwise empty)
// block trigger the matching block format, the way most markdown editors do.
const LINE_PREFIXES = [
  [/^#\s$/, (exec) => exec('formatBlock', 'H1')],
  [/^##\s$/, (exec) => exec('formatBlock', 'H2')],
  [/^###\s$/, (exec) => exec('formatBlock', 'H3')],
  [/^>\s$/, (exec) => exec('formatBlock', 'BLOCKQUOTE')],
  [/^[-*]\s$/, (exec) => exec('insertUnorderedList')],
  [/^1\.\s$/, (exec) => exec('insertOrderedList')],
];

export function checkLinePrefix(block, exec) {
  if (!block) return false;
  const text = block.textContent;
  for (const [re, run] of LINE_PREFIXES) {
    if (re.test(text)) {
      block.textContent = '';
      run(exec);
      return true;
    }
  }
  return false;
}

// Converts **bold**, *italic*/_italic_ and `code` to real inline markup
// within a single plain-text block. Skipped for blocks that already contain
// child elements, to keep this safe and simple. Note: cursor jumps to the
// end of the block after a conversion (a known trade-off of this lightweight
// approach vs. a full editor engine).
export function applyInlineMarkdown(block) {
  if (!block || block.children.length > 0) return false;
  const text = block.textContent;
  let html = text
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<i>$2</i>')
    .replace(/(^|[^_])_([^_]+)_(?!_)/g, '$1<i>$2</i>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  if (html === text) return false;
  block.innerHTML = html;
  // If the converted run (e.g. <b>hello</b>) is the very last thing in the
  // block, the caret ends up sitting right at its boundary - and browsers
  // will happily keep typing *inside* that bold/italic/code run rather than
  // after it, since there's no plain text there to anchor the caret outside
  // the formatting. Appending an invisible character gives the caret a real,
  // unformatted home so the next thing you type doesn't inherit the format.
  if (block.lastChild && block.lastChild.nodeType === Node.ELEMENT_NODE) {
    block.appendChild(document.createTextNode('\u200B')); // zero-width space
  }
  placeCursorAtEnd(block);
  return true;
}