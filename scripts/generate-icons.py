#!/usr/bin/env python3
"""Generate favicon and app icon PNGs from the ApexEAPro icon-only SVG."""
import cairosvg
import os

PUBLIC_DIR = '/home/z/my-project/public'
SVG_PATH = os.path.join(PUBLIC_DIR, 'icon-only.svg')

# Icon sizes to generate
SIZES = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'icon-180.png': 180,        # apple-touch-icon
    'icon-192.png': 192,        # PWA manifest
    'icon-512.png': 512,        # PWA manifest
    'icon-1024.png': 1024,      # high-res fallback
}

for filename, size in SIZES.items():
    output_path = os.path.join(PUBLIC_DIR, filename)
    cairosvg.svg2png(
        url=SVG_PATH,
        write_to=output_path,
        output_width=size,
        output_height=size,
    )
    file_size = os.path.getsize(output_path)
    print(f'  {filename}: {size}x{size} ({file_size} bytes)')

# Also create the ICO favicon (multi-size)
from PIL import Image
favicon_ico = os.path.join(PUBLIC_DIR, 'favicon.ico')
img32 = Image.open(os.path.join(PUBLIC_DIR, 'favicon-32x32.png'))
img32.save(favicon_ico, format='ICO', sizes=[(16,16), (32,32)])
print(f'  favicon.ico: multi-size ({os.path.getsize(favicon_ico)} bytes)')

print('\nAll icons generated successfully!')
