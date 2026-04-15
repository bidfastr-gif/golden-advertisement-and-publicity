import os
import re

# Master font CSS
css_path = os.path.join('assets', 'fonts.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Minify for inlining (simple minify)
min_css = css_content.replace('\n', ' ').replace('  ', ' ')
style_tag = f'<style>{min_css}</style>'

# Identify standard fonts to preload (Latin subsets for 400 and 700 weights)
# Use a set to ensure uniqueness
preload_urls_set = set()
# Preload Inter (400) and Outfit (400, 700) Latin subsets
inter_400_match = re.search(r'/\* latin \*/\s*@font-face\s*{[^}]*font-family:\s*\'Inter\';[^}]*font-weight:\s*400;[^}]*src:\s*url\((.*?)\)', css_content)
outfit_400_match = re.search(r'/\* latin \*/\s*@font-face\s*{[^}]*font-family:\s*\'Outfit\';[^}]*font-weight:\s*400;[^}]*src:\s*url\((.*?)\)', css_content)
outfit_700_match = re.search(r'/\* latin \*/\s*@font-face\s*{[^}]*font-family:\s*\'Outfit\';[^}]*font-weight:\s*700;[^}]*src:\s*url\((.*?)\)', css_content)

if inter_400_match: preload_urls_set.add(inter_400_match.group(1).strip())
if outfit_400_match: preload_urls_set.add(outfit_400_match.group(1).strip())
if outfit_700_match: preload_urls_set.add(outfit_700_match.group(1).strip())

# Also preload FontAwesome (usually static names)
preload_urls_set.add("./assets/webfonts/fa-solid-900.woff2")
preload_urls_set.add("./assets/webfonts/fa-brands-400.woff2")
preload_urls_set.add("./assets/webfonts/fa-regular-400.woff2")

# Consistent ordering
preload_urls = sorted(list(preload_urls_set))

preload_tags_html = "\n".join([f'  <link rel="preload" href="{url}" as="font" type="font/woff2" crossorigin="anonymous">' for url in preload_urls])

# Process all HTML files recursively
html_files = []
for root, dirs, files in os.walk('.'):
    if '.git' in root or '.vscode' in root: continue
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

updated_files_count = 0
for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original_content = content

    # 1. Update/Replace the inlined font style block
    # This might have been previously inlined as one massive line or multiple lines
    content = re.sub(r'<style>/\* cyrillic-ext \*/.*?</style>', style_tag, content, flags=re.DOTALL)

    # 2. Update/Replace preload tags
    # Strategy: Find any existing woff2 preloads and replace them, OR find the top of HEAD
    
    # First, strip all existing woff2 font preloads to avoid duplicates
    content = re.sub(r'\s*<link rel="preload" href=".*?\.woff2" as="font".*?>', '', content)
    
    # Now insert them back after style.css preload, or at start of head
    if 'link rel="preload" href="style.css"' in content:
        content = re.sub(r'(<link rel="preload" href="style.css"[^>]*>)', r'\1\n' + preload_tags_html, content)
    elif '<head>' in content:
        content = content.replace('<head>', '<head>\n' + preload_tags_html)

    if content != original_content:
        with open(html_file, 'w', encoding='utf-8', errors='ignore') as f:
            f.write(content)
        updated_files_count += 1

print(f"Synchronized font CSS and deduplicated preloads for {updated_files_count} HTML files.")
