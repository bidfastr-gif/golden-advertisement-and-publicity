import os
import re

css_path = os.path.join('assets', 'fonts.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Minify the CSS slightly for inclusion
css_content = css_content.replace('\n', ' ').replace('  ', ' ')
style_tag = f'<style>{css_content}</style>'

# Find all HTML files
html_files = []
for root, dirs, files in os.walk('.'):
    # Exclude node_modules, .git, etc
    if '.git' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

# Regex to match the old fonts.css link tag
# Matches things like <link rel="stylesheet" href="./assets/fonts.css">
link_pattern = re.compile(r'<link[^>]*href=[\'"](?:.*/)?assets/fonts\.css[\'"][^>]*>', re.IGNORECASE)

files_updated = 0
for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if the file has the link tag
    if link_pattern.search(content):
        new_content = link_pattern.sub(style_tag, content)
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        files_updated += 1

print(f"Inlined fonts.css into {files_updated} HTML files.")

