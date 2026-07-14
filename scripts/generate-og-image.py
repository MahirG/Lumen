#!/usr/bin/env python3
"""Generate OG/social share image (1200x630) from logo_on_navy.png."""
from PIL import Image, ImageDraw, ImageEnhance
import os

PUBLIC_DIR = '/home/z/my-project/public'
NAVY = (7, 26, 43)  # #071A2B

# Create 1200x630 canvas
canvas = Image.new('RGB', (1200, 630), NAVY)

# Load the logo (1800x440, on navy background)
logo = Image.open(os.path.join(PUBLIC_DIR, 'logo_on_navy.png')).convert('RGBA')

# Scale logo to fit nicely (max width ~900px, maintain aspect ratio)
logo_w, logo_h = logo.size
target_w = 900
scale = target_w / logo_w
target_h = int(logo_h * scale)
logo_resized = logo.resize((target_w, target_h), Image.LANCZOS)

# Center on canvas
x = (1200 - target_w) // 2
y = (630 - target_h) // 2
canvas.paste(logo_resized, (x, y), logo_resized)

# Save
output = os.path.join(PUBLIC_DIR, 'og-image.png')
canvas.save(output, 'PNG', optimize=True)
print(f'OG image: 1200x630 ({os.path.getsize(output)} bytes)')

# Also create a Twitter card version (same size, slightly different layout)
# For now, same image works for both
output_twitter = os.path.join(PUBLIC_DIR, 'twitter-card.png')
canvas.save(output_twitter, 'PNG', optimize=True)
print(f'Twitter card: 1200x630 ({os.path.getsize(output_twitter)} bytes)')
