import { useRef } from 'react';
import { markdownToHtml } from '../utils/markdown.js';
import { docxToHtml } from '../utils/docx.js';

function extOf(name) {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : '';
}

function titleFromFilename(name) {
  return name.replace(/\.[^.]+$/, '');
}

export default function ImportButton({ onImport }) {
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    const ext = extOf(file.name);
    const title = titleFromFilename(file.name);
    try {
      if (ext === 'md' || ext === 'markdown') {
        const text = await file.text();
        onImport({ title, content: markdownToHtml(text) });
      } else if (ext === 'html' || ext === 'htm') {
        const text = await file.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        onImport({ title: doc.title || title, content: doc.body.innerHTML });
      } else if (ext === 'txt') {
        const text = await file.text();
        const html = text.split(/\n{2,}/).map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('');
        onImport({ title, content: html });
      } else if (ext === 'docx') {
        const buf = await file.arrayBuffer();
        const html = await docxToHtml(buf);
        onImport({ title, content: html });
      } else {
        alert('Unsupported file type: .' + ext + '\nSupported: .md, .html, .txt, .docx');
      }
    } catch (err) {
      alert('Could not import that file: ' + err.message);
    }
  };

  return (
    <>
      <button className="btn btn-outline" title="Import a file as a new page" onClick={() => inputRef.current?.click()}>
        Import
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".md,.markdown,.html,.htm,.txt,.docx"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </>
  );
}
