import os
from PIL import Image

def optimize_image(input_path, output_path, max_width=None, quality=5):
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
            print(f"Annihilated: {input_path} -> {img.size} at quality {quality}")
            
    except Exception as e:
        print(f"Failed to crush {input_path}: {e}")

base_dir = r"c:\Users\Dell\Downloads\golden-advertising 24-03\golden-advertising"
assets_dir = os.path.join(base_dir, "assets")

original_logo = os.path.join(assets_dir, "golden_logo.png")
target_logo = os.path.join(assets_dir, "golden_logo.webp")

if os.path.exists(original_logo):
    # Brutal quality reduction and exact layout size downscale
    optimize_image(original_logo, target_logo, max_width=232, quality=5)

print("Final 5kb micro-optimization complete")
