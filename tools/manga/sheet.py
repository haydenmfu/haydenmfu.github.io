"""Side-by-side comparison sheet.

  python sheet.py OUT.jpg IMG [IMG ...] [--height 1000] [--labels a,b,c] [--crop x0,y0,x1,y1]

--crop takes fractions of each image (0..1), so the same region is cut from every panel
regardless of its resolution.
"""
import argparse

from PIL import Image, ImageDraw, ImageOps


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("images", nargs="+")
    ap.add_argument("--height", type=int, default=1000)
    ap.add_argument("--labels", default="")
    ap.add_argument("--crop", default="")
    args = ap.parse_args()
    labels = args.labels.split(",") if args.labels else [""] * len(args.images)
    panels = []
    for path, label in zip(args.images, labels):
        im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        if args.crop:
            x0, y0, x1, y1 = (float(v) for v in args.crop.split(","))
            im = im.crop((round(x0 * im.width), round(y0 * im.height),
                          round(x1 * im.width), round(y1 * im.height)))
        im = im.resize((round(im.width * args.height / im.height), args.height), Image.LANCZOS)
        if label:
            d = ImageDraw.Draw(im)
            d.rectangle((0, 0, 12 + 9 * len(label), 26), fill=(255, 255, 255))
            d.text((6, 6), label, fill=(200, 0, 0))
        panels.append(im)
    gap = 8
    sheet = Image.new("RGB", (sum(p.width for p in panels) + gap * (len(panels) - 1), args.height), (128, 128, 128))
    x = 0
    for p in panels:
        sheet.paste(p, (x, 0))
        x += p.width + gap
    sheet.save(args.out, quality=90)


if __name__ == "__main__":
    main()
