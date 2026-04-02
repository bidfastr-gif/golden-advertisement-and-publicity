import os

base_dir = r"c:\Users\Dell\Downloads\golden-advertising 24-03\golden-advertising"

for obj in os.listdir(base_dir):
    if obj.endswith('.html'):
        path = os.path.join(base_dir, obj)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # We only want to replace it in img tags where possible, or just globally 
        # since it's just the logo and webp is perfectly valid for OG tags to some extent 
        # but let's be explicitly careful. Actually, WebP is now fully supported in OG:image across major platforms.
        # But to be safe, I'll only replace `src` attributes.
        new_content = content.replace('src="./assets/golden_logo.png"', 'src="./assets/golden_logo.webp"')
        new_content = new_content.replace("src='./assets/golden_logo.png'", "src='./assets/golden_logo.webp'")
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {obj}")
