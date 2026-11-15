"""Learned line-art extraction (informative-drawings generator, lllyasviel/Annotators weights).

The network is fully convolutional: every output pixel is computed from the same
location in the input, so it traces what is in the photo and cannot add or move content.
"""
import cv2
import numpy as np
import torch
import torch.nn as nn
from huggingface_hub import hf_hub_download

_norm = nn.InstanceNorm2d


class ResidualBlock(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.conv_block = nn.Sequential(
            nn.ReflectionPad2d(1), nn.Conv2d(c, c, 3), _norm(c), nn.ReLU(inplace=True),
            nn.ReflectionPad2d(1), nn.Conv2d(c, c, 3), _norm(c),
        )

    def forward(self, x):
        return x + self.conv_block(x)


class Generator(nn.Module):
    def __init__(self, input_nc=3, output_nc=1, n_residual_blocks=3):
        super().__init__()
        self.model0 = nn.Sequential(
            nn.ReflectionPad2d(3), nn.Conv2d(input_nc, 64, 7), _norm(64), nn.ReLU(inplace=True))
        m1, i, o = [], 64, 128
        for _ in range(2):
            m1 += [nn.Conv2d(i, o, 3, stride=2, padding=1), _norm(o), nn.ReLU(inplace=True)]
            i, o = o, o * 2
        self.model1 = nn.Sequential(*m1)
        self.model2 = nn.Sequential(*[ResidualBlock(i) for _ in range(n_residual_blocks)])
        m3, o = [], i // 2
        for _ in range(2):
            m3 += [nn.ConvTranspose2d(i, o, 3, stride=2, padding=1, output_padding=1),
                   _norm(o), nn.ReLU(inplace=True)]
            i, o = o, o // 2
        self.model3 = nn.Sequential(*m3)
        self.model4 = nn.Sequential(nn.ReflectionPad2d(3), nn.Conv2d(64, output_nc, 7), nn.Sigmoid())

    def forward(self, x):
        return self.model4(self.model3(self.model2(self.model1(self.model0(x)))))


_cache = {}


def load(coarse=False, device="cuda"):
    key = (coarse, device)
    if key not in _cache:
        path = hf_hub_download("lllyasviel/Annotators", "sk_model2.pth" if coarse else "sk_model.pth")
        net = Generator()
        net.load_state_dict(torch.load(path, map_location="cpu", weights_only=True), strict=True)
        _cache[key] = net.eval().to(device)
    return _cache[key]


@torch.no_grad()
def extract(rgb, res=1024, coarse=False, device="cuda"):
    """rgb: HxWx3 uint8. Returns HxW float32, 1.0 = paper, 0.0 = ink, aligned to the input."""
    h, w = rgb.shape[:2]
    s = res / max(h, w)
    nh, nw = max(8, round(h * s / 8) * 8), max(8, round(w * s / 8) * 8)
    x = cv2.resize(rgb, (nw, nh), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC)
    t = torch.from_numpy(x).float().div(255).permute(2, 0, 1)[None].to(device)
    y = load(coarse, device)(t)[0, 0].clamp(0, 1).float().cpu().numpy()
    y = cv2.resize(y, (w, h), interpolation=cv2.INTER_AREA if nh > h else cv2.INTER_CUBIC)
    return np.clip(y, 0, 1)


def extract_multi(rgb, scales=(768, 1536), coarse=False, device="cuda"):
    """Darkest-wins merge across scales: low res gives bold contours, high res gives fine detail."""
    out = None
    for r in scales:
        y = extract(rgb, r, coarse, device)
        out = y if out is None else np.minimum(out, y)
    return out


def ink(lines, lo=0.25, hi=0.85, gamma=1.0):
    """Levels adjustment that turns the soft grey network output into inky strokes."""
    x = np.clip((lines - lo) / (hi - lo), 0, 1)
    return x ** gamma
