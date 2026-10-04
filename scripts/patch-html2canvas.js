import fs from 'fs';
import path from 'path';

const filesToPatch = [
    'node_modules/html2canvas/dist/html2canvas.esm.js',
    'node_modules/html2canvas/dist/lib/css/types/color.js',
    'node_modules/html2canvas/dist/html2canvas.js',
    'node_modules/.vite/deps/html2canvas.js'
];

for (const relPath of filesToPatch) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) continue;

    let content = fs.readFileSync(fullPath, 'utf8');
    const targetError = 'throw new Error("Attempting to parse an unsupported color function \\"" + value.name + "\\"");';
    const targetErrorAlt = "throw new Error('Attempting to parse an unsupported color function \"' + value.name + '\"');";

    if (content.includes(targetError)) {
        content = content.replace(targetError, 'return 0;');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Patched ${relPath}`);
    } else if (content.includes(targetErrorAlt)) {
        content = content.replace(targetErrorAlt, 'return 0;');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Patched ${relPath}`);
    }
}
