import os
import glob

font_awesome_override = """
/* Font-Display Swap Override for FontAwesome */
@font-face { font-family: 'Font Awesome 6 Free'; font-style: normal; font-weight: 400; font-display: swap; src: url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-regular-400.woff2) format("woff2"); }
@font-face { font-family: 'Font Awesome 6 Free'; font-style: normal; font-weight: 900; font-display: swap; src: url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2) format("woff2"); }
@font-face { font-family: 'Font Awesome 6 Brands'; font-style: normal; font-weight: 400; font-display: swap; src: url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-brands-400.woff2) format("woff2"); }
"""

base_dir = r"c:\Users\Dell\Downloads\golden-advertising 24-03\golden-advertising"

for html_file in glob.glob(os.path.join(base_dir, "*.html")):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if there is a critical-css block OR style block
    if '<style id="critical-css">' in content:
        # Inject right after opening tag
        if 'Font-Display Swap Override for FontAwesome' not in content:
            new_content = content.replace('<style id="critical-css">', '<style id="critical-css">\n' + font_awesome_override)
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Injected into {os.path.basename(html_file)} via critical-css")
            
    elif '<style>' in content:
        if 'Font-Display Swap Override for FontAwesome' not in content:
            new_content = content.replace('<style>', '<style>\n' + font_awesome_override, 1)
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Injected into {os.path.basename(html_file)} via generic style tag")
            
    else:
        # If no style tag exists, put it in the head
        if 'Font-Display Swap Override for FontAwesome' not in content:
            injection = f"\n<style>\n{font_awesome_override}\n</style>\n</head>"
            new_content = content.replace("</head>", injection)
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Injected into {os.path.basename(html_file)} via new style tag before /head")

print("Font-display overrides complete.")
