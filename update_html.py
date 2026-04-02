import os
import re

files_to_update = [
    r"c:\Users\Dell\Downloads\golden-advertising 24-03\golden-advertising\index.html",
    r"c:\Users\Dell\Downloads\golden-advertising 24-03\golden-advertising\about.html",
    r"c:\Users\Dell\Downloads\golden-advertising 24-03\golden-advertising\services.html",
    r"c:\Users\Dell\Downloads\golden-advertising 24-03\golden-advertising\main.js",
]

replacements = {
    "alien_chatbot_icon.png": "alien_chatbot_icon.webp",
    "Light_chatbot.png": "Light_chatbot.webp",
}

for i in range(1, 15):
    replacements[f"{i}.jpeg"] = f"{i}.webp"
    replacements[f"{i}.jpg"] = f"{i}.webp"

for file_path in files_to_update:
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        new_content = content
        for old_str, new_str in replacements.items():
            # Apply replacements globally
            new_content = new_content.replace(old_str, new_str)
            
        if new_content != content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Updated {file_path}")
        else:
            print(f"No changes in {file_path}")
