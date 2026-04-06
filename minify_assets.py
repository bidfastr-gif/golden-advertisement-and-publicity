import re
import os

def minify_js(content):
    # Remove single-line comments
    content = re.sub(r'//.*', '', content)
    # Remove multi-line comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    # Remove extra whitespace
    content = re.sub(r'\s+', ' ', content)
    return content.strip()

def minify_css(content):
    # Remove comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    # Remove extra whitespace
    content = re.sub(r'\s+', ' ', content)
    # Remove spaces around punctuation
    content = re.sub(r'\s*([{:;,])\s*', r'\1', content)
    return content.strip()

# Minify main.js
js_path = 'main.js'
if os.path.exists(js_path):
    with open(js_path, 'r', encoding='utf-8') as f:
        js_content = f.read()
    minified_js = minify_js(js_content)
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(minified_js)
    print(f"Minified {js_path}")

# Minify style.css
css_path = 'style.css'
if os.path.exists(css_path):
    with open(css_path, 'r', encoding='utf-8') as f:
        css_content = f.read()
    minified_css = minify_css(css_content)
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(minified_css)
    print(f"Minified {css_path}")
