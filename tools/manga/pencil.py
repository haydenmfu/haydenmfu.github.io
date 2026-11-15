"""Photo -> pencil-shaded sketch. Fully deterministic, no generative model.

  lines   : the exact line tracing, drawn in soft graphite instead of ink
  shading : done the way it is done by hand, shape by shape. The image is split into shapes
            of roughly even tone, bounded by tone changes and by strong traced contours.
            Each shape is filled with its own set of straight, parallel strokes that stop at
            the shape's edge. Darker shapes get closer spacing, more pressure, and a second
            and third pass at other angles (cross-hatching). The lightest tones stay paper.
  faces   : skin is shaded the way a portrait is drawn, not like the background. A face's
            own skin tone counts as paper, so only its real shadows are toned, and those
            are put in softly. Needs the YuNet face detector next to this script:
            models/face_detection_yunet_2023mar.onnx (from github.com/opencv/opencv_zoo).
            Without it, or with --skin 0, faces are shaded like everything else.

  python pencil.py IN_DIR OUT_DIR [--shade 0.45] [--paper 0.26] [--edges 0..1] [--long-side 1600]

Outputs <name>__pencil.png (on white paper) and <name>__pencil_alpha.png (graphite on a
transparent background, for placing over any page colour).
"""
import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage import measure

import lineart
from mangafy import EXTS, despeckle, flatten, load_rgb, remove_islands, save

BAND_EDGES = (0.07, 0.30, 0.52, 0.76)  # relative darkness cuts; below the first is bare paper
FACE_MODEL = Path(__file__).resolve().parent / "models" / "face_detection_yunet_2023mar.onnx"


def rnd(*keys):
    """Repeatable pseudo-random floats in [0,1) from integer keys (arrays or scalars)."""
    h = np.uint64(0x9E3779B97F4A7C15)
    with np.errstate(over="ignore"):
        for k in keys:
            k = np.asarray(k).astype(np.int64).astype(np.uint64)
            h = (h ^ k) * np.uint64(0xBF58476D1CE4E5B9)
            h = (h ^ (h >> np.uint64(31))) * np.uint64(0x94D049BB133111EB)
        h = h ^ (h >> np.uint64(29))
    return (h >> np.uint64(40)).astype(np.float32) / np.float32(1 << 24)


