import os
import re

def optimize_html():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove empty lines
    lines = content.split('\n')
    cleaned_lines = [l for l in lines if l.strip() != '']
    content = '\n'.join(cleaned_lines)
    
    # Remove preloader HTML
    content = re.sub(r'<div id="preloader"[\s\S]*?</div>', '', content, flags=re.IGNORECASE)
    
    # Remove preloader CSS (if kept in head)
    content = re.sub(r'#preloader[\s\S]*?}', '', content)
    content = re.sub(r'@keyframes preloaderDismiss[\s\S]*?}', '', content)
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Cleaned index.html")

def optimize_css():
    with open('style.min.css', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Use WebP logo instead of PNG
    content = content.replace('assets/golden_logo.png', 'assets/golden_logo.webp')
    
    with open('style.min.css', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Cleaned style.min.css")

if __name__ == "__main__":
    optimize_html()
    optimize_css()
