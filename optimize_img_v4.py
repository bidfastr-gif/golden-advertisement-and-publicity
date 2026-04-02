import os
import glob
from PIL import Image

def optimize_image(input_path, quality=45):
    try:
        with Image.open(input_path) as img:
            if img.mode in ('RGBA', 'P'):
                pass
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            img.save(input_path, 'webp', quality=quality, optimize=True)
            print(f"Ultra-compressed: {input_path}")
            
    except Exception as e:
        print(f"Failed to crush {input_path}: {e}")

base_dir = r"c:\Users\Dell\Downloads\golden-advertising 24-03\golden-advertising"
assets_dir = os.path.join(base_dir, "assets")
projects_dir = os.path.join(assets_dir, "projects")

# 1. Compress logos explicitly heavily
logo_path = os.path.join(assets_dir, "golden_logo.webp")
if os.path.exists(logo_path):
    optimize_image(logo_path, quality=45)

# 2. Compress project slides explicitly heavily
if os.path.exists(projects_dir):
    for fn in os.listdir(projects_dir):
        if fn.lower().endswith('.webp'):
            input_path = os.path.join(projects_dir, fn)
            # Re-saving with lower quality natively drops the file size to meet PageSpeed's rigid threshold
            optimize_image(input_path, quality=45)

# 3. Compress chatbot icon specifically
bot_path = os.path.join(assets_dir, "alien_chatbot_icon.webp")
if os.path.exists(bot_path):
    optimize_image(bot_path, quality=35)

# 4. Fix HTML Unsplash URLs globally (Drop down to w=50 since display is 15x10)
for html_file in glob.glob(os.path.join(base_dir, "*.html")):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace("w=400", "w=50")
    
    if new_content != content:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched Unsplash URLs to w=50 in {os.path.basename(html_file)}")

print("Ultra-compression complete")
