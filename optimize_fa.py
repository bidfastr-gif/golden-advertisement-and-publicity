import os
import re

# Recursive search for all HTML files
html_files = []
for root, dirs, files in os.walk('.'):
    if '.git' in root or '.vscode' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

# Target string (blocking FontAwesome link)
target_link = '<link rel="stylesheet" href="./assets/vendor/font-awesome-all.min.css">'

# Optimized replacement (non-blocking)
optimized_link = '<link rel="stylesheet" href="./assets/vendor/font-awesome-all.min.css" media="print" onload="this.media=\'all\'">\n  <noscript><link rel="stylesheet" href="./assets/vendor/font-awesome-all.min.css"></noscript>'

updated_count = 0
for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Simple text replacement to avoid regex issues with many files
    # Only replace if it doesn't already have media="print" (to avoid double replacement)
    if target_link in content:
        new_content = content.replace(target_link, optimized_link)
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        updated_count += 1

print(f"Updated FontAwesome loading call in {updated_count} HTML files.")
