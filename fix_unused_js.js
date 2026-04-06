const fs = require('fs');

// === 1. Fix main.js: Defer Three.js to user interaction ===
let mainJs = fs.readFileSync('main.js', 'utf8');

// Use a regex that handles both LF and CRLF
const oldMainRegex = /\/\/ Defer and Lazy-load all Three\.js background canvases\r?\n\(\(\) => \{\r?\n    const canvases = document\.querySelectorAll\('\.hero-background, \[id\$="-canvas"\]'\);\r?\n    canvases\.forEach\(c => initThreeJS\(c\)\);\r?\n\}\)\(\);/;

const match = mainJs.match(oldMainRegex);
if (match) {
    // Preserve the original line ending style
    const nl = match[0].includes('\r\n') ? '\r\n' : '\n';
    const newMainBlock = [
        '// Defer and Lazy-load all Three.js background canvases (interaction-triggered)',
        '(() => {',
        '    let threeStarted = false;',
        '    const startAll = () => {',
        '        if (threeStarted) return;',
        '        threeStarted = true;',
        '        const canvases = document.querySelectorAll(\'.hero-background, [id$="-canvas"]\');',
        '        canvases.forEach(c => initThreeJS(c));',
        '    };',
        '    window.addEventListener(\'scroll\', startAll, { once: true, passive: true });',
        '    window.addEventListener(\'mousemove\', startAll, { once: true, passive: true });',
        '    window.addEventListener(\'touchstart\', startAll, { once: true, passive: true });',
        '    setTimeout(startAll, 8000);',
        '})();'
    ].join(nl);
    
    mainJs = mainJs.replace(match[0], newMainBlock);
    fs.writeFileSync('main.js', mainJs);
    console.log('OK main.js updated');
} else {
    console.log('FAIL main.js: pattern not found');
    // Debug: show what's around line 824
    const lines = mainJs.split(/\r?\n/);
    for (let i = 822; i < 830 && i < lines.length; i++) {
        console.log(`  L${i+1}: ${JSON.stringify(lines[i])}`);
    }
}

// === 2. Fix main.min.js: Defer Three.js to user interaction ===
let mainMin = fs.readFileSync('main.min.js', 'utf8');

const oldMinBlock = `window.requestIdleCallback?requestIdleCallback(()=>{document.querySelectorAll('.hero-background, [id$="-canvas"]').forEach(e=>initThreeJS(e))},{timeout:2e3}):setTimeout(()=>{document.querySelectorAll('.hero-background, [id$="-canvas"]').forEach(e=>initThreeJS(e))},1e3)`;

if (mainMin.includes(oldMinBlock)) {
    const newMinBlock = `(()=>{let s=!1;const a=()=>{if(s)return;s=!0;document.querySelectorAll('.hero-background, [id$="-canvas"]').forEach(e=>initThreeJS(e))};window.addEventListener("scroll",a,{once:!0,passive:!0}),window.addEventListener("mousemove",a,{once:!0,passive:!0}),window.addEventListener("touchstart",a,{once:!0,passive:!0}),setTimeout(a,8e3)})()`;
    mainMin = mainMin.replace(oldMinBlock, newMinBlock);
    fs.writeFileSync('main.min.js', mainMin);
    console.log('OK main.min.js updated');
} else {
    console.log('FAIL main.min.js: pattern not found');
    // Debug: find "hero-background" context
    const idx = mainMin.indexOf('hero-background');
    if (idx > -1) {
        console.log('  Context around hero-background:');
        console.log('  ' + mainMin.substring(Math.max(0, idx - 80), idx + 200));
    }
}

console.log('Done');
