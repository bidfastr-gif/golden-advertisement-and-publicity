const fs = require('fs');
const path = require('path');

const dir = __dirname;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const regex = /<h4>Quick Links<\/h4>[\s\S]*?<ul>[\s\S]*?<li><a href="\.\/about\.html">About<\/a><\/li>[\s\S]*?<li><a href="\.\/services\.html">Services<\/a><\/li>[\s\S]*?<li><a href="\.\/contact\.html">Contact<\/a><\/li>[\s\S]*?<\/ul>/g;

const replacement = `<h4>Quick Links</h4>



          <ul>



            <li><a href="./index.html">Home</a></li>



            <li><a href="./about.html">About</a></li>



            <li><a href="./services.html">Services</a></li>



            <li><a href="./studies.html">Case Study</a></li>



            <li><a href="./contact.html">Contact</a></li>



          </ul>`;

let updatedCount = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        updatedCount++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Total files updated: ${updatedCount}`);
