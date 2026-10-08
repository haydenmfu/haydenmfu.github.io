from pathlib import Path
import cv2


source = Path('public/Assets Masked')
targets = [
    ('Projects', 'projects', 'laptop'),
    ('Research', 'research', 'books'),
    ('About Me', 'about', 'notebook'),
    ('Experience', 'experience', 'papers'),
    ('Resume', 'resume', 'resume paper'),
    ('Contact', 'contact', 'postcard'),
]

lines = ['// Generated from the green outlines in public/Assets Masked.', 'export const deskTargets = [']
for filename, view, obj in targets:
    image = cv2.imread(str(source / f'{filename}.png'))
    if image is None:
        raise FileNotFoundError(filename)
    green = ((image[:, :, 1] > 180) & (image[:, :, 2] < 80) & (image[:, :, 0] < 80)).astype('uint8')
    contours, _ = cv2.findContours(green, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if len(contours) != 1:
        raise ValueError(f'{filename}: expected one green outline, got {len(contours)}')
    points = cv2.approxPolyDP(contours[0], 3, True)
    path = 'M ' + ' L '.join(f'{x} {y}' for [[x, y]] in points) + ' Z'
    lines.append(f"  {{ view: '{view}', object: '{obj}', path: '{path}' }},")
lines.append('] as const;')
Path('src/data/deskTargets.ts').write_text('\n'.join(lines) + '\n', encoding='utf-8')
