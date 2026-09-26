import { useEffect, useState } from 'react';
import SlashMenu from './SlashMenu.jsx';
import { getCurrentBlock, checkLinePrefix, applyInlineMarkdown } from '../utils/editorHelpers.js';

export default function Editor({ page, titleRef, contentRef, exec, onInput, onSelectionUpdate, metaLine, onNewPage }) {
  const [slashPos, setSlashPos] = useState(null);

  // Uncontrolled on purpose: contentEditable + React state don't mix well
  // (React would fight the browser for cursor position on every keystroke).
  // We only push page.title/content into the DOM when switching pages.
  useEffect(() => {
    if (!page) return;
    if (titleRef.current) titleRef.current.innerHTML = page.title;
    if (contentRef.current) contentRef.current.innerHTML = page.content;
    setSlashPos(null);
  }, [page?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeSlash = () => setSlashPos(null);

  const checkSlashCommand = () => {
    const root = contentRef.current;
    if (!root) return closeSlash();
    const block = getCurrentBlock(root);
    if (!block || block.textContent !== '/') return closeSlash();
    const sel = window.getSelection();
    if (!sel.rangeCount) return closeSlash();
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    setSlashPos({ top: rect.bottom || block.getBoundingClientRect().bottom, left: rect.left || block.getBoundingClientRect().left });
  };

  const handleContentInput = () => {
    const root = contentRef.current;
    const block = getCurrentBlock(root);
    // Markdown shortcuts first (they clear the block's text on match).
    const didPrefix = checkLinePrefix(block, exec);
    if (!didPrefix) applyInlineMarkdown(block);
    checkSlashCommand();
    onInput();
  };

  const handleSlashPick = (item) => {
    const root = contentRef.current;
    const block = getCurrentBlock(root);
    if (block) block.textContent = '';
    closeSlash();
    item.run(exec);
  };

  if (!page) {
    return (
      <div className="empty-state">
        <div>No page open yet.</div>
        <button className="btn btn-primary" onClick={onNewPage}>Start writing</button>
      </div>
    );
  }

  return (
    <div className="canvas-inner" id="canvas-inner">
      <div
        className="p-title"
        id="title"
        contentEditable
        suppressContentEditableWarning
        ref={titleRef}
        onInput={onInput}
      />
      <div className="p-meta-line" id="metaline">{metaLine}</div>
      <div
        className="p-content"
        id="content"
        contentEditable
        suppressContentEditableWarning
        ref={contentRef}
        onInput={handleContentInput}
        onKeyUp={onSelectionUpdate}
        onMouseUp={onSelectionUpdate}
        onBlur={closeSlash}
      />
      <SlashMenu position={slashPos} onPick={handleSlashPick} />
    </div>
  );
}
