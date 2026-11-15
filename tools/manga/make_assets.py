"""Photo -> black-and-white manga asset, with a fidelity check.

For every photo in IN_DIR:
  1. trace its contours with the line-art network (exact, non-generative)
  2. hand the photo AND the tracing to FLUX.2 klein, which inks and shades the tracing
  3. score each seed against the photo (see fidelity.py) and keep the most faithful one

Outputs in OUT_DIR:
  <name>__manga.png   chosen result, greyscale
  <name>__check.jpg   drift overlay: red = photo contour lost, blue = contour invented
  <name>__lines.png   the exact tracing
  candidates/         every seed, for picking a different one by eye
  report.txt          scores

  python make_assets.py IN_DIR OUT_DIR [--seeds 0,1,2] [--mode traced|photo] [--long-side 1408]

--mode traced  most faithful; best for people and anything where likeness matters
--mode photo   prompt only; freer, cleaner on dim or noisy photos where the tracing is messy
"""
import argparse
import time
from pathlib import Path

import numpy as np
import torch
from diffusers import Flux2KleinPipeline
from PIL import Image

import fidelity
import lineart
from mangafy import EXTS, despeckle, load_rgb

MODEL = "black-forest-labs/FLUX.2-klein-4B"
PROMPTS = {
    "traced": (
        "Image 2 is an exact ink line tracing of the photo in image 1. Produce the finished black "
        "and white manga panel from the tracing: keep every line of image 2 exactly in place, clean "
        "them into confident ink strokes, and add screentone dot shading and solid black fills that "
        "follow the lighting and the dark and light areas of image 1. Black hair and dark clothing "
        "stay dark. Do not add, remove or move anything. Monochrome, no colour."
    ),
    "photo": (
        "Trace this exact photo as a black and white manga panel with clean black ink outlines and "
        "screentone dot shading. This is a faithful tracing, not a reinterpretation: keep every "
        "object, person, building, sign, logo and piece of text exactly where it is and exactly as "
        "it looks. Trace faces precisely as photographed, with the same eye shape, expression and "
        "proportions; do not beautify or stylise them. Keep tonal values: black hair stays solid "
        "black, dark clothing stays dark with solid black fills, light things stay white. "
        "Do not add, remove or move anything. Monochrome, no colour."
    ),
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("in_dir", type=Path)
    ap.add_argument("out_dir", type=Path)
    ap.add_argument("--mode", default="traced", choices=sorted(PROMPTS))
    ap.add_argument("--seeds", default="0,1,2")
    ap.add_argument("--long-side", type=int, default=1408)
    ap.add_argument("--steps", type=int, default=4)
    ap.add_argument("--only", default="", help="process only files whose name contains this")
    args = ap.parse_args()
    cand_dir = args.out_dir / "candidates"
    cand_dir.mkdir(parents=True, exist_ok=True)
    seeds = [int(s) for s in args.seeds.split(",")]

    pipe = Flux2KleinPipeline.from_pretrained(MODEL, torch_dtype=torch.bfloat16).to("cuda")
    report = []
    for path in sorted(p for p in args.in_dir.iterdir() if p.suffix.lower() in EXTS and args.only in p.name):
        rgb = load_rgb(path, args.long_side)
        h, w = (round(d / 16) * 16 for d in rgb.shape[:2])
        photo = Image.fromarray(rgb).resize((w, h), Image.LANCZOS)
        rgb = np.asarray(photo)

        line = despeckle(lineart.ink(lineart.extract_multi(rgb, (768, 1536))), 14)
        lines = Image.fromarray((line * 255 + 0.5).astype(np.uint8))
        lines.save(args.out_dir / f"{path.stem}__lines.png")
        inputs = [photo, lines.convert("RGB")] if args.mode == "traced" else photo

        best = None
        for seed in seeds:
            t = time.time()
            out = pipe(image=inputs, prompt=PROMPTS[args.mode], height=h, width=w,
                       num_inference_steps=args.steps, guidance_scale=1.0,
                       generator=torch.Generator("cuda").manual_seed(seed)).images[0].convert("L")
            out.save(cand_dir / f"{path.stem}__{args.mode}_s{seed}.png")
            cand = np.asarray(out.convert("RGB"))
            kept, added, lost, extra, _ = fidelity.compare(rgb, cand)
            score = kept - 0.25 * added
            row = f"{path.name} {args.mode} seed={seed} kept={kept:.3f} added={added:.3f} ({time.time() - t:.0f}s)"
            print(row, flush=True)
            report.append(row)
            if best is None or score > best[0]:
                best = (score, seed, out, fidelity.overlay(cand, lost, extra))
        _, seed, out, check = best
        out.save(args.out_dir / f"{path.stem}__manga.png")
        Image.fromarray(check).save(args.out_dir / f"{path.stem}__check.jpg", quality=90)
        report.append(f"{path.name} -> chose seed {seed}")
        print(report[-1], flush=True)
    with open(args.out_dir / "report.txt", "a", encoding="utf-8") as f:
        f.write("\n".join(report) + "\n")


if __name__ == "__main__":
    main()
