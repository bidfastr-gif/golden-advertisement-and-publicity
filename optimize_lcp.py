import os
import re

# Find all HTML files
html_files = []
for root, dirs, files in os.walk('.'):
    # Exclude node_modules, .git, etc
    if '.git' in root or '.vscode' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

# Regex to match the preloaderDismiss animation with a long delay
# Matches: animation: preloaderDismiss 0.5s ease-in-out 1.2s forwards;
# Or variants with different whitespace/ordering
pattern = re.compile(r'(animation:\s*preloaderDismiss\s*[\d.]+s\s+ease-in-out\s+)1\.2s(\s+forwards;)')

updated_count = 0
for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = pattern.sub(r'\1 0.1s \2', content)
    
    if new_content != content:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        updated_count += 1

print(f"Updated preloader animation delay from 1.2s to 0.1s in {updated_count} HTML files.")
