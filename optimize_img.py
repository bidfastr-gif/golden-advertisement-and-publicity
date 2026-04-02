import sys
import subprocess
import os

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def optimize_image(input_path, output_path, size=None, quality=80):
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'P') and output_path.endswith('.webp'):
                # Keep RGBA for WebP to support transparency
                pass
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            if size:
                img = img.resize(size, Image.Resampling.LANCZOS)
            
            img.save(output_path, 'webp', quality=quality, optimize=True)
            print(f"Optimized: {input_path} -> {output_path}")
            
    except Exception as e:
        print(f"Failed to optimize {input_path}: {e}")

# Paths
base_dir = r"c:\Users\Dell\Downloads\golden-advertising 24-03\golden-advertising\assets"
projects_dir = os.path.join(base_dir, "projects")

# 1. Chatbot Icon (needs specific resizing to save space)
chatbot_in = os.path.join(base_dir, "alien_chatbot_icon.png")
chatbot_out = os.path.join(base_dir, "alien_chatbot_icon.webp")
if os.path.exists(chatbot_in):
    # original is 579x581, HTML displays 140x172. 
    # Use 280x344 for retina support 
    optimize_image(chatbot_in, chatbot_out, size=(280, 344), quality=85)

# Light chatbot icon
light_chatbot_in = os.path.join(base_dir, "Light_chatbot.png")
light_chatbot_out = os.path.join(base_dir, "Light_chatbot.webp")
if os.path.exists(light_chatbot_in):
    optimize_image(light_chatbot_in, light_chatbot_out, size=(280, 344), quality=85)

# 2. Convert all project JPEGs
if os.path.exists(projects_dir):
    for fn in os.listdir(projects_dir):
        if fn.lower().endswith(('.jpeg', '.jpg', '.png')):
            input_path = os.path.join(projects_dir, fn)
            # Create a webp filename
            output_name = os.path.splitext(fn)[0] + '.webp'
            output_path = os.path.join(projects_dir, output_name)
            
            # Don't resize projects, just webp conversion and 80 quality is enough to slash size
            optimize_image(input_path, output_path, quality=75)

print("Image optimization complete.")
