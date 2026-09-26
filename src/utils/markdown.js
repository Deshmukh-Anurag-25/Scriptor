import { marked } from 'marked';
import TurndownService from 'turndown';

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

export function markdownToHtml(md) {
  return marked.parse(md, { breaks: true });
}

export function htmlToMarkdown(html) {
  return turndown.turndown(html || '');
}
