export const LS_KEY = 'writecode.pages.v1';
export const THEME_KEY = 'writecode.theme';
export const FONT_KEY = 'writecode.font';
export const LH_KEY = 'writecode.lh';

export const FONT_MAP = {
  sourceserif: "'Source Serif 4',Georgia,serif",
  georgia: "Georgia,'Times New Roman',serif",
  times: "'Times New Roman',Times,serif",
  lora: "'Lora',Georgia,serif",
  merriweather: "'Merriweather',Georgia,serif",
  playfair: "'Playfair Display',Georgia,serif",
  crimson: "'Crimson Pro',Georgia,serif",
  inter: "'Inter',-apple-system,sans-serif",
  sysSans: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
  arial: "Arial,Helvetica,sans-serif",
  verdana: "Verdana,Geneva,sans-serif",
  sysMono: "'SF Mono',Consolas,'Courier New',monospace",
  courier: "'Courier New',Courier,monospace",
  firacode: "'Fira Code',Consolas,monospace",
  spacemono: "'Space Mono',Consolas,monospace",
};

export const TEXT_COLORS = ['#1e1e1e', '#b32d2e', '#c0392b', '#2271b1', '#1e8449', '#8e44ad', '#d68910', '#50575e'];
export const HILITE_COLORS = ['#fff2a8', '#ffd6a5', '#caffbf', '#a0c4ff', '#ffc6ff', '#bdb2ff', '#fdffb6'];

export const TEMPLATES = [
  { key: 'blank', label: 'Blank page', title: '', content: '' },
  {
    key: 'meeting',
    label: 'Meeting notes',
    title: 'Meeting notes',
    content: '<h2>Attendees</h2><p></p><h2>Agenda</h2><ul><li></li></ul><h2>Action items</h2><ul><li></li></ul>',
  },
  {
    key: 'blog',
    label: 'Blog draft',
    title: 'Untitled post',
    content: '<p><em>One-line hook…</em></p><h2>Introduction</h2><p></p><h2>Body</h2><p></p><h2>Conclusion</h2><p></p>',
  },
  {
    key: 'todo',
    label: 'To-do list',
    title: 'To-do',
    content: '<ul><li>First task</li><li>Second task</li></ul>',
  },
];

export const THEMES = [
  { key: 'light', label: 'Light', dots: ['#ffffff', '#2271b1', '#1e1e1e'] },
  { key: 'sepia', label: 'Sepia', dots: ['#fbf3e1', '#a2673a', '#3b2f1e'] },
  { key: 'slate', label: 'Slate', dots: ['#f7f9fb', '#3b6ea5', '#1f2933'] },
  { key: 'forest', label: 'Forest', dots: ['#f8faf6', '#4c7a3f', '#26331f'] },
  { key: 'nord', label: 'Nord', dots: ['#3b4252', '#88c0d0', '#eceff4'] },
  { key: 'dark', label: 'Dark', dots: ['#252526', '#569cd6', '#d4d4d4'] },
];
