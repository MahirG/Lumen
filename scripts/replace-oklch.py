#!/usr/bin/env python3
"""
Replace remaining oklch() color values with new brand hex colors.
Handles oklch patterns with underscores and alpha values.
"""
import os
import re

SRC_DIR = '/home/z/my-project/src'

# Direct string replacements for common oklch patterns
# Format: old_pattern → new_value
DIRECT_REPLACEMENTS = {
    # Gold/amber oklch → #F7A707 or #FFC83D
    'oklch(0.92_0.14_85)': '#FFC83D',
    'oklch(0.92_0.13_85)': '#FFC83D',
    'oklch(0.82_0.15_85)': '#F7A707',
    'oklch(0.78_0.16_85)': '#F7A707',
    'oklch(0.95_0.10_85)': '#FFC83D',
    'oklch(0.85_0.15_85)': '#FFC83D',
    'oklch(0.75_0.02_60)': '#F7A707',
    'oklch(0.75 0.02 60)': '#F7A707',
    'oklch(0.85_0.02_60)': '#F7A707',
    'oklch(0.72_0.18_75)': '#F7A707',
    'oklch(0.78_0.16_60)': '#FFC107',

    # Gold with alpha → rgba gold
    'oklch(0.82_0.15_85/15%)': 'rgba(247, 167, 7, 0.15)',
    'oklch(0.82_0.15_85/20%)': 'rgba(247, 167, 7, 0.20)',
    'oklch(0.82_0.15_85/5%)': 'rgba(247, 167, 7, 0.05)',
    'oklch(0.82_0.15_85/40%)': 'rgba(247, 167, 7, 0.40)',
    'oklch(0.82_0.15_85/8%)': 'rgba(247, 167, 7, 0.08)',
    'oklch(0.82_0.15_85/50%)': 'rgba(247, 167, 7, 0.50)',
    'oklch(0.92_0.14_85/22%)': 'rgba(255, 200, 61, 0.22)',
    'oklch(0.92_0.14_85/10%)': 'rgba(255, 200, 61, 0.10)',

    # Green oklch → #00E676
    'oklch(0.85_0.15_145)': '#00E676',
    'oklch(0.72_0.18_145)': '#00E676',
    'oklch(0.88_0.16_152)': '#00E676',
    'oklch(0.78_0.19_152)': '#00E676',
    'oklch(0.72_0.18_145/15%)': 'rgba(0, 230, 118, 0.15)',
    'oklch(0.72_0.18_145/20%)': 'rgba(0, 230, 118, 0.20)',

    # Red oklch → #FF5252
    'oklch(0.66_0.22_25)': '#FF5252',
    'oklch(0.66_0.24_25)': '#FF5252',
    'oklch(0.7_0.2_25)': '#FF5252',
    'oklch(0.88_0.16_25)': '#FF5252',
    'oklch(0.66_0.22_25/20%)': 'rgba(255, 82, 82, 0.20)',
    'oklch(0.66_0.22_25/15%)': 'rgba(255, 82, 82, 0.15)',
    'oklch(0.66_0.22_25/8%)': 'rgba(255, 82, 82, 0.08)',
    'oklch(0.66_0.22_25/5%)': 'rgba(255, 82, 82, 0.05)',
    'oklch(0.66_0.22_25/10%)': 'rgba(255, 82, 82, 0.10)',

    # Dark backgrounds → #0B0B0B or #1A1A1A
    'oklch(0.16_0.012_240)': '#1A1A1A',
    'oklch(0.16 0.012 240)': '#1A1A1A',
    'oklch(0.16_0.025_265)': '#1A1A1A',

    # White/light → #FFFFFF
    'oklch(0.97 0.005 240)': '#FFFFFF',
    'oklch(0.97_0.005_240)': '#FFFFFF',
    'oklch(1 0 0)': '#FFFFFF',
    'oklch(1_0_0)': '#FFFFFF',
}

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

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    for old, new in DIRECT_REPLACEMENTS.items():
        content = content.replace(old, new)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        updated_count += 1
        print(f'  Updated: {os.path.relpath(filepath, SRC_DIR)}')

print(f'\nTotal files updated: {updated_count}')
