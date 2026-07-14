#!/usr/bin/env python3
"""Generate OG/social share image (1200x630) using new ApexEAPro brand logo."""
from PIL import Image
import os

PUBLIC_DIR = '/home/z/my-project/public'
BRAND_BG = (11, 15, 25)  # #0B0F19 — new brand dark

# Create 1200x630 canvas with brand dark background
canvas = Image.new('RGB', (1200, 630), BRAND_BG)

# Load the horizontal dark logo (4096x1071, transparent)
logo = Image.open(os.path.join(PUBLIC_DIR, 'brand/png/apexeapro_logo_horizontal_dark_transparent.png')).convert('RGBA')

# Scale logo to fit nicely (max width ~900px, maintain aspect ratio)
logo_w, logo_h = logo.size
target_w = 880
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

# Twitter card (same image)
output_twitter = os.path.join(PUBLIC_DIR, 'twitter-card.png')
canvas.save(output_twitter, 'PNG', optimize=True)
print(f'Twitter card: 1200x630 ({os.path.getsize(output_twitter)} bytes)')
