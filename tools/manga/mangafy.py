"""Deterministic photo -> black-and-white manga-style asset.

  lines : learned line-art extraction (pixel-aligned to the photo)
  tones : the photo's own luminance, flattened and quantised into a few tone bands,
          rendered either as screentone dots or as flat grey wash

Nothing here is generative: every mark is derived from the pixel under it.

  python mangafy.py IN_DIR OUT_DIR [--long-side 1600] [--levels 4] [--pitch 7]
"""
import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps
from skimage.filters import threshold_multiotsu

import lineart

EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}

# Ink coverage per tone band, darkest band first.
PALETTES = {
    3: [1.00, 0.26, 0.0],
    4: [1.00, 0.38, 0.14, 0.0],
    5: [1.00, 0.50, 0.28, 0.11, 0.0],
}


def load_rgb(path, long_side):
    im = ImageOps.exif_transpose(Image.open(path))
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(bg, im)
    im = im.convert("RGB")
    s = long_side / max(im.size)
    if s < 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    return np.asarray(im)


def luminance(rgb):
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)[..., 0].astype(np.float32) / 255.0


def flatten(rgb, scale=0.5, strength=0.02):
    """Edge-preserving smoothing for the tone layer only (lines carry the detail).

    Smoothing runs at reduced scale so texture such as foliage, fleece and hair merges into
    large flat shapes; a guided filter then snaps the result back onto the full-resolution
    edges so tone boundaries still sit exactly on the photo's contours.
    """
    if not hasattr(cv2, "ximgproc"):
        out = rgb
        for _ in range(3):
            out = cv2.bilateralFilter(out, d=9, sigmaColor=32, sigmaSpace=9)
        return luminance(out)
    h, w = rgb.shape[:2]
    small = cv2.resize(rgb, (round(w * scale), round(h * scale)), interpolation=cv2.INTER_AREA)
    small = cv2.ximgproc.l0Smooth(small, None, strength, 2.0)
    L = cv2.resize(luminance(small), (w, h), interpolation=cv2.INTER_CUBIC)
    guide = luminance(cv2.bilateralFilter(rgb, d=7, sigmaColor=28, sigmaSpace=7))
    return np.clip(cv2.ximgproc.guidedFilter(guide, L, 6, 4e-4), 0, 1)


def remove_islands(bands, levels, min_area):
    """Merge tone patches smaller than min_area into whatever surrounds them."""
    if min_area <= 0:
        return bands
    fill = cv2.medianBlur(bands, 21)
    out = bands.copy()
    for b in range(levels):
        n, lab, stats, _ = cv2.connectedComponentsWithStats((bands == b).astype(np.uint8), connectivity=4)
        tiny = np.isin(lab, np.flatnonzero(stats[:, cv2.CC_STAT_AREA] < min_area)) & (bands == b)
        out[tiny] = fill[tiny]
    return out


def tone_bands(rgb, levels=4, thresholds=None, clean=5, local=0.3, max_black=0.40, min_white=0.30,
               tone_scale=0.5, tone_strength=0.02, island=0.0004):
    L = flatten(rgb, tone_scale, tone_strength)
    lo, hi = np.percentile(L, [1, 99])
    L = np.clip((L - lo) / max(hi - lo, 1e-3), 0, 1)
    if local > 0:  # local contrast, so dim scenes do not collapse into one black mass
        eq = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4, 4)).apply((L * 255).astype(np.uint8)) / 255.0
        L = ((1 - local) * L + local * eq).astype(np.float32)
    if thresholds is None:
        small = cv2.resize(L, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA)
        otsu = threshold_multiotsu(small, classes=levels)
        # Ink budget: cap how much of the page may go solid black, and keep some paper white.
        caps = np.quantile(small, np.linspace(max_black, 1 - min_white, levels - 1))
        thresholds = [min(float(t), float(c)) for t, c in zip(otsu, caps)]
        for i in range(1, len(thresholds)):
            thresholds[i] = max(thresholds[i], thresholds[i - 1] + 0.02)
    bands = np.digitize(L, thresholds).astype(np.uint8)
    if clean > 1:
        bands = cv2.medianBlur(bands, clean)
    bands = remove_islands(bands, levels, int(island * bands.size))
    return bands, L, list(map(float, thresholds))


