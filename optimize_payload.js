const fs = require('fs');

try {
    const htmlPath = 'index.html';
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Remove Swiper CSS (cleanly handling the noscript too if possible)
    html = html.replace(/<link[^>]+swiper-bundle\.min\.css[^>]+>/g, '');
    html = html.replace(/<noscript>\s*<\/noscript>/g, '');
    
    // Remove Swiper JS and Three JS
    html = html.replace(/<script[^>]+swiper-bundle\.min\.js[^>]*>\s*<\/script>/g, '');
    html = html.replace(/<script[^>]+three\.min\.js[^>]*>\s*<\/script>/g, '');
    
    fs.writeFileSync(htmlPath, html);
    console.log("Updated index.html");

    const mainJsPath = 'main.js';
    let mainjs = fs.readFileSync(mainJsPath, 'utf8');
    mainjs = mainjs.replace(
        'const startThreeJS = (container) => {',
`const startThreeJS = (container) => {
    if (typeof THREE === 'undefined') {
        if (!window.threeLoading) window.threeLoading = new Promise(resolve => {
            const script = document.createElement('script');
            script.src = './assets/vendor/three.min.js';
            script.onload = resolve;
            document.body.appendChild(script);
        });
        window.threeLoading.then(() => startThreeJS(container));
        return;
    }`
    );
    fs.writeFileSync(mainJsPath, mainjs);
    console.log("Updated main.js");

    const mainMinJsPath = 'main.min.js';
    let mainminjs = fs.readFileSync(mainMinJsPath, 'utf8');
    mainminjs = mainminjs.replace(
        'startThreeJS=e=>{',
        'startThreeJS=e=>{if(typeof THREE==="undefined"){if(!window.threeLoading)window.threeLoading=new Promise((resolve)=>{const script=document.createElement("script");script.src="./assets/vendor/three.min.js";script.onload=resolve;document.body.appendChild(script)});window.threeLoading.then(()=>startThreeJS(e));return;}'
    );
    fs.writeFileSync(mainMinJsPath, mainminjs);
    console.log("Updated main.min.js");

} catch (e) {
    console.error(e);
}
