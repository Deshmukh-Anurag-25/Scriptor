import { stripHtml } from '../utils.js';

function tokenize(str) {
  return (str.toLowerCase().match(/[a-z0-9']+/g)) || [];
}

// token -> Set(pageId)
export function buildIndex(pages) {
  const index = new Map();
  pages.forEach((p) => {
    if (p.trashed) return;
    const text = stripHtml(p.title) + ' ' + stripHtml(p.content) + ' ' + (p.tags || []).join(' ');
    const tokens = new Set(tokenize(text));
    tokens.forEach((t) => {
      if (!index.has(t)) index.set(t, new Set());
      index.get(t).add(p.id);
    });
  });
  return index;
}

// Ranks pages by number of matching (exact or prefix) query tokens found.
// Falls back to "everything" when the query is empty.
export function searchPages(pages, index, query) {
  const nonTrashed = pages.filter((p) => !p.trashed);
  const qTokens = tokenize(query);
  if (!qTokens.length) return nonTrashed;

  const scores = new Map(nonTrashed.map((p) => [p.id, 0]));
  for (const [token, ids] of index.entries()) {
    for (const qt of qTokens) {
      if (token === qt) {
        ids.forEach((id) => scores.has(id) && scores.set(id, scores.get(id) + 2));
      } else if (token.startsWith(qt)) {
        ids.forEach((id) => scores.has(id) && scores.set(id, scores.get(id) + 1));
      }
    }
  }
  return nonTrashed.filter((p) => scores.get(p.id) > 0).sort((a, b) => scores.get(b.id) - scores.get(a.id));
}
