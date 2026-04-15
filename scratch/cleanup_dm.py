import os

file_path = r"c:\Users\Dell\Downloads\golden-advertisement-and-publicity\digital-marketing.html"
if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    skip = False
    for line in lines:
        if '<!-- SVG START -->' in line:
            skip = True
            continue
        if '<!-- SVG END -->' in line:
            skip = False
            continue
        if '<!-- SVG Illustration -->' in line:
            continue
        if skip:
            continue
        new_lines.append(line)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Cleaned up digital-marketing.html")
else:
    print("File not found")
