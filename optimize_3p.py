import os
import re

# Find all HTML files
html_files = []
for root, dirs, files in os.walk('.'):
    if '.git' in root or '.vscode' in root: continue
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

# GTM Interaction-Based Loader
# This replaces the standard async script with one that waits for user interaction.
gtm_pattern = re.compile(r'<!-- Google Analytics \(GA4\) -->\s*<script async src="https://www\.googletagmanager\.com/gtag/js\?id=(G-[A-Z0-0]+)"></script>\s*<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];\s*function gtag\(\) \{ dataLayer\.push\(arguments\); \}\s*gtag\(\'js\', new Date\(\)\);\s*gtag\(\'config\', \'(G-[A-Z0-0]+)\'\);\s*</script>', re.DOTALL)

def gtm_replacement(match):
    gtm_id = match.group(1)
    return f"""  <!-- Optimized Google Analytics (Interaction-Based Loading) -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {{ dataLayer.push(arguments); }}
    gtag('js', new Date());
    gtag('config', '{gtm_id}', {{ 'reporting_exposure': false }});

    (function() {{
      var gtmLoaded = false;
      function loadGTM() {{
        if (gtmLoaded) return;
        gtmLoaded = True;
        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id={gtm_id}';
        document.head.appendChild(script);
      }}
      // Load GTM on first interaction or after a 4s fallback
      window.addEventListener('scroll', loadGTM, {{ once: true, passive: true }});
      window.addEventListener('mousemove', loadGTM, {{ once: true, passive: true }});
      window.addEventListener('touchstart', loadGTM, {{ once: true, passive: true }});
      setTimeout(loadGTM, 4000);
    }})();
  </script>"""

# Unsplash Image Optimization (lazy loading + async decoding)
unsplash_pattern = re.compile(r'<img [^>]*src="https://images\.unsplash\.com/[^"]+"[^>]*>')

def unsplash_replacement(match):
    img_tag = match.group(0)
    # Don't duplicate attributes if they are already there
    if 'loading=' not in img_tag:
        img_tag = img_tag.replace('<img ', '<img loading="lazy" ')
    if 'decoding=' not in img_tag:
        img_tag = img_tag.replace('<img ', '<img decoding="async" ')
    return img_tag

updated_gtm = 0
updated_unsplash = 0

for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content

    # Apply GTM optimization
    content = gtm_pattern.sub(gtm_replacement, content)
    if content != original_content:
        updated_gtm += 1
    
    # Apply Unsplash optimization
    # Second pass for images
    new_content = unsplash_pattern.sub(unsplash_replacement, content)
    if new_content != content:
        updated_unsplash += 1
    
    if new_content != original_content:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)

print(f"Optimized GTM in {updated_gtm} files and Unsplash images in {updated_unsplash} files.")
