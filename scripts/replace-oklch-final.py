#!/usr/bin/env python3
"""
Final aggressive oklch replacement using regex.
Catches all remaining oklch patterns and converts to hex/rgba.
"""
import os
import re

SRC_DIR = '/home/z/my-project/src'

def oklch_to_hex(l, c, h):
    """Convert oklch L C H to approximate hex color based on hue."""
    l = float(l)
    c = float(c)
    h = float(h)

    # Gold/amber range (hue 60-100)
    if 50 <= h <= 100:
        if l >= 0.85:
            return '#FFC83D'
        elif l >= 0.75:
            return '#F7A707'
        else:
            return '#E69500'

    # Green range (hue 140-160)
    if 130 <= h <= 165:
        if l >= 0.80:
            return '#00E676'
        else:
            return '#00C853'

    # Red range (hue 15-30)
    if 10 <= h <= 35:
        if l >= 0.85:
            return '#FF7252'
        elif l >= 0.65:
            return '#FF5252'
        else:
            return '#CC3333'

    # Blue range (hue 220-260) → convert to gold (rebrand)
    if 200 <= h <= 270:
        if l >= 0.85:
            return '#FFC83D'
        elif l >= 0.70:
            return '#F7A707'
        elif l >= 0.50:
            return '#1A1A1A'
        else:
            return '#0B0B0B'

    # Purple range (hue 270-310)
    if 270 <= h <= 320:
        return '#7C5CFC'

    # Neutral/dark
    if c < 0.05:
        if l >= 0.90:
            return '#FFFFFF'
        elif l >= 0.70:
            return '#A1A1AA'
        elif l >= 0.40:
            return '#6B7280'
        elif l >= 0.15:
            return '#1A1A1A'
        else:
            return '#0B0B0B'

    return None

def replace_oklch_match(match):
    """Process a single oklch() match."""
    full = match.group(0)
    inner = match.group(1)

    # Parse: "L C H" or "L_C_H" with optional "/alpha%"
    # Normalize underscores to spaces
    inner_norm = inner.replace('_', ' ')

    # Check for alpha
    alpha = None
    if '/' in inner_norm:
        parts = inner_norm.split('/')
        inner_norm = parts[0].strip()
        alpha_str = parts[1].strip()
        if alpha_str.endswith('%'):
            alpha = float(alpha_str[:-1]) / 100.0
        else:
            try:
                alpha = float(alpha_str)
            except:
                pass

    # Parse L C H
    parts = inner_norm.strip().split()
    if len(parts) < 3:
        return full  # Can't parse, leave as-is

    try:
        l, c, h = parts[0], parts[1], parts[2]
        hex_color = oklch_to_hex(l, c, h)
        if not hex_color:
            return full

        if alpha is not None:
            # Convert to rgba
            r = int(hex_color[1:3], 16)
            g = int(hex_color[3:5], 16)
            b = int(hex_color[5:7], 16)
            return f'rgba({r}, {g}, {b}, {alpha})'
        else:
            return hex_color
    except:
        return full

def get_files(directory):
    files = []
    for root, dirs, filenames in os.walk(directory):
        if 'node_modules' in root:
            continue
        for f in filenames:
            if f.endswith(('.tsx', '.ts', '.css')):
                files.append(os.path.join(root, f))
    return files

files = get_files(SRC_DIR)
updated_count = 0

# Regex to match oklch(...) including nested parens for alpha
# Matches: oklch(L C H) or oklch(L C H / alpha)
pattern = re.compile(r'oklch\(([^)]+)\)')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    content = pattern.sub(replace_oklch_match, content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        updated_count += 1
        print(f'  Updated: {os.path.relpath(filepath, SRC_DIR)}')

print(f'\nTotal files updated: {updated_count}')
