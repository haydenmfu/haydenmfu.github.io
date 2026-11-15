"""Collect the sketchbook's drawn assets for the website (run on the Spark, from ~/manga-assets).

  python export_site.py OUT_DIR      then copy OUT_DIR into the site's public/sketchbook/

Reads out/book (pencilled frames of the four openings, see book_frames.py), out/skin (pencil
renders, see pencil.py) and in/ (the photographs). Writes
  book/<ribbon>/fNN.webp, book/frames.json   the opening animations and their ribbon outlines
  plates/<name>_s.webp, plates/<name>_p.webp each drawing and the photograph it came from
"""
import json
import sys
from pathlib import Path

from PIL import Image

from mangafy import load_rgb

PLATES = {"killian": "20261107_105621", "street": "20261108_153927", "hack": "MITClimateHacks-3"}


def main():
    out = Path(sys.argv[1])
    meta = json.loads(Path("out/book/frames.json").read_text())
    for name, frames in meta["anims"].items():
        (out / "book" / name).mkdir(parents=True, exist_ok=True)
        for i in range(len(frames)):
            frame = Image.open(f"out/book/pencil/{name}_f{i:02d}__pencil.png").convert("L")
            frame.save(out / f"book/{name}/f{i:02d}.webp", quality=72, method=6)
    (out / "book/frames.json").write_text(json.dumps(meta, separators=(",", ":")))
    (out / "plates").mkdir(parents=True, exist_ok=True)
    for name, src in PLATES.items():
        sketch = Image.open(f"out/skin/{src}__pencil.png").convert("L")
        photo = Image.fromarray(load_rgb(Path(f"in/{src}.jpg"), 1600)).resize(sketch.size, Image.LANCZOS)
        size = (round(sketch.width * 1400 / sketch.height), 1400)
        sketch.resize(size, Image.LANCZOS).save(out / f"plates/{name}_s.webp", quality=80, method=6)
        photo.resize(size, Image.LANCZOS).save(out / f"plates/{name}_p.webp", quality=82, method=6)
        print(name, size)


if __name__ == "__main__":
    main()
