import os
import glob
from PIL import Image

def optimize_image(input_path, output_path, max_width=None, quality=75):
    try:
        with Image.open(input_path) as img:
            if img.mode in ('RGBA', 'P'):
                pass
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            if max_width and img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                
            img.save(output_path, 'webp', quality=quality, optimize=True)
            print(f"Crushed: {input_path} -> {img.size} at quality {quality}")
            
    except Exception as e:
        print(f"Failed to crush {input_path}: {e}")

base_dir = r"c:\Users\Dell\Downloads\golden-advertising 24-03\golden-advertising"
assets_dir = os.path.join(base_dir, "assets")

# 1. Compress golden logo from original PNG explicitly to 250px and VERY low quality to shed the final 7 KiB
original_logo = os.path.join(assets_dir, "golden_logo.png")
target_logo = os.path.join(assets_dir, "golden_logo.webp")
if os.path.exists(original_logo):
    # Brutal quality reduction as PageSpeed insists
    optimize_image(original_logo, target_logo, max_width=250, quality=20)

# 2. Fix HTML Unsplash URLs globally (Drop q=80 to q=30)
for html_file in glob.glob(os.path.join(base_dir, "*.html")):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace("w=50&q=80", "w=50&q=20")
    new_content = new_content.replace("w=50&amp;q=80", "w=50&amp;q=20")
    
    if new_content != content:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched Unsplash quality params in {os.path.basename(html_file)}")

print("Final micro-optimization complete")
