#!/usr/bin/env python3
"""
Bulk replace legacy color values with new ApexEAPro brand tokens.
Operates on all .tsx, .ts, and .css files under src/.
"""
import os
import re

SRC_DIR = '/home/z/my-project/src'

# Mapping of legacy patterns → new brand values
# Order matters: more specific patterns first
REPLACEMENTS = [
    # === oklch color values ===
    # Gold/amber oklch → #F7A707
    (r'oklch\([^)]*0\.8[0-9]\s+0\.1[0-9]\s+8[0-9][^)]*\)', '#F7A707'),  # gold-ish
    (r'oklch\([^)]*0\.9[0-9]\s+0\.1[0-9]\s+8[0-9][^)]*\)', '#FFC83D'),  # light gold
    (r'oklch\([^)]*0\.82\s+0\.15\s+85[^)]*\)', '#F7A707'),
    (r'oklch\([^)]*0\.92\s+0\.14\s+85[^)]*\)', '#FFC83D'),
    (r'oklch\([^)]*0\.92\s+0\.13\s+85[^)]*\)', '#FFC83D'),
    (r'oklch\([^)]*0\.85\s+0\.15\s+85[^)]*\)', '#FFC83D'),
    (r'oklch\([^)]*0\.85\s+0\.15\s+25[^)]*\)', '#FF5252'),  # red-ish
    (r'oklch\([^)]*0\.78\s+0\.16\s+60[^)]*\)', '#FFC107'),  # warning amber
    (r'oklch\([^)]*0\.78\s+0\.16\s+85[^)]*\)', '#F7A707'),

    # Green oklch → #00E676
    (r'oklch\([^)]*0\.7[0-9]\s+0\.1[0-9]\s+14[0-9][^)]*\)', '#00E676'),
    (r'oklch\([^)]*0\.7[0-9]\s+0\.1[0-9]\s+15[0-9][^)]*\)', '#00E676'),
    (r'oklch\([^)]*0\.72\s+0\.18\s+145[^)]*\)', '#00E676'),
    (r'oklch\([^)]*0\.78\s+0\.19\s+152[^)]*\)', '#00E676'),

    # Red oklch → #FF5252
    (r'oklch\([^)]*0\.6[0-9]\s+0\.2[0-9]\s+2[0-9][^)]*\)', '#FF5252'),
    (r'oklch\([^)]*0\.66\s+0\.22\s+25[^)]*\)', '#FF5252'),
    (r'oklch\([^)]*0\.66\s+0\.24\s+25[^)]*\)', '#FF5252'),

    # Blue oklch → #F7A707 (rebrand from blue to gold)
    (r'oklch\([^)]*0\.7[0-9]\s+0\.1[0-9]\s+2[0-9][0-9][^)]*\)', '#F7A707'),
    (r'oklch\([^)]*0\.7\s+0\.13\s+230[^)]*\)', '#F7A707'),
    (r'oklch\([^)]*0\.7\s+0\.1\s+230[^)]*\)', '#F7A707'),
    (r'oklch\([^)]*0\.78\s+0\.13\s+230[^)]*\)', '#F7A707'),

    # Purple oklch → #7C5CFC (keep purple as secondary)
    (r'oklch\([^)]*0\.6[0-9]\s+0\.2[0-9]\s+2[0-9][0-9][^)]*\)', '#7C5CFC'),

    # Navy/dark bg oklch → #0B0B0B
    (r'oklch\([^)]*0\.07\s+0\.018\s+265[^)]*\)', '#0B0B0B'),
    (r'oklch\([^)]*0\.0[0-9]\s+0\.0[0-9][0-9]\s+265[^)]*\)', '#0B0B0B'),
    (r'oklch\([^)]*0\.1[0-9]\s+0\.0[0-9][0-9]\s+265[^)]*\)', '#1A1A1A'),

    # Light bg oklch → #FFFFFF or #F8F9FB
    (r'oklch\([^)]*0\.9[0-9]\s+0\.0[0-9][0-9]\s+240[^)]*\)', '#FFFFFF'),
    (r'oklch\([^)]*0\.97\s+0\.005\s+240[^)]*\)', '#FFFFFF'),

    # Muted foreground oklch → use var
    (r'oklch\([^)]*0\.4[0-9]\s+0\.0[0-9][0-9]\s+265[^)]*\)', 'var(--muted-foreground)'),

    # === Hex color replacements ===
    ('#F5B942', '#F7A707'),  # old gold → new gold
    ('#10B981', '#00E676'),  # old emerald → new success green
    ('#EF4444', '#FF5252'),  # old red → new error red
    ('#7C5CFC', '#F7A707'),  # old purple → gold (consolidate brand)
    ('#1677FF', '#F7A707'),  # old blue → gold
    ('#3B9BFF', '#FFC83D'),  # old light blue → light gold
    ('#071A2B', '#0B0B0B'),  # old navy → new black
    ('#0F172A', '#0B0B0B'),  # old slate → new black
    ('#E8EDF2', '#FFFFFF'),  # old platinum → white
    ('#F5F5F7', '#FFFFFF'),  # old light → white
    ('#0a0d1a', '#0B0B0B'),  # old dark → new black

    # === rgba replacements ===
    ('rgba(245, 185, 66', 'rgba(247, 167, 7'),   # old gold rgba
    ('rgba(16, 185, 129', 'rgba(0, 230, 118'),   # old emerald rgba
    ('rgba(239, 68, 68', 'rgba(255, 82, 82'),    # old red rgba
    ('rgba(124, 92, 252', 'rgba(247, 167, 7'),   # old purple rgba → gold
    ('rgba(22, 119, 255', 'rgba(247, 167, 7'),   # old blue rgba → gold
    ('rgba(59, 155, 255', 'rgba(255, 200, 61'),  # old light blue rgba → light gold
    ('rgba(7, 20, 43', 'rgba(11, 11, 11'),       # old navy rgba → black
    ('rgba(13, 33, 54', 'rgba(26, 26, 26'),      # old card navy → card dark
    ('rgba(10, 27, 43', 'rgba(34, 34, 34'),      # old popover navy → elevated
    ('rgba(30, 55, 82', 'rgba(34, 34, 34'),      # old secondary navy
    ('rgba(22, 45, 70', 'rgba(26, 26, 26'),      # old muted navy
    ('rgba(120, 160, 200', 'rgba(44, 44, 44'),   # old border blue-gray
    ('rgba(180, 195, 215', 'rgba(161, 161, 170'),# old muted text
]

# Files to process
def get_files(directory):
    files = []
    for root, dirs, filenames in os.walk(directory):
        # Skip node_modules
        if 'node_modules' in root:
            continue
        for f in filenames:
            if f.endswith(('.tsx', '.ts', '.css')):
                files.append(os.path.join(root, f))
    return files

files = get_files(SRC_DIR)
total_replacements = 0

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    for pattern, replacement in REPLACEMENTS:
        if pattern.startswith('oklch'):
            # Regex replacement for oklch patterns
            content = re.sub(pattern, replacement, content)
        else:
            # Literal string replacement
            content = content.replace(pattern, replacement)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        # Count changes
        changes = sum(1 for p, r in REPLACEMENTS if p in original and p not in content)
        total_replacements += changes
        print(f'  Updated: {filepath}')

print(f'\nTotal files updated: {total_replacements}')
print('Done!')
