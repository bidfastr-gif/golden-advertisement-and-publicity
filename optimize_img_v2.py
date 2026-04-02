import os
from PIL import Image

def optimize_image(input_path, output_path, max_width=None, quality=70):
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if necessary for WebP (or RGBA for transparency)
            if img.mode in ('RGBA', 'P') and output_path.endswith('.webp'):
                pass
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize logic
            if max_width and img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                
            img.save(output_path, 'webp', quality=quality, optimize=True)
            print(f"Optimized: {input_path} -> {output_path} (Size: {img.size})")
            
    except Exception as e:
        print(f"Failed to optimize {input_path}: {e}")

base_dir = r"c:\Users\Dell\Downloads\golden-advertising 24-03\golden-advertising\assets"
projects_dir = os.path.join(base_dir, "projects")

# 1. Compress logos
logo_in = os.path.join(base_dir, "golden_logo.png")
logo_out = os.path.join(base_dir, "golden_logo.webp")
if os.path.exists(logo_in):
    # original 1238x675, display 231x126 -> use 462 width for 2x retina
    optimize_image(logo_in, logo_out, max_width=500, quality=75)

# 2. Re-compress projects to max width 800
if os.path.exists(projects_dir):
    for fn in os.listdir(projects_dir):
        if fn.lower().endswith('.webp'):
            input_path = os.path.join(projects_dir, fn)
            # Override the current webp files with downscaled ones
            optimize_image(input_path, input_path, max_width=800, quality=65)

# 3. Compress chatbot icon further
bot_in = os.path.join(base_dir, "alien_chatbot_icon.webp")
if os.path.exists(bot_in):
    optimize_image(bot_in, bot_in, max_width=280, quality=55)

print("Image rescalings complete")
