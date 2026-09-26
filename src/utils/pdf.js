import { jsPDF } from 'jspdf';

// Renders the page title + content into an off-screen container and prints
// it into a proper PDF file (rather than opening the browser print dialog).
export function exportPdf({ titleHtml, contentHtml, fontFamily, filename }) {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    container.style.width = '650px';
    container.style.fontFamily = fontFamily || 'Georgia, serif';
    container.style.color = '#1e1e1e';
    container.style.lineHeight = '1.6';
    container.innerHTML = `<h1 style="font-size:26px;margin:0 0 16px;">${titleHtml || 'Untitled'}</h1>${contentHtml || ''}`;
    container.querySelectorAll('img').forEach((img) => { img.style.maxWidth = '100%'; });
    document.body.appendChild(container);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.html(container, {
      margin: [40, 40, 40, 40],
      autoPaging: 'text',
      html2canvas: { scale: 0.72, useCORS: true },
      callback: (d) => {
        document.body.removeChild(container);
        try {
          d.save(filename);
          resolve();
        } catch (err) {
          reject(err);
        }
      },
    });
  });
}
