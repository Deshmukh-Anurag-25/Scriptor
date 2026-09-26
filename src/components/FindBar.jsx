import { useState } from 'react';

export default function FindBar({ open, onClose, onFindNext, onReplaceAll }) {
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');

  return (
    <div className={'findbar' + (open ? ' open' : '')}>
      <input placeholder="Find" value={find} onChange={(e) => setFind(e.target.value)} />
      <input placeholder="Replace with" value={replace} onChange={(e) => setReplace(e.target.value)} />
      <button onClick={() => onFindNext(find)}>Find next</button>
      <button onClick={() => onReplaceAll(find, replace)}>Replace all</button>
      <button className="fb-close" title="Close" onClick={onClose}>✕</button>
    </div>
  );
}
