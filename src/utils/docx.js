import mammoth from 'mammoth'; // Vite resolves this to mammoth's browser build automatically

export async function docxToHtml(arrayBuffer) {
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value; // ignoring result.messages (conversion warnings)
}
