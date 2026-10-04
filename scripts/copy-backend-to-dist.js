import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const laravelCoreDir = path.resolve(rootDir, 'laravel-core');
const laravelPublicDir = path.resolve(laravelCoreDir, 'public');

if (!fs.existsSync(distDir)) {
    console.error('dist directory does not exist.');
    process.exit(1);
}

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        const entries = fs.readdirSync(src);
        for (const entry of entries) {
            if (entry.endsWith('.sqlite') || entry === 'node_modules' || entry === '.git') continue;
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

console.log('📦 Preparing automated Hostinger build in dist/ and laravel-core/public/ ...');

// 1. Sync compiled assets to laravel-core/public/assets
if (fs.existsSync(path.join(distDir, 'assets'))) {
    copyRecursive(path.join(distDir, 'assets'), path.join(laravelPublicDir, 'assets'));
}

// 2. Sync brochures and public assets to dist and laravel-core
if (fs.existsSync(path.join(rootDir, 'public', 'brochures'))) {
    copyRecursive(path.join(rootDir, 'public', 'brochures'), path.join(distDir, 'brochures'));
    copyRecursive(path.join(rootDir, 'public', 'brochures'), path.join(laravelPublicDir, 'brochures'));
}

// 3. Update laravel-core/resources/views/app.blade.php with new asset hashes from dist/index.html
const indexHtmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

    // Extract JS and CSS bundle tags
    const scriptMatch = htmlContent.match(/<script type="module" crossorigin src="(\/assets\/[^"]+)"><\/script>/);
    const cssMatch = htmlContent.match(/<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+)">/);
    const preloads = [...htmlContent.matchAll(/<link rel="modulepreload" crossorigin href="(\/assets\/[^"]+)">/g)];

    const bladePath = path.join(laravelCoreDir, 'resources', 'views', 'app.blade.php');
    if (fs.existsSync(bladePath) && scriptMatch && cssMatch) {
        let bladeContent = fs.readFileSync(bladePath, 'utf8');
        const jsFile = scriptMatch[1].replace(/^\//, '');
        const cssFile = cssMatch[1].replace(/^\//, '');

        let preloadTags = preloads.map(p => `    <link rel="modulepreload" crossorigin href="{{ asset('${p[1].replace(/^\//, '')}') }}">`).join('\n');

        bladeContent = bladeContent.replace(
            /<!-- Bundled React Application Assets -->[\s\S]*<\/head>/,
            `<!-- Bundled React Application Assets -->\n    <script type="module" crossorigin src="{{ asset('${jsFile}') }}"></script>\n${preloadTags}\n    <link rel="stylesheet" crossorigin href="{{ asset('${cssFile}') }}">\n</head>`
        );

        fs.writeFileSync(bladePath, bladeContent, 'utf8');
        console.log(`✅ Updated app.blade.php with new assets: ${jsFile} and ${cssFile}`);
    }

    // 4. Remove index.html from dist/ so it NEVER conflicts with index.php on Hostinger
    fs.unlinkSync(indexHtmlPath);
    console.log('✅ Removed index.html from dist/ to prevent routing conflicts.');
}

// 5. Generate index.php in dist/ (auto-detects ../laravel-core on Hostinger or local dev)
const hostingerIndexPhp = `<?php

use Illuminate\\Foundation\\Application;
use Illuminate\\Http\\Request;

define('LARAVEL_START', microtime(true));

// Auto-detect laravel-core directory whether deployed in public_html (live Hostinger) or local dev
if (file_exists(__DIR__ . '/../laravel-core/vendor/autoload.php')) {
    $corePath = __DIR__ . '/../laravel-core';
} elseif (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    $corePath = __DIR__ . '/..';
} elseif (file_exists(__DIR__ . '/laravel-core/vendor/autoload.php')) {
    $corePath = __DIR__ . '/laravel-core';
} else {
    $corePath = __DIR__ . '/..';
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $corePath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $corePath . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $corePath . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
`;

fs.writeFileSync(path.join(distDir, 'index.php'), hostingerIndexPhp, 'utf8');
console.log('✅ Generated Hostinger index.php in dist/');

// 6. Generate .htaccess in dist/ (and laravel-core/public/)
const htaccessContent = `<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header (Crucial for Bearer tokens and JWT on Hostinger)
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

<IfModule mod_setenvif.c>
    SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
</IfModule>
`;

fs.writeFileSync(path.join(distDir, '.htaccess'), htaccessContent, 'utf8');
fs.writeFileSync(path.join(laravelPublicDir, '.htaccess'), htaccessContent, 'utf8');
console.log('✅ Generated .htaccess in dist/ and laravel-core/public/');

// 7. Sync all uploaded project images into dist/uploads/projects and laravel-core/public/uploads/projects
const distUploads = path.join(distDir, 'uploads', 'projects');
const laravelUploads = path.join(laravelPublicDir, 'uploads', 'projects');
const rootUploads = path.join(rootDir, 'uploads', 'projects');

if (!fs.existsSync(distUploads)) fs.mkdirSync(distUploads, { recursive: true });
if (!fs.existsSync(laravelUploads)) fs.mkdirSync(laravelUploads, { recursive: true });

// Copy any uploads from laravel-core to dist
if (fs.existsSync(laravelUploads)) {
    copyRecursive(laravelUploads, distUploads);
}
// Copy any uploads from root uploads to dist and laravel-core
if (fs.existsSync(rootUploads)) {
    copyRecursive(rootUploads, distUploads);
    copyRecursive(rootUploads, laravelUploads);
}
console.log('✅ Automatically included uploads/projects into dist/uploads/ for public_html.');

console.log('🎉 Build complete! Contents of dist/ are 100% ready for Hostinger public_html.');
