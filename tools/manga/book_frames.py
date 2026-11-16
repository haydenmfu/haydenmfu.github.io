"""Plain shaded frames of a sketchbook opening, for pencil.py to draw.

A tiny software renderer (boxes, z-buffer, one light). The book has four ribbon markers,
each at its own place in the pages. For every ribbon it writes one animation: the book
opens at that ribbon's place, the ribbon is found lying in the gutter, and the camera moves
from a three-quarter view to straight above the open spread. Ribbons that mark earlier
pages are carried over with the pages that turn.

Writes <ribbon>_fNN.png frames and frames.json, which holds the outline of every visible
piece of every ribbon in every frame, so the page can lay colour exactly over the drawing.

  python book_frames.py OUT_DIR [--frames 22]
  python pencil.py OUT_DIR OUT_DIR/pencil --steady --fixed-levels --skin 0 --color-edges 0
"""
import argparse
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

FW, FH, SS = 1600, 1000, 2          # frame size and supersampling
W, H, T = 15.0, 21.0, 2.6           # page width, page height, book thickness
BOARD, OVER, SPINE = 0.24, 0.38, 0.3
LIGHT = np.array([-0.50, 0.42, 0.76]) / np.linalg.norm([-0.50, 0.42, 0.76])
LABEL = (2.6, 11.4, 12.4, 16.6)     # x0, y0, x1, y1 on the front cover
RIBBONS = [  # exit x, end point (x, y), bend, name, how far through the book it marks
    (3.4, (-2.6, -7.4), -2.0, "about", 0.22),
    (6.2, (4.4, -9.3), 1.6, "projects", 0.42),
    (8.8, (10.8, -6.7), -1.1, "research", 0.60),   # shorter than its neighbours: its label has to clear the prompt at the foot of the cover
    (11.4, (17.8, -6.8), 2.2, "resume", 0.80),
]
LEVEL = [BOARD + (T - 2 * BOARD) * (1 - r[4]) for r in RIBBONS]   # height of each ribbon's page
RIBBON_W = 0.62


def ease(t):
    t = np.clip(t, 0, 1)
    return t * t * t * (t * (6 * t - 15) + 10)


def label_texture():
    tex = Image.new("L", (900, 480), 250)   # blank: the page sets the name in type over it
    ImageDraw.Draw(tex).rectangle((18, 18, 881, 461), outline=70, width=5)
    return np.asarray(tex).astype(np.float32) / 255


