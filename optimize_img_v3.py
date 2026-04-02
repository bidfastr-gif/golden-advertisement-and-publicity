import os
import glob
from PIL import Image

def optimize_image(input_path, output_path, max_width=None, exact_size=None, quality=75):
    try:
        with Image.open(input_path) as img:
            if img.mode in ('RGBA', 'P'):
                pass
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            if exact_size:
                img = img.resize(exact_size, Image.Resampling.LANCZOS)
            elif max_width and img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                
            img.save(output_path, 'webp', quality=quality, optimize=True)
            print(f"Crushed: {input_path} -> {img.size}")
            
    except Exception as e:
        print(f"Failed to crush {input_path}: {e}")

base_dir = r"c:\Users\Dell\Downloads\golden-advertising 24-03\golden-advertising"
assets_dir = os.path.join(base_dir, "assets")
projects_dir = os.path.join(assets_dir, "projects")

# 1. Compress logos explicitly to mobile render sizes (~250px)
logo_path = os.path.join(assets_dir, "golden_logo.webp")
if os.path.exists(logo_path):
    optimize_image(logo_path, logo_path, max_width=250, quality=70)

# 2. Compress project slides explicitly to mobile render sizes (~400px)
if os.path.exists(projects_dir):
    for fn in os.listdir(projects_dir):
        if fn.lower().endswith('.webp'):
            input_path = os.path.join(projects_dir, fn)
            # Mobile displays at ~378px, 400 is plenty
            optimize_image(input_path, input_path, max_width=400, quality=65)

# 3. Compress chatbot icon explicitly to 140x172
bot_path = os.path.join(assets_dir, "alien_chatbot_icon.webp")
if os.path.exists(bot_path):
    optimize_image(bot_path, bot_path, exact_size=(140, 172), quality=60)

# 4. Fix HTML Unsplash URLs globally
for html_file in glob.glob(os.path.join(base_dir, "*.html")):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace("w=1200", "w=400")
    new_content = new_content.replace("w=900", "w=400")
    new_content = new_content.replace("w=800", "w=400")
    
    if new_content != content:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched Unsplash URLs in {os.path.basename(html_file)}")

print("Aggressive rescaling complete")
