// Packs the demo build into one self-contained HTML file (dist-demo/catatan-keuangan-demo.html).
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const dir = 'dist-demo/assets';
const files = readdirSync(dir);
const css = readFileSync(`${dir}/${files.find((f) => f.endsWith('.css'))}`, 'utf8');
const js = readFileSync(`${dir}/${files.find((f) => f.endsWith('.js'))}`, 'utf8').replace(/<\/script/gi, '<\\/script');

const html = `<title>Catatan Keuangan</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#0f766e">
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`;
writeFileSync('dist-demo/catatan-keuangan-demo.html', html);
console.log('wrote dist-demo/catatan-keuangan-demo.html', (html.length / 1024).toFixed(0), 'KB');
