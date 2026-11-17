// Descarga las fuentes de Google Fonts (subset latin) a src/app/fonts
// para servirlas con next/font/local sin depender de la red en build.
// Inter se sirve como fuente variable (un solo archivo, pesos 300-800);
// Rajdhani es estática, un archivo por peso.
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const families = [
  { name: 'Inter', slug: 'inter', query: 'family=Inter:wght@300;400;500;600;700;800' },
  { name: 'Rajdhani', slug: 'rajdhani', query: 'family=Rajdhani:wght@300;400;500;600;700' },
];

const outDir = join(process.cwd(), 'src', 'app', 'fonts');

for (const family of families) {
  const cssUrl = `https://fonts.googleapis.com/css2?${family.query}&display=swap`;
  const css = await fetch(cssUrl, { headers: { 'User-Agent': UA } }).then((r) => r.text());
  const blocks = css.match(/\/\* latin \*\/\s*@font-face\s*{[^}]*}/g) ?? [];
  if (blocks.length === 0) {
    throw new Error(`Sin subset latin para ${family.name}`);
  }

  const files = [];
  for (const block of blocks) {
    const weight = block.match(/font-weight:\s*(\d+)/)?.[1];
    const url = block.match(/url\((https:[^)]+)\)/)?.[1];
    if (!weight || !url) continue;
    const data = Buffer.from(
      await fetch(url, { headers: { 'User-Agent': UA } }).then((r) => r.arrayBuffer()),
    );
    files.push({ weight, data });
  }

  // Un archivo idéntico por peso = fuente variable: se guarda una sola vez.
  const hashes = new Set(files.map((f) => createHash('md5').update(f.data).digest('hex')));
  const isVariable = hashes.size === 1 && files.length > 1;
  const weights = files.map((f) => Number(f.weight));
  const range = `${Math.min(...weights)} ${Math.max(...weights)}`;

  if (isVariable) {
    const target = join(outDir, `${family.slug}-latin-var.woff2`);
    await writeFile(target, files[0].data);
    console.log(`${family.name} variable ${range} -> ${target} (${files[0].data.length} bytes)`);
    continue;
  }

  for (const { weight, data } of files) {
    const target = join(outDir, `${family.slug}-latin-${weight}.woff2`);
    await writeFile(target, data);
    console.log(`${family.name} ${weight} -> ${target} (${data.length} bytes)`);
  }
}
