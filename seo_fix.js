const fs = require('fs');
const path = require('path');

const directory = __dirname;
const files = fs.readdirSync(directory).filter(file => file.endsWith('.html'));

const vercelUrl = 'https://golden-advertisement-and-publicity.vercel.app';

files.forEach(file => {
    const filePath = path.join(directory, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Pretty URLs
    const linkRegex = /href="(\.\/)?([^"]+)\.html"/g;
    if (linkRegex.test(content)) {
        content = content.replace(linkRegex, (match, dotSlash, name) => {
            if (name === 'index') return 'href="/"';
            return `href="/${name}"`;
        });
        changed = true;
    }

    // 2. Canonical URL update
    if (content.includes('rel="canonical"')) {
        content = content.replace(/rel="canonical" href="https?:\/\/[^"]+"/g, `rel="canonical" href="${vercelUrl}/${file === 'index.html' ? '' : file.replace('.html', '')}"`);
        changed = true;
    }

    // 3. OG URL update
    if (content.includes('property="og:url"')) {
        content = content.replace(/property="og:url" content="https?:\/\/[^"]+"/g, `property="og:url" content="${vercelUrl}/${file === 'index.html' ? '' : file.replace('.html', '')}"`);
        changed = true;
    }

    // 4. Twitter URL update
    if (content.includes('name="twitter:url"')) {
        content = content.replace(/name="twitter:url" content="https?:\/\/[^"]+"/g, `name="twitter:url" content="${vercelUrl}/${file === 'index.html' ? '' : file.replace('.html', '')}"`);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated Meta & Links: ${file}`);
    }
});