def despeckle(line, min_area):
    """Erase isolated ink specks (skin pores, sensor noise); long strokes are untouched."""
    if min_area <= 0:
        return line
    n, lab, stats, _ = cv2.connectedComponentsWithStats((line < 0.6).astype(np.uint8), connectivity=8)
    tiny = np.isin(lab, np.flatnonzero(stats[:, cv2.CC_STAT_AREA] < min_area))
    halo = cv2.dilate(tiny.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    out = line.copy()
    out[tiny | (halo & (lab == 0))] = 1.0  # the speck plus its soft edge, never a neighbouring stroke
    return out


def compose(tone, line, cov, knockout=True):
    """Ink lines over tone. Inside solid-black areas lines are drawn in white instead,
    so folds and seams in dark hair and clothing stay readable."""
    out = np.minimum(tone, line)
    if knockout:
        black = (cov > 0.9).astype(np.uint8)
        inner = cv2.erode(black, np.ones((7, 7), np.uint8)).astype(np.float32)
        inner = cv2.GaussianBlur(inner, (0, 0), 1.0)
        # only long, confident strokes: fabric fuzz and hair noise would just turn into white static
        strong = np.clip((0.45 - despeckle(line, 90)) / 0.3, 0, 1)
        out = np.maximum(out, inner * strong * 0.95)
    return out


def coverage_map(bands, levels, soften=1.2):
    cov = np.asarray(PALETTES[levels], np.float32)[bands]
    if soften > 0:
        cov = cv2.GaussianBlur(cov, (0, 0), soften)
    return cov


def screen(h, w, pitch, angle=45.0):
    """Dot-screen threshold matrix in [0,1], equalised so coverage c inks a fraction c."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    a = np.deg2rad(angle)
    u = xx * np.cos(a) + yy * np.sin(a)
    v = -xx * np.sin(a) + yy * np.cos(a)
    s = (np.cos(2 * np.pi * u / pitch) + np.cos(2 * np.pi * v / pitch)) / 4 + 0.5
    ref = np.sort(s.ravel()[::11])
    return np.interp(s, ref, np.linspace(0, 1, ref.size)).astype(np.float32)


def render_screentone(cov, pitch, ss=3):
    h, w = cov.shape
    big = cv2.resize(cov, (w * ss, h * ss), interpolation=cv2.INTER_LINEAR)
    T = screen(h * ss, w * ss, pitch * ss)
    inked = (T > 1.0 - big).astype(np.float32)
    inked[big >= 0.97] = 1.0
    inked[big <= 0.02] = 0.0
    return 1.0 - cv2.resize(inked, (w, h), interpolation=cv2.INTER_AREA)


def render_wash(cov):
    return 1.0 - cov


def save(arr, path):
    Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8)).save(path)


def save_lines_rgba(line, path):
    """Black ink on a transparent background, for layering on the site."""
    a = ((1 - np.clip(line, 0, 1)) * 255 + 0.5).astype(np.uint8)
    rgba = np.zeros((*a.shape, 4), np.uint8)
    rgba[..., 3] = a
    Image.fromarray(rgba, "RGBA").save(path)


def process(path, out_dir, args):
    rgb = load_rgb(path, args.long_side)
    stem = path.stem
    scales = [int(s) for s in args.line_scales.split(",")]
    raw = lineart.extract_multi(rgb, scales, coarse=args.coarse, device=args.device)
    line = despeckle(lineart.ink(raw, args.line_lo, args.line_hi), args.despeckle)

    thr = [float(t) for t in args.thresholds.split(",")] if args.thresholds else None
    levels = len(thr) + 1 if thr else args.levels
    bands, _, used = tone_bands(rgb, levels, thr, local=args.local, max_black=args.max_black,
                                min_white=args.min_white, tone_scale=args.tone_scale,
                                tone_strength=args.tone_strength, island=args.island)
    cov = coverage_map(bands, levels)
    pitch = args.pitch or max(4.0, max(rgb.shape[:2]) / 300)

    save(line, out_dir / f"{stem}__lines.png")
    save_lines_rgba(line, out_dir / f"{stem}__lines_alpha.png")
    save(compose(render_screentone(cov, pitch), line, cov), out_dir / f"{stem}__screentone.png")
    save(compose(render_wash(cov), line, cov), out_dir / f"{stem}__wash.png")
    print(f"{path.name}: {rgb.shape[1]}x{rgb.shape[0]} thresholds={np.round(used, 3).tolist()} pitch={pitch:.1f}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("in_dir", type=Path)
    ap.add_argument("out_dir", type=Path)
    ap.add_argument("--long-side", type=int, default=1600)
    ap.add_argument("--line-scales", default="768,1536")
    ap.add_argument("--coarse", action="store_true")
    ap.add_argument("--line-lo", type=float, default=0.25)
    ap.add_argument("--line-hi", type=float, default=0.85)
    ap.add_argument("--levels", type=int, default=4, choices=sorted(PALETTES))
    ap.add_argument("--thresholds", default="", help="fixed luminance cuts, e.g. 0.25,0.5,0.75")
    ap.add_argument("--local", type=float, default=0.3, help="local contrast mix, 0..1")
    ap.add_argument("--max-black", type=float, default=0.40, help="max fraction of solid black")
    ap.add_argument("--min-white", type=float, default=0.30, help="min fraction left as paper")
    ap.add_argument("--tone-scale", type=float, default=0.5, help="scale the tone layer is smoothed at")
    ap.add_argument("--tone-strength", type=float, default=0.02, help="L0 smoothing strength")
    ap.add_argument("--island", type=float, default=0.0004, help="min tone patch, fraction of image area")
    ap.add_argument("--only", default="", help="process only files whose name contains this")
    ap.add_argument("--despeckle", type=int, default=14, help="erase ink specks below this area in px")
    ap.add_argument("--pitch", type=float, default=0, help="screentone dot spacing in px (0 = auto)")
    ap.add_argument("--device", default="cuda")
    args = ap.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    files = sorted(p for p in args.in_dir.iterdir() if p.suffix.lower() in EXTS and args.only in p.name)
    for p in files:
        process(p, args.out_dir, args)


if __name__ == "__main__":
    main()