def smooth(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def tone_darkness(rgb, shade, paper, mean_target, strength, stretch=True):
    """Darkness map, 0 = bare paper. Normalised so every asset lands at a similar, light
    overall weight regardless of how dark the photo was."""
    L = flatten(rgb, 0.5, strength)
    lo, hi = np.percentile(L, [1, 99.5]) if stretch else (0.0, 1.0)
    L = np.clip((L - lo) / max(hi - lo, 1e-3), 0, 1)
    d = np.clip((1 - L - paper) / (1 - paper), 0, 1)
    if d.mean() > mean_target:  # dim photo: lift it rather than hatch the whole page
        lo_g, hi_g = 1.0, 6.0
        for _ in range(20):
            g = (lo_g + hi_g) / 2
            lo_g, hi_g = (g, hi_g) if (d ** g).mean() > mean_target else (lo_g, g)
        d = d ** g
    return d.astype(np.float32), (d * shade).astype(np.float32)


def chroma(rgb):
    """The photo's two colour channels (a*: green-red, b*: blue-yellow; 0 = neutral grey) and
    its lightness, with texture and JPEG colour noise smoothed away but edges kept in place."""
    smooth_rgb = rgb
    for _ in range(3):
        smooth_rgb = cv2.bilateralFilter(smooth_rgb, d=9, sigmaColor=38, sigmaSpace=9)
    lab = cv2.cvtColor(smooth_rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    return lab[..., 1] - 128, lab[..., 2] - 128, lab[..., 0] / 255.0


def find_faces(rgb, model):
    """Boxes (x, y, w, h) of the faces in the photo. Faces too small to matter are not found."""
    if not Path(model).exists():
        print(f"note: no face detector at {model}; faces are shaded like everything else", flush=True)
        return []
    h, w = rgb.shape[:2]
    s = 640 / max(h, w)
    small = cv2.resize(rgb, (round(w * s), round(h * s)), interpolation=cv2.INTER_AREA)
    det = cv2.FaceDetectorYN.create(str(model), "", (small.shape[1], small.shape[0]), 0.6, 0.3, 50)
    _, found = det.detect(cv2.cvtColor(small, cv2.COLOR_RGB2BGR))
    return [] if found is None else [tuple(int(round(v / s)) for v in f[:4]) for f in found]


def skin_of(face, ab, light, scale):
    """One person's skin: (region, skin). `skin` is everything coloured like the middle of
    their face and connected to it (face, ears, neck). `region` is the same area with the
    features inside it filled in (eyes, brows, lips), i.e. the whole face as one form.
    The colour is measured from this face, so no assumption is made about skin tone."""
    a, b = ab
    h, w = a.shape
    x, y, fw, fh = face
    core = (slice(max(y + 3 * fh // 10, 0), min(y + 3 * fh // 4, h)),
            slice(max(x + fw // 4, 0), min(x + 3 * fw // 4, w)))
    if a[core].size == 0:
        return None
    a0, b0, l0 = np.median(a[core]), np.median(b[core]), np.median(light[core])
    spread = np.median(np.hypot(a[core] - a0, b[core] - b0))
    near = (np.hypot(a - a0, b - b0) < np.clip(3.5 * spread, 7.0, 13.0)) & (light > 0.4 * l0)
    # stay around the head and neck, so a wall of a similar colour is never taken for skin
    box = np.zeros((h, w), bool)
    box[max(int(y - 0.45 * fh), 0):int(y + 1.6 * fh), max(int(x - 0.6 * fw), 0):int(x + 1.6 * fw)] = True

    def disc(px):
        d = int(px * scale) | 1
        return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (d, d))

    near = cv2.morphologyEx((near & box).astype(np.uint8), cv2.MORPH_OPEN, disc(5))
    lab = measure.label(near, connectivity=1)
    inside = np.bincount(lab[core].ravel())
    inside[0] = 0
    if inside.max() == 0:
        return None
    skin = lab == inside.argmax()
    region = ndimage.binary_fill_holes(cv2.morphologyEx(skin.astype(np.uint8), cv2.MORPH_CLOSE, disc(9)) > 0)
    return region, skin


def skin_tone(rel, region, skin, keep):
    """Shade a face relative to its own skin: the skin's usual tone becomes bare paper and only
    what is darker than that (shadows, and the features) carries tone. `keep` is the share of
    the skin left as paper."""
    base = float(np.percentile(rel[skin], 100 * keep)) + 0.03
    return np.where(region, np.clip((rel - base) / max(1 - base, 1e-3), 0, 1), rel).astype(np.float32)


def colour_lines(line, groups, ab, shaded, strength, scale, sure=None):
    """Firm up contours between areas of different colour that the tracing left soft, broken
    or missing (a cheek against grass: different colours, similar brightness).

    Along such a border it does two things: a faint line that is already there is drawn
    firmer, and stretches with no line at all get one. It is deliberately narrow:
      - only the border between two large colour areas, never around small objects
      - only where the colour changes abruptly, not where one tint drifts into another
      - only beside something that is shaded: two areas both left as bare paper (clouds in
        a pale sky) get no outline, since nothing there is merging
    """
    def disc(px):
        d = int(px * scale) | 1
        return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (d, d))

    border = cv2.morphologyEx(groups, cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8)) > 0
    step = np.maximum(*[cv2.dilate(ch, disc(9)) - cv2.erode(ch, disc(9)) for ch in ab])  # change across ~9 px
    beside_tone = cv2.dilate(shaded.astype(np.uint8), disc(9)) > 0
    abrupt = step > 11.0
    if sure is not None:  # the outline of a face is a known boundary: a smaller colour change will do
        abrupt |= (cv2.dilate(sure.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0) & (step > 8.0)
    cand = (border & abrupt & beside_tone).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(cand, connectivity=8)
    cand = np.isin(lab, np.flatnonzero(stats[:, cv2.CC_STAT_AREA] >= int(120 * scale))) & (lab > 0)

    # 1. a weak line already running along the border is pressed harder
    zone = cv2.dilate(cand.astype(np.uint8), disc(11)) > 0
    out = np.where(zone, line ** (1 + 1.6 * strength), line).astype(np.float32)
    # 2. where the border has no visible line at all, draw one
    visible = cv2.dilate((line < 0.8).astype(np.uint8), disc(11)) > 0
    soft = cv2.GaussianBlur((cand & ~visible).astype(np.float32), (0, 0), 1.0 * scale)
    soft = np.clip(soft / 0.5, 0, 1) * np.clip(step / 16.0, 0.75, 1.0)  # bigger colour change, firmer line
    return np.minimum(out, 1 - np.clip(strength * 1.15, 0, 1) * soft)


def colour_groups(ab, light, k=6, merge=12.0):
    """Map of the photo's main colour families, so that areas of different colour are shaded
    as separate shapes even when they are equally dark. Near-grey and very dark areas have no
    reliable colour, so they all share one neutral family (0) rather than being split up."""
    a, b = ab
    neutral = (np.hypot(a, b) < 9.0) | (light < 0.18)
    pts = np.dstack([a, b])[::8, ::8].reshape(-1, 2)[~neutral[::8, ::8].ravel()].astype(np.float32)
    groups = np.zeros(a.shape, np.uint8)
    if len(pts) > 50 * k:
        cv2.setRNGSeed(0)
        crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 0.5)
        _, _, centres = cv2.kmeans(pts, k, None, crit, 3, cv2.KMEANS_PP_CENTERS)
        remap = np.arange(k)
        for i in range(k):  # near-identical families count as one (no chaining through a third)
            for j in range(i):
                if remap[j] == j and np.linalg.norm(centres[i] - centres[j]) < merge:
                    remap[i] = j
                    break
        dist = (a[..., None] - centres[:, 0]) ** 2 + (b[..., None] - centres[:, 1]) ** 2
        groups = np.where(neutral, 0, remap[np.argmin(dist, axis=-1)] + 1).astype(np.uint8)
    return absorb_small(cv2.medianBlur(groups, 7), int(0.0025 * a.size))


def absorb_small(labels, min_area):
    """Give every connected patch smaller than min_area the label of the nearest large one."""
    patch = measure.label(labels.astype(np.int32) + 1, connectivity=1)
    small = np.bincount(patch.ravel())[patch] < min_area
    if not small.any() or small.all():
        return labels
    iy, ix = ndimage.distance_transform_edt(small, return_distances=False, return_indices=True)
    return labels[iy, ix]


def shapes(rel, line, scale, edges=0.0, groups=None):
    """Label map of the shapes to shade (0 = paper).

    A shape is a connected area of one tone band and one colour family. Strong traced
    contours also divide shapes,
    so two objects of the same tone are shaded separately. Slivers that the contours cut off
    (strands of hair, window panes) are shaded together with the mass they belong to.
    """
    h, w = rel.shape
    bands = cv2.medianBlur(np.digitize(rel, BAND_EDGES).astype(np.uint8), 5)
    bands = remove_islands(bands, len(BAND_EDGES) + 1, int(0.0003 * h * w))
    key = bands.astype(np.int32)
    if groups is not None:  # same tone but a different colour is a different shape
        key = np.where(bands > 0, bands.astype(np.int32) * 16 + groups + 1, 0)
    mass = measure.label(key, background=0, connectivity=1)
    # long confident strokes only; higher edge sensitivity admits shorter and fainter ones
    contour = despeckle(line, int(140 * (1 - 0.5 * edges) * scale * scale)) < 0.45 + 0.25 * edges
    cut = key.copy()
    cut[contour] = 0
    piece = measure.label(cut, background=0, connectivity=1)
    sliver = np.bincount(piece.ravel())[piece] < int(0.0006 * h * w)
    labels = np.where((piece == 0) | sliver, mass + piece.max() + 1, piece)
    labels[bands == 0] = 0
    return labels


def stroke_pass(xx, yy, labels, pass_id, theta, spacing, pressure, length, sigma, patch):
    """One pass of hatching: for every shape, rows of straight strokes laid side by side.

    Each stroke is its own mark: it has a start and an end, presses in quickly and lifts off
    lighter, and is never quite parallel to or evenly spaced from its neighbours. Strokes are
    made in patches of a dozen or so, the way a hand works across an area; each patch sits at
    a slightly different angle and pressure from the one beside it.
    """
    th, s, ell = theta[labels], spacing[labels], length[labels]
    seed = labels.astype(np.int64) * 8 + pass_id
    c, sn = np.cos(th), np.sin(th)
    u = xx * c - yy * sn + 997 * rnd(seed, 11)   # along the stroke
    v = xx * sn + yy * c + 997 * rnd(seed, 12)   # across the strokes
    k0 = np.floor(v / s)
    fv0 = v / s - k0
    k0 = k0.astype(np.int64)
    patch_shift = rnd(seed, 14)
    out = np.zeros(labels.shape, np.float32)
    for dk in (-2, -1, 0, 1, 2):  # a stroke can reach into neighbouring rows' cells
        k, fv = k0 + dk, fv0 - dk
        centre = 0.5 + 0.42 * (rnd(seed, k, 1) - 0.5)
        offset = ell * rnd(seed, k, 2)  # every row starts somewhere else, so stroke ends never line up
        q = (u + offset) / ell
        m = np.floor(q)
        t = q - m                                   # 0..1 along this stroke
        m = m.astype(np.int64)
        pk = np.floor(k * s / patch + patch_shift).astype(np.int64)  # which patch this row is in
        patch_tilt = (rnd(seed, pk, m, 8) - 0.5) * 0.24              # about +-7 degrees
        patch_press = 0.78 + 0.44 * rnd(seed, pk, m, 9)
        tilt = (rnd(seed, k, m, 4) - 0.5) * 0.07 + patch_tilt
        dv = (fv - centre) * s - tilt * (t - 0.5) * ell - (rnd(seed, k, m, 7) - 0.5) * 0.2 * s
        cross = np.exp(-0.5 * (dv / sigma) ** 2)
        t_end = 0.84 + 0.16 * rnd(seed, k, m, 5)
        along = smooth(t / 0.06) * (1 - 0.45 * smooth((t - 0.45) / 0.55)) * smooth((t_end - t) / 0.04)
        weight = (0.7 + 0.5 * rnd(seed, k, m, 3)) * patch_press * (rnd(seed, k, m, 6) > 0.10)
        out = np.maximum(out, cross * along * weight)
    return out * pressure[labels]


def flow_angle(rgb, labels, n, default):
    """Where a shape has a clear grain (strands of hair, folds, boards), strokes follow it,
    as a hand would follow the form. Shapes without a clear grain keep the default diagonal."""
    g = cv2.GaussianBlur(cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32), (0, 0), 1.6)
    gx, gy = cv2.Sobel(g, cv2.CV_32F, 1, 0), cv2.Sobel(g, cv2.CV_32F, 0, 1)
    lab = labels.ravel()
    jxx = np.bincount(lab, weights=(gx * gx).ravel(), minlength=n)
    jyy = np.bincount(lab, weights=(gy * gy).ravel(), minlength=n)
    jxy = np.bincount(lab, weights=(gx * gy).ravel(), minlength=n)
    coherence = np.sqrt((jxx - jyy) ** 2 + 4 * jxy ** 2) / np.maximum(jxx + jyy, 1e-6)
    grain = -(0.5 * np.arctan2(2 * jxy, jxx - jyy) + np.pi / 2)   # direction the grain runs
    delta = (grain - default + np.pi / 2) % np.pi - np.pi / 2     # shortest turn from the default
    return default + delta * smooth((coherence - 0.22) / 0.28)


def hatch(rgb, d, labels, scale, angle, rng, groups=None, soft=None, steady=False):
    """Shade every shape: spacing, pressure and number of passes follow the shape's tone.
    Shapes inside `soft` (skin) are put in with finer, lighter strokes over more smudged
    tone, so they read as smooth shading rather than as hatching."""
    h, w = d.shape
    n = int(labels.max()) + 1
    ids = np.arange(n)
    count = np.maximum(np.bincount(labels.ravel(), minlength=n), 1)
    D = np.bincount(labels.ravel(), weights=d.ravel(), minlength=n) / count  # tone of each shape
    D[0] = 0
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    sigma = 1.0 * scale

    turn = 20 * (rnd(ids, 21) - 0.5) * (not steady)
    if groups is not None and not steady:  # each colour family leans its own way, so neighbours read apart
        family = np.zeros(n, np.int64)
        family[labels.ravel()] = groups.ravel()
        turn = turn + 70 * (rnd(family, 41) - 0.5)
    base = flow_angle(rgb, labels, n, np.deg2rad(angle + turn))
    gentle = np.zeros(n, np.float32)
    if soft is not None:
        gentle = (np.bincount(labels.ravel(), weights=soft.ravel(), minlength=n) / count > 0.5).astype(np.float32)
    passes = [
        (base,
         (8.5 - 5.0 * np.clip(D / 0.7, 0, 1) ** 0.8) * scale,
         (0.22 + 0.38 * D) * (D > 0.02),
         56),
        (base + np.deg2rad(38 + 24 * (rnd(ids, 22) - 0.5)),
         (8.0 - 4.2 * np.clip((D - 0.30) / 0.5, 0, 1)) * scale,
         (0.20 + 0.32 * D) * (D > 0.30),
         46),
        (base - np.deg2rad(30 + 10 * (rnd(ids, 23) - 0.5)),
         (6.0 - 2.5 * np.clip((D - 0.55) / 0.4, 0, 1)) * scale,
         (0.26 + 0.28 * D) * (D > 0.55),
         38),
    ]
    # within a shape, pressure eases off where the tone lightens, which gives soft gradients
    local = np.clip(0.55 + 0.45 * d / np.maximum(D[labels], 1e-3), 0.4, 1.35) * (labels > 0)
    # paper tooth: graphite catches on the grain, so a stroke is broken rather than solid
    tooth = cv2.GaussianBlur(rng.random((h, w)).astype(np.float32), (0, 0), 0.6 * scale)
    tooth = np.clip(1 + 0.42 * (tooth - tooth.mean()) / (tooth.std() + 1e-6), 0.25, 1.6)
    smudge = 0.28 + 0.44 * gentle[labels]
    keep = 1 - smudge * d * (labels > 0)  # smudged graphite under the strokes
    for i, (theta, spacing, pressure, length) in enumerate(passes):
        spacing, pressure = spacing * (1 - 0.30 * gentle), pressure * (1 - 0.66 * gentle)
        ell = (length * scale * (0.85 + 0.4 * rnd(ids, 30 + i))).astype(np.float32)
        ink = stroke_pass(xx, yy, labels, i, theta.astype(np.float32), spacing.astype(np.float32),
                          pressure.astype(np.float32), ell, sigma, 75 * scale)
        keep = keep * (1 - np.clip(ink * local * tooth, 0, 0.95))
    return 1 - keep


def paper_grain(h, w, rng):
    g = cv2.GaussianBlur(rng.random((h, w)).astype(np.float32), (0, 0), 0.8)
    g = (g - g.mean()) / (g.std() + 1e-6)
    return np.clip(1 + 0.16 * g, 0.5, 1.5)


def trace(rgb, args):
    """Line tracing. --edges raises sensitivity to faint edges: the photo is traced a second
    time after a local contrast boost, so low-contrast edges such as folds in dark cloth
    register, and fainter responses are kept instead of cut off.

    The second look is deliberately tuned for edges rather than texture: the boosted photo is
    smoothed first so pores, blemishes and fabric fuzz fade while real boundaries stay sharp,
    and only strokes of some length are accepted from it. Short marks still come through from
    the normal tracing, so eyes and small details are unaffected."""
    e = float(np.clip(args.edges, 0, 1))
    scales = [int(v) for v in args.line_scales.split(",")]
    scale = max(rgb.shape[:2]) / 1600
    base = lineart.ink(lineart.extract_multi(rgb, scales, device=args.device), args.line_lo, args.line_hi)
    line = despeckle(base, args.despeckle)
    if e > 0:
        lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
        lab[..., 0] = cv2.createCLAHE(clipLimit=1.0 + 3.0 * e, tileGridSize=(8, 8)).apply(lab[..., 0])
        boosted = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        for _ in range(2):
            boosted = cv2.bilateralFilter(boosted, d=9, sigmaColor=45, sigmaSpace=7)
        hi = args.line_hi + (0.97 - args.line_hi) * e
        extra = lineart.ink(lineart.extract_multi(boosted, scales, device=args.device), args.line_lo, hi)
        extra = despeckle(extra ** (1 + 0.5 * e), int(70 * scale * scale))  # long strokes only
        line = np.minimum(line, extra)
    return line


def render(rgb, args):
    h, w = rgb.shape[:2]
    rng = np.random.default_rng(args.seed)
    scale = max(h, w) / 1600
    grain = paper_grain(h, w, rng)

    line = trace(rgb, args)
    rel, _ = tone_darkness(rgb, args.shade, args.paper, args.mean_target, args.smooth, not args.fixed_levels)
    faces = find_faces(rgb, args.face_model) if args.skin > 0 else []
    groups, face, outline = None, np.zeros((h, w), bool), np.zeros((h, w), bool)
    if faces or args.color_edges > 0:
        a, b, light = chroma(rgb)
    for box in faces:
        found = skin_of(box, (a, b), light, scale)
        if found is not None:
            region, skin = found
            rel = skin_tone(rel, region, skin, float(np.clip(args.skin, 0, 0.95)))
            face |= region
    d = (rel * args.shade).astype(np.float32)
    if args.color_edges > 0:
        groups = colour_groups((a, b), light)
    if face.any():  # a face is always its own shape, whatever colour family it fell into
        groups = np.zeros((h, w), np.uint8) if groups is None else groups.copy()
        groups[face] = groups.max() + 1
        outline = cv2.morphologyEx(face.astype(np.uint8), cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8)) > 0
    if args.color_edges > 0:
        shaded = rel >= BAND_EDGES[0]
        line = colour_lines(line, groups, (a, b), shaded, args.color_edges, scale, outline)
    line_dark = (1 - line) ** 0.85 * args.line_weight

    labels = shapes(rel, line, scale, float(np.clip(args.edges, 0, 1)), groups)
    tone_dark = hatch(rgb, d, labels, scale, args.angle, rng, groups, face.astype(np.float32), args.steady)

    dark = 1 - (1 - tone_dark * grain) * (1 - line_dark * (0.85 + 0.15 * grain))
    return np.clip(dark, 0, 1), labels, face


def save_alpha(dark, path, graphite=(38, 38, 42)):
    rgba = np.zeros((*dark.shape, 4), np.uint8)
    rgba[..., :3] = graphite
    rgba[..., 3] = (np.clip(dark, 0, 1) * 255 + 0.5).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("in_dir", type=Path)
    ap.add_argument("out_dir", type=Path)
    ap.add_argument("--long-side", type=int, default=1600)
    ap.add_argument("--shade", type=float, default=0.45, help="overall shading strength, 0 = lines only")
    ap.add_argument("--paper", type=float, default=0.26, help="share of the light end left as bare paper")
    ap.add_argument("--mean-target", type=float, default=0.30, help="cap on average tone before lifting")
    ap.add_argument("--smooth", type=float, default=0.012, help="how much photo texture is flattened")
    ap.add_argument("--angle", type=float, default=50, help="typical hatching direction in degrees")
    ap.add_argument("--edges", type=float, default=0.0,
                    help="edge sensitivity, 0..1: higher traces fainter edges (and more texture)")
    ap.add_argument("--color-edges", type=float, default=0.7,
                    help="strength of contours drawn where colour changes, 0 = brightness only")
    ap.add_argument("--skin", type=float, default=0.6,
                    help="share of a face's skin left as bare paper; 0 = shade faces like everything else")
    ap.add_argument("--face-model", type=Path, default=FACE_MODEL)
    ap.add_argument("--steady", action="store_true",
                    help="same hatching direction in every shape; for frames of an animation")
    ap.add_argument("--fixed-levels", action="store_true",
                    help="do not stretch tones to the photo's own range; for frames of an animation")
    ap.add_argument("--line-weight", type=float, default=0.82)
    ap.add_argument("--line-lo", type=float, default=0.12)
    ap.add_argument("--line-hi", type=float, default=0.92)
    ap.add_argument("--line-scales", default="768,1536")
    ap.add_argument("--despeckle", type=int, default=14)
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--only", default="")
    ap.add_argument("--debug-shapes", action="store_true", help="also save a map of the shapes")
    ap.add_argument("--device", default="cuda")
    args = ap.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    for p in sorted(q for q in args.in_dir.iterdir() if q.suffix.lower() in EXTS and args.only in q.name):
        dark, labels, face = render(load_rgb(p, args.long_side), args)
        save(1 - dark, args.out_dir / f"{p.stem}__pencil.png")
        save_alpha(dark, args.out_dir / f"{p.stem}__pencil_alpha.png")
        if args.debug_shapes:
            hue = (rnd(labels, 1) * 179).astype(np.uint8)
            hsv = np.dstack([hue, np.full_like(hue, 150), np.full_like(hue, 235)])
            hsv[labels == 0] = (0, 0, 255)
            Image.fromarray(cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)).save(args.out_dir / f"{p.stem}__shapes.png")
            if face.any():
                save(1 - 0.6 * face, args.out_dir / f"{p.stem}__face.png")
        print(f"{p.name}: {len(np.unique(labels)) - 1} shapes, mean darkness {dark.mean():.3f}", flush=True)


if __name__ == "__main__":
    main()
