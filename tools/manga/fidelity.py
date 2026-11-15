"""How far did a stylised image drift from its source photo?

Traces contours in both images with the same line extractor, then compares them with a
small pixel tolerance.

  kept  : share of the photo's contours that still exist in the same place
  added : share of the candidate's contours with no counterpart in the photo

Also writes an overlay: candidate in grey, photo contours it lost in red, contours it
invented in blue.

  python fidelity.py PHOTO CANDIDATE OVERLAY.jpg [--tol 0.004]
"""
import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps

import lineart


def load(path, size=None):
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    if size:
        im = im.resize(size, Image.LANCZOS)
    return np.asarray(im)


def contours(rgb, res):
    # coarse model at modest resolution: object and structure outlines, not texture or dot tone
    line = lineart.extract(cv2.GaussianBlur(rgb, (0, 0), 1.2), res=res, coarse=True)
    return line < 0.55


def compare(photo, cand, tol_frac=0.004, res=1024):
    a, b = contours(photo, res), contours(cand, res)
    r = max(2, round(tol_frac * max(photo.shape[:2])))
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
    a_fat = cv2.dilate(a.astype(np.uint8), k) > 0
    b_fat = cv2.dilate(b.astype(np.uint8), k) > 0
    lost, added = a & ~b_fat, b & ~a_fat
    kept = 1 - lost.sum() / max(a.sum(), 1)
    extra = added.sum() / max(b.sum(), 1)
    return kept, extra, lost, added, r


def overlay(cand, lost, added):
    g = cv2.cvtColor(cand, cv2.COLOR_RGB2GRAY).astype(np.float32)
    g = 255 - (255 - g) * 0.35  # fade so the marks read clearly
    out = np.dstack([g, g, g])
    k = np.ones((3, 3), np.uint8)
    out[cv2.dilate(added.astype(np.uint8), k) > 0] = (40, 90, 255)
    out[cv2.dilate(lost.astype(np.uint8), k) > 0] = (230, 30, 30)
    return out.astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("photo", help="photo, or a folder of photos when --batch is given")
    ap.add_argument("candidate", help="candidate image, or a folder of <stem>__*.png candidates")
    ap.add_argument("overlay", nargs="?")
    ap.add_argument("--batch", action="store_true")
    ap.add_argument("--tol", type=float, default=0.004)
    args = ap.parse_args()
    if not args.batch:
        pairs = [(Path(args.photo), Path(args.candidate), args.overlay)]
    else:
        pairs = []
        for ph in sorted(Path(args.photo).iterdir()):
            for c in sorted(Path(args.candidate).glob(f"{ph.stem}__*.png")):
                pairs.append((ph, c, c.with_name(c.stem + "__fid.jpg") if args.overlay else None))
    for ph, c, ov in pairs:
        cand = load(c)
        photo = load(ph, (cand.shape[1], cand.shape[0]))
        kept, extra, lost, added, r = compare(photo, cand, args.tol)
        print(f"{c.name}: kept={kept:.3f} added={extra:.3f} (tolerance {r}px)", flush=True)
        if ov:
            Image.fromarray(overlay(cand, lost, added)).save(ov, quality=90)


if __name__ == "__main__":
    main()
