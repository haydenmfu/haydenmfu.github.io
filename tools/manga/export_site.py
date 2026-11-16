"""Collect the sketchbook's drawn assets for the website (run on the Spark, from ~/manga-assets).

  python export_site.py OUT_DIR [--no-book]     then copy OUT_DIR into the site's public/sketchbook/

Reads out/book (pencilled frames of the four openings, see book_frames.py), the pencil renders
(see pencil.py) and the photographs they came from. Writes
  book/<ribbon>/fNN.webp, book/frames.json   the opening animations and their ribbon outlines
  plates/<name>_s.webp, plates/<name>_p.webp each drawing and the photograph it came from
  plates/<name>.webp                         each plot or screenshot, in its own colours
  backdrops/<line>.webp                      a strip of skyline for the horizon of a line, graphite on transparent
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

from mangafy import load_rgb

# name on the site -> (folder of pencil renders, folder of photographs, file stem)
PLATES = {
    "street": ("out/skin", "in", "20261108_153927"),
    "hack": ("out/skin", "in", "MITClimateHacks-3"),
    "portrait": ("out/skin", "in", "20261107_105621"),
    "build": ("out/plates2", "in2", "20261013_230648"),
    "lately": ("out/plates2", "in2", "20261114_203051"),
    "sash_raffle": ("out/plates2", "in2", "20261004_145320"),
    "tower": ("out/plates2", "in2", "20261010_174912"),
    "window": ("out/plates2", "in2", "20261011_144948"),
    "coffee": ("out/plates2", "in2", "20260906_202003"),   # the guest wifi password on the table card is smudged in the source
    "sash": ("out/plates2", "in2", "20261004_120912"),
    "irrigation": ("out/plates2", "in2", "20260629_090842"),
    "snow": ("out/plates2", "in2", "20251110_103749"),
    "sash_team": ("out/plates2", "in2", "sash_team"),
}
LONG_SIDE = 1400
# Plots and screenshots: published whole and in their own colours.
# name on the site -> (picture[, the part to keep, as left, top, right, bottom fractions])
FIGURES = {
    "drift": ("out/paper/figure1.png",),             # figure 1 of the forecasting paper, lifted from the PDF onto white
    "particles": ("in3/irrigation_plot.png",),       # as supplied
    "scatter": ("in3/lake_effect.png",),             # black bars cut off, then stretched back from 1600 to 1920 wide (the dots are round again)
    "sixhops": ("in3/sixhops.png",),                 # the Six Hops demo screen
    "hive1": ("in3/hive1.png",),                     # screenshots of The Hive's simulator
    "hive3": ("in3/hive3.png",),
    "dive1": ("in3/dive_branch.png",),               # Dive: a step on someone's path, and the fish builder
    "dive2": ("in3/dive_fish.png",),
}
FIGURE_SIDE = 2000   # larger than a drawing: the lettering has to stay readable. Never enlarged.
# line -> (pencil render with alpha, top and bottom of the strip as fractions of its height[, left and right as fractions of its width])
BACKDROPS = {
    "about": ("out/bg/20261010_182154__pencil_alpha.png", 0.615, 0.745),    # Ithaca and its ridge, from the clock tower
    "research": ("out/bg/20261010_175505__pencil_alpha.png", 0.405, 0.50),  # Cayuga Lake and the far shore
    "projects": ("out/bg/20261108_144830__pencil_alpha.png", 0.43, 0.60, 0.23, 0.94),  # Boston across the Charles, from Memorial Drive during the MIT hack
}


def backdrop(src, top, bottom, left=0.0, right=1.0, width=2200):
    im = Image.open(src).convert("RGBA")
    im = im.crop((round(left * im.width), round(top * im.height), round(right * im.width), round(bottom * im.height)))
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    h, w = a.shape[:2]
    y, x = np.linspace(0, 1, h)[:, None], np.linspace(0, 1, w)[None, :]
    ramp = lambda v, lo, hi: np.clip((v - lo) / (hi - lo), 0, 1)   # noqa: E731
    a[..., 3] *= ramp(y, 0.0, 0.15) * ramp(1 - y, 0.0, 0.55) + 0 * x   # soft above, dissolving into the paper below; hard at the sides, where copies meet
    return Image.fromarray(a.astype(np.uint8), "RGBA")



def main():
    out = Path(sys.argv[1])
    if "--no-book" not in sys.argv:
        meta = json.loads(Path("out/book/frames.json").read_text())
        for name, frames in meta["anims"].items():
            (out / "book" / name).mkdir(parents=True, exist_ok=True)
            for i in range(len(frames)):
                frame = Image.open(f"out/book/pencil/{name}_f{i:02d}__pencil.png").convert("L")
                frame.save(out / f"book/{name}/f{i:02d}.webp", quality=72, method=6)
        (out / "book/frames.json").write_text(json.dumps(meta, separators=(",", ":")))
    (out / "plates").mkdir(parents=True, exist_ok=True)
    for name, (renders, photos, stem) in PLATES.items():
        sketch = Image.open(f"{renders}/{stem}__pencil.png").convert("L")
        photo = Image.fromarray(load_rgb(Path(f"{photos}/{stem}.jpg"), 1600)).resize(sketch.size, Image.LANCZOS)
        k = LONG_SIDE / max(sketch.size)
        size = (round(sketch.width * k), round(sketch.height * k))
        sketch.resize(size, Image.LANCZOS).save(out / f"plates/{name}_s.webp", quality=80, method=6)
        photo.resize(size, Image.LANCZOS).save(out / f"plates/{name}_p.webp", quality=82, method=6)
        print(name, size, round(size[0] / size[1], 3))
    for name, (src, *part) in FIGURES.items():
        colour = Image.open(src).convert("RGB")
        if part:
            x0, y0, x1, y1 = part[0]
            colour = colour.crop((round(x0 * colour.width), round(y0 * colour.height), round(x1 * colour.width), round(y1 * colour.height)))
        k = min(1.0, FIGURE_SIDE / max(colour.size))
        colour = colour.resize((round(colour.width * k), round(colour.height * k)), Image.LANCZOS)
        colour.save(out / f"plates/{name}.webp", quality=86, method=6)
        print("figure", name, colour.size, round(colour.width / colour.height, 3))
    (out / "backdrops").mkdir(parents=True, exist_ok=True)
    for line, (src, *part) in BACKDROPS.items():
        strip = backdrop(src, *part)
        strip.save(out / f"backdrops/{line}.webp", quality=78, method=6)
        print("backdrop", line, strip.size, round(strip.width / strip.height, 3))


if __name__ == "__main__":
    main()