class Scene:
    DIST0, SHIFT = 100.0, (0.0, 0.0)   # opening shot: camera distance and picture shift, set by compose()

    def __init__(self, t, texture, chosen):
        self.texture, self.chosen, self.h = texture, chosen, LEVEL[chosen]
        self.theta = np.pi * ease(t / 0.82)
        # the turned pages come to rest on the table, so the hinge rises or sinks as they go over
        self.lift = (T - 2 * self.h) * (1 - np.cos(self.theta)) / 2
        self.top = max(self.h, T - self.h)
        s = ease((t - 0.12) / 0.88)
        self.f = 2.6 * FW * SS
        target = (1 - s) * np.array([8.4, 6.3, 0.0]) + s * np.array([0, H / 2, self.top])
        az, el = np.deg2rad(15 * (1 - s)), np.deg2rad(37 + 53 * s)
        dist = self.DIST0 * (1 - s) + (2 * (W + OVER) * 2.6 / 1.03) * s
        self.pos = target + dist * np.array([np.sin(az) * np.cos(el), -np.cos(az) * np.cos(el), np.sin(el)])
        up = np.array([0, s, 1 - s]) / np.hypot(s, 1 - s)
        self.fwd = (target - self.pos) / np.linalg.norm(target - self.pos)
        self.right = np.cross(self.fwd, up)
        self.right /= np.linalg.norm(self.right)
        self.up = np.cross(self.right, self.fwd)
        self.cx = FW * SS / 2 + self.SHIFT[0] * SS * (1 - s)
        self.cy = FH * SS / 2 + self.SHIFT[1] * SS * (1 - s)
        h, w = FH * SS, FW * SS
        self.img = np.ones((h, w), np.float32)
        self.zbuf = np.full((h, w), np.inf, np.float32)
        self.shadow = np.zeros((h, w), np.uint8)

    def swing(self, p, inverse=False, ground=False):
        """Turn points with the pages (about the hinge), or flat over the table (ground=True)."""
        a = -self.theta if inverse else self.theta
        pivot, lift = (0.0, 0.0) if ground else (self.h, self.lift)
        out = np.array(p, dtype=np.float64)
        x, z = out[..., 0].copy(), out[..., 2] - pivot - (lift if inverse else 0)
        out[..., 0] = x * np.cos(a) - z * np.sin(a)
        out[..., 2] = x * np.sin(a) + z * np.cos(a) + pivot + (0 if inverse else lift)
        return out

    def project(self, p):
        q = p - self.pos
        z = q @ self.fwd
        return np.stack([self.cx + self.f * (q @ self.right) / z, self.cy - self.f * (q @ self.up) / z], -1)

    def quad(self, pts, shade, moving=False):
        """Draw one flat quad (world points, counter-clockwise seen from outside)."""
        n = np.cross(pts[1] - pts[0], pts[3] - pts[0])
        if np.linalg.norm(n) < 1e-9:
            return
        n /= np.linalg.norm(n)
        if n @ (self.pos - pts.mean(0)) <= 0:
            return
        mask = np.zeros(self.img.shape, np.uint8)
        cv2.fillConvexPoly(mask, np.round(self.project(pts)).astype(np.int32), 1)
        ys, xs = np.nonzero(mask)
        if len(ys) == 0:
            return
        ray = self.fwd + np.outer((xs - self.cx) / self.f, self.right) - np.outer((ys - self.cy) / self.f, self.up)
        depth = (n @ (pts[0] - self.pos)) / (ray @ n)
        near = depth < self.zbuf[ys, xs]
        ys, xs, depth, ray = ys[near], xs[near], depth[near], ray[near]
        hit = self.pos + ray * depth[:, None]
        local = self.swing(hit, inverse=True) if moving else hit
        lit = 0.42 + 0.58 * max(n @ LIGHT, 0) / LIGHT[2]   # a face lying flat is fully lit
        self.img[ys, xs] = np.clip(shade(local) * lit, 0, 1)
        self.zbuf[ys, xs] = depth

    def box(self, lo, hi, shade, moving=False):
        x0, y0, z0 = lo
        x1, y1, z1 = hi
        c = np.array([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
                      [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], dtype=np.float64)
        if moving:
            c = self.swing(c)
        for f in ([4, 5, 6, 7], [3, 2, 1, 0], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [3, 0, 4, 7]):
            self.quad(c[f], shade, moving)
        g = c.copy()   # cast shadow: the corners slid along the light onto the ground
        g[:, :2] -= LIGHT[:2] / LIGHT[2] * g[:, 2:3]
        g[:, 2] = 0
        cv2.fillConvexPoly(self.shadow, cv2.convexHull(np.round(self.project(g)).astype(np.int32)), 1)

    def cover(self, p):
        x0, y0, x1, y1 = LABEL
        on_label = (p[:, 2] > T - 1e-3) & (p[:, 0] > x0) & (p[:, 0] < x1) & (p[:, 1] > y0) & (p[:, 1] < y1)
        u = np.clip((p[:, 0] - x0) / (x1 - x0) * self.texture.shape[1], 0, self.texture.shape[1] - 1).astype(int)
        v = np.clip((y1 - p[:, 1]) / (y1 - y0) * self.texture.shape[0], 0, self.texture.shape[0] - 1).astype(int)
        return np.where(on_label, self.texture[v, u], 0.20)

    def pages(self, p):
        inner = np.abs(p[:, 2] - self.h) < 1e-3                     # the two facing pages
        gutter = 1 - 0.22 * np.exp(-(p[:, 0] / 0.4) ** 2) - 0.05 * np.exp(-(p[:, 0] / 2.0) ** 2)
        leaves = 0.93 - 0.16 * (np.sin(p[:, 2] * 46) > 0.55)        # edges of the stacked sheets
        return np.where(inner, 0.99 * gutter, leaves)

    def ribbon_strips(self):
        """Centre line and half-width vector of every ribbon, in world space for this frame."""
        strips = []
        for i, (x, end, bend, name, _) in enumerate(RIBBONS):
            z, y_out, pts = LEVEL[i], -OVER - 0.04, []
            if i == self.chosen:   # lies in the gutter of the open spread, then crosses to where it leaves the foot
                pts += [(0.0, y, self.top + 0.03) for y in np.linspace(H - 0.3, 0.36 * H, 9)]
                for v in np.linspace(0, 1, 9)[1:]:
                    e = v * v * (3 - 2 * v)
                    pts.append((x * e, 0.36 * H * (1 - v), self.top + 0.03 + (z + 0.02 - self.top - 0.03) * e))
            n_in = len(pts)
            pts += [(x, -0.03, z), (x, -0.03, BOARD + 0.03), (x, y_out, BOARD + 0.03), (x, y_out, 0.02)]
            n_drop = len(pts)
            p0, p3 = np.array([x, y_out]), np.array(end)
            p1 = p0 + np.array([bend * 0.4, -abs(end[1]) * 0.45])
            p2 = p3 + np.array([-(end[0] - x) * 0.25 - bend, abs(end[1]) * 0.35])
            s = np.linspace(0, 1, 18)[1:, None]
            curve = (1 - s) ** 3 * p0 + 3 * (1 - s) ** 2 * s * p1 + 3 * (1 - s) * s ** 2 * p2 + s ** 3 * p3
            centre = np.array(pts + [(cx, cy, 0.02) for cx, cy in curve])
            tangent = np.gradient(centre[:, :2], axis=0)
            side = np.stack([-tangent[:, 1], tangent[:, 0], np.zeros(len(centre))], -1)
            side[n_in:n_drop] = (1, 0, 0)                           # hanging part lies flat against the book
            side /= np.linalg.norm(side, axis=1, keepdims=True)
            if i < self.chosen:   # marks an earlier page: carried over with the pages that turn
                w = np.ones(len(centre))
                w[n_drop:] = 1 - ease(s[:, 0] / 0.45)               # the far end trails over the table
                centre = w[:, None] * self.swing(centre) + (1 - w[:, None]) * self.swing(centre, ground=True)
                sx, sz = side[:, 0].copy(), side[:, 2].copy()
                side[:, 0] = sx * np.cos(self.theta) - sz * np.sin(self.theta)
                side[:, 2] = sx * np.sin(self.theta) + sz * np.cos(self.theta)
                centre[:, 2] = np.maximum(centre[:, 2], 0.02)
            strips.append((name, centre, side * RIBBON_W / 2))
        return strips

    def render(self):
        spine_top = T + (min(self.h, T - self.h) - 0.05 - T) * ease(self.theta / np.pi)   # the spine flattens
        self.box((-SPINE, -OVER, 0), (W + OVER, H + OVER, BOARD), self.cover)                    # back board
        self.box((-SPINE, -OVER, 0), (0, H + OVER, spine_top), self.cover)                       # spine
        self.box((0, 0, BOARD), (W, H, self.h), self.pages)                                      # leaves that stay
        self.box((0, 0, self.h), (W, H, T - BOARD), self.pages, moving=True)                     # leaves that turn
        self.box((0, -OVER, T - BOARD), (W + OVER, H + OVER, T), self.cover, moving=True)        # front board
        strips = self.ribbon_strips()
        for _, centre, half in strips:
            a, b = centre - half, centre + half
            for k in range(len(centre) - 1):
                for order in ([a[k], b[k], b[k + 1], a[k + 1]], [a[k + 1], b[k + 1], b[k], a[k]]):
                    self.quad(np.array(order), lambda p: np.full(len(p), 0.66))
        ribbons = []
        for name, centre, half in strips:   # which stretches of each ribbon can be seen in this frame
            a, b = self.project(centre - half) / SS, self.project(centre + half) / SS
            mid = (centre[:-1] + centre[1:]) / 2 + half[:-1] * 0.4
            px = np.round(self.project(mid)).astype(int)
            inside = (px[:, 0] >= 0) & (px[:, 0] < FW * SS) & (px[:, 1] >= 0) & (px[:, 1] < FH * SS)
            depth = (mid - self.pos) @ self.fwd
            seen = np.zeros(len(mid), bool)
            seen[inside] = depth[inside] <= self.zbuf[px[inside, 1], px[inside, 0]] + 0.2
            seen |= ~inside   # off the frame: nothing to judge, and nothing drawn there either
            parts, k = [], 0
            while k < len(seen):
                if not seen[k]:
                    k += 1
                    continue
                j = k
                while j + 1 < len(seen) and seen[j + 1]:
                    j += 1
                parts.append(np.round(np.concatenate([a[k:j + 2], b[k:j + 2][::-1]]), 1).tolist())
                k = j + 1
            ribbons.append({"name": name, "parts": parts,
                            "end": np.round(self.project(centre[-1]) / SS, 1).tolist()})
        soft = cv2.GaussianBlur(self.shadow.astype(np.float32), (0, 0), 9 * SS)
        ground = np.isinf(self.zbuf)
        self.img[ground] = 1 - 0.34 * soft[ground]
        small = cv2.resize(self.img, (FW, FH), interpolation=cv2.INTER_AREA)
        x0, y0, x1, y1 = LABEL
        corners = self.swing(np.array([[x0, y1, T], [x1, y1, T], [x1, y0, T], [x0, y0, T]]))
        label = {"quad": np.round(self.project(corners) / SS, 1).tolist(), "shown": bool(self.theta < 1.35)}
        return small, {"ribbons": ribbons, "label": label}


def compose(texture):
    """Bring the camera as close as it can come with the closed book in the middle of the frame
    and all four ribbons, and the labels set under their ends, still inside it."""
    for dist in np.arange(84.0, 130.0, 1.0):
        Scene.DIST0, Scene.SHIFT = dist, (0.0, 0.0)
        sc = Scene(0, texture, 0)
        corners = np.array([[x, y, z] for x in (-SPINE, W + OVER) for y in (-OVER, H + OVER) for z in (0, T)])
        pts = np.concatenate([sc.project(corners)] + [sc.project(c) for _, c, _ in sc.ribbon_strips()]) / SS
        lo, hi = pts.min(0), pts.max(0)
        book = sc.project(corners) / SS
        dx = FW / 2 - (book[:, 0].min() + book[:, 0].max()) / 2   # the book itself sits in the middle
        if lo[0] + dx >= 50 and hi[0] + dx <= FW - 50 and hi[1] - lo[1] <= FH - 120:
            Scene.SHIFT = (dx, FH / 2 - 22 - (lo[1] + hi[1]) / 2)
            return
    raise SystemExit("the book does not fit the frame")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out_dir", type=Path)
    ap.add_argument("--frames", type=int, default=22)
    ap.add_argument("--only", default="", help="render only this ribbon's animation")
    args = ap.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    texture = label_texture()
    compose(texture)
    print(f"opening shot: distance {Scene.DIST0:.0f}, shift {Scene.SHIFT[0]:.0f}, {Scene.SHIFT[1]:.0f}")
    anims = {}
    for c, r in enumerate(RIBBONS):
        if args.only and args.only != r[3]:
            continue
        anims[r[3]] = []
        for i in range(args.frames):
            img, meta = Scene(i / (args.frames - 1), texture, c).render()
            Image.fromarray((img * 255 + 0.5).astype(np.uint8)).convert("RGB").save(args.out_dir / f"{r[3]}_f{i:02d}.png")
            anims[r[3]].append(meta)
    final_px = RIBBON_W * 2.6 * FW / (2 * (W + OVER) * 2.6 / 1.03)   # ribbon width in the last frame, in frame pixels
    (args.out_dir / "frames.json").write_text(json.dumps({
        "size": [FW, FH], "order": [r[3] for r in RIBBONS], "ribbonPx": round(final_px, 2), "anims": anims}))
    print(f"{len(anims)} animations x {args.frames} frames -> {args.out_dir}")


if __name__ == "__main__":
    main()
