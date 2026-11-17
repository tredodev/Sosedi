// Сборка в один файл без зависимостей: node build.mjs  ->  dist/index.html
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
const read = p => readFileSync(new URL(p, import.meta.url), 'utf8');
const list = dir => readdirSync(new URL(dir, import.meta.url)).filter(f => !f.startsWith('.')).sort();
const css = list('./src/styles/').map(f => read('./src/styles/' + f)).join('');
const js = list('./src/js/').map(f => read('./src/js/' + f)).join('\n');
const html = read('./src/template.html').replace('{{CSS}}', () => css).replace('{{JS}}', () => js);
mkdirSync(new URL('./dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('./dist/index.html', import.meta.url), html);
console.log('dist/index.html', (html.length / 1024).toFixed(0) + ' KB');
