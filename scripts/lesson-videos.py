"""Spoken slide video for every lecture. Skips a file that already exists."""

import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path("/workspace")
JOBS = ROOT / "artifacts" / "lesson-jobs.json"
MEDIA = ROOT / "public" / "media"
AUDIO = ROOT / "artifacts" / "audio" / "lessons"
SLIDES = ROOT / "artifacts" / "slides" / "lessons"
SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
SERIF_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
VOICE = "en-US-GuyNeural"

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
        raise RuntimeError(proc.stderr[-400:])
    hours, minutes, seconds = match.groups()
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


def face(path, size):
    return ImageFont.truetype(path, size)


def wrap(draw, text, font, width):
    words = str(text).split()
    lines, line = [], ""
    for word in words:
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=font) > width and line:
            lines.append(line)
            line = word
        else:
            line = trial
    if line:
        lines.append(line)
    return lines


def draw_slide(job, spec, index, total):
    image = Image.new("RGB", (1280, 720), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 1280, 10), fill=TEAL)
    kicker = face(SANS, 22)
    title = face(SERIF_BOLD, 46)
    body = face(SERIF, 30)
    small = face(SANS, 20)
    draw.text((72, 48), spec["kicker"].upper(), fill=BRASS, font=kicker)
    y = 96
    for line in wrap(draw, spec["title"], title, 1100)[:3]:
        draw.text((72, y), line, fill=INK, font=title)
        y += 56
    y += 12
    draw.line((72, y, 520, y), fill=LINE, width=2)
    y += 24
    for raw in spec["lines"]:
        for line in wrap(draw, raw, body, 1100)[:4]:
            if y > 620:
                break
            draw.text((72, y), line, fill=INK, font=body)
            y += 42
        y += 8
    footer = f"{job['code']}  ·  lecture {job['index']}  ·  {index + 1} / {total}"
    draw.text((72, 670), footer, fill=MUTED, font=small)
    return image


def slides_for(job):
    lead = job["lead"]
    return [
        {"kicker": job["code"], "title": job["title"], "lines": [f"Lecture {job['index']}", job["course"]]},
        {"kicker": "The idea", "title": job["title"], "lines": [lead]},
        {"kicker": "On the board", "title": job["figureCaption"], "lines": job["figureLines"][:6]},
        {"kicker": "Worked", "title": job["exampleTitle"], "lines": job["steps"][:4]},
        {"kicker": "Then", "title": "Do the problems", "lines": ["The notes under the video are the full lecture.", "Work both problems before you mark it finished."]},
    ]


def speak(job):
    key = f"{job['slug']}-{job['id']}"
    audio = AUDIO / f"{key}.mp3"
    if audio.exists() and audio.stat().st_size > 1000:
        return key
    audio.parent.mkdir(parents=True, exist_ok=True)
    text = job["narration"].replace("\n", " ")
    subprocess.check_call(
        ["edge-tts", "--voice", VOICE, "--text", text, "--write-media", str(audio)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return key


def mux(job):
    key = f"{job['slug']}-{job['id']}"
    out = MEDIA / f"{key}.mp4"
    if out.exists() and out.stat().st_size > 10000:
        return f"skip {key}"
    audio = AUDIO / f"{key}.mp3"
    folder = SLIDES / key
    folder.mkdir(parents=True, exist_ok=True)
    frames = slides_for(job)
    images = [draw_slide(job, spec, i, len(frames)) for i, spec in enumerate(frames)]
    images[0].save(MEDIA / f"{key}.png")
    for i, image in enumerate(images):
        image.save(folder / f"{i:02d}.png")
    duration = media_duration(audio)
    each = duration / len(images)
    concat = folder / "list.txt"
    lines = []
    for i in range(len(images)):
        lines.append(f"file '{folder / f'{i:02d}.png'}'")
        lines.append(f"duration {each:.3f}")
    lines.append(f"file '{folder / f'{len(images) - 1:02d}.png'}'")
    concat.write_text("\n".join(lines) + "\n")
    subprocess.check_call(
        [
            "ffmpeg", "-y",
            "-f", "concat", "-safe", "0", "-i", str(concat),
            "-i", str(audio),
            "-vf", "fps=24,format=yuv420p",
            "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
            "-c:a", "aac", "-b:a", "96k",
            "-shortest", "-movflags", "+faststart",
            str(out),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return f"video {key} {out.stat().st_size}"


def main():
    jobs = json.loads(JOBS.read_text())
    MEDIA.mkdir(parents=True, exist_ok=True)
    pending_audio = [job for job in jobs if not (AUDIO / f"{job['slug']}-{job['id']}.mp3").exists()]
    print(f"jobs {len(jobs)} audio-left {len(pending_audio)}", flush=True)
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(speak, job) for job in pending_audio]
        done = 0
        for future in as_completed(futures):
            future.result()
            done += 1
            if done % 10 == 0:
                print(f"audio {done}/{len(pending_audio)}", flush=True)
    pending_video = [job for job in jobs if not (MEDIA / f"{job['slug']}-{job['id']}.mp4").exists()]
    print(f"video-left {len(pending_video)}", flush=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(mux, job) for job in pending_video]
        done = 0
        for future in as_completed(futures):
            print(future.result(), flush=True)
            done += 1
    have = list(MEDIA.glob("csce-*-l*.mp4"))
    print(f"done {len(have)}", flush=True)


if __name__ == "__main__":
    main()
