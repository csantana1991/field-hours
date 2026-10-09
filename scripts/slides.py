"""Draw lecture slides and mux them with narration."""

import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path("/workspace")
JOBS = ROOT / "artifacts" / "lecture-jobs.json"
MEDIA = ROOT / "public" / "media"
SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
SERIF_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

PAPER = (243, 239, 230)
INK = (28, 25, 21)
MUTED = (92, 86, 78)
TEAL = (20, 94, 86)
BRASS = (138, 90, 50)
LINE = (221, 212, 198)


def media_duration(path: Path) -> float:
    proc = subprocess.run(["ffmpeg", "-i", str(path)], capture_output=True, text=True)
    match = re.search(r"Duration: (\d+):(\d+):(\d+(?:\.\d+)?)", proc.stderr)
    if not match:
        raise RuntimeError(proc.stderr[-500:])
    hours, minutes, seconds = match.groups()
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


def font(path, size):
    return ImageFont.truetype(path, size)


def wrap(draw, text, face, width):
    words = text.split()
    lines, line = [], ""
    for word in words:
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=face) > width and line:
            lines.append(line)
            line = word
        else:
            line = trial
    if line:
        lines.append(line)
    return lines


def slide(job, spec, index, total):
    image = Image.new("RGB", (1280, 720), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 1280, 10), fill=TEAL)
    kicker = font(SANS, 22)
    title = font(SERIF_BOLD, 48)
    body = font(SERIF, 32)
    small = font(SANS, 20)
    draw.text((72, 48), spec["kicker"].upper(), fill=BRASS, font=kicker)
    y = 96
    for line in wrap(draw, spec["title"], title, 1100)[:2]:
        draw.text((72, y), line, fill=INK, font=title)
        y += 58
    y += 16
    draw.line((72, y, 520, y), fill=LINE, width=2)
    y += 28
    for raw in spec["lines"]:
        for line in wrap(draw, raw, body, 1100)[:3]:
            draw.text((72, y), line, fill=INK, font=body)
            y += 44
        y += 8
        if y > 620:
            break
    footer = f"{job['code']}  ·  {index + 1} / {total}  ·  Field Hours"
    draw.text((72, 670), footer, fill=MUTED, font=small)
    return image


def build(job):
    slug = job["slug"]
    folder = ROOT / "artifacts" / "slides" / slug
    folder.mkdir(parents=True, exist_ok=True)
    frames = [slide(job, spec, i, len(job["slides"])) for i, spec in enumerate(job["slides"])]
    frames[0].save(MEDIA / f"{slug}.png")
    for i, frame in enumerate(frames):
        frame.save(folder / f"{i:02d}.png")
    audio = ROOT / "artifacts" / "audio" / f"{slug}.mp3"
    if not audio.exists():
        print(f"no audio {slug}")
        return
    probe = media_duration(audio)
    duration = probe
    each = duration / len(frames)
    concat = folder / "list.txt"
    lines = []
    for i in range(len(frames)):
        lines.append(f"file '{folder / f'{i:02d}.png'}'")
        lines.append(f"duration {each:.3f}")
    lines.append(f"file '{folder / f'{len(frames) - 1:02d}.png'}'")
    concat.write_text("\n".join(lines) + "\n")
    out = MEDIA / f"{slug}.mp4"
    subprocess.check_call(
        [
            "ffmpeg", "-y",
            "-f", "concat", "-safe", "0", "-i", str(concat),
            "-i", str(audio),
            "-vf", "fps=30,format=yuv420p",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
            "-c:a", "aac", "-b:a", "128k",
            "-shortest", "-movflags", "+faststart",
            str(out),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    print(f"video {out} {out.stat().st_size}")


def main():
    jobs = json.loads(JOBS.read_text())
    MEDIA.mkdir(parents=True, exist_ok=True)
    only = sys.argv[1:] 
    for job in jobs:
        if only and job["slug"] not in only:
            continue
        build(job)


if __name__ == "__main__":
    main()
