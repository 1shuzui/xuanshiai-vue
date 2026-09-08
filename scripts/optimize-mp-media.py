"""Rebuild packaged media from the original Git images, never from a lossy copy.

Run in a tool environment: uv run --with pillow==12.3.0 python scripts/optimize-mp-media.py.
The generated manifest records the source revision, hashes and encoder settings.
"""

import argparse
import hashlib
import json
import subprocess
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps, __version__ as pillow_version


ROOT = Path(__file__).resolve().parent.parent
SOURCE_REVISION = "6a3e659de0e2327ff041f913705944a326f8fe4e"


def git_bytes(revision, source):
    return subprocess.check_output(["git", "-C", str(ROOT), "show", f"{revision}:{source}"])


def recipe(source):
    name = Path(source).name
    if name.startswith("moxiang-master-"):
        return f"pagesSub/profileExtra/static/master/{Path(name).stem}.webp", "WEBP", 320, {"quality": 84, "method": 6}
    if "generated/" in source:
        return str(Path(source).with_suffix(".webp")).replace("\\", "/"), "WEBP", 1284, {"quality": 84, "method": 6}
    if "poster-templates/" in source:
        return f"pagesSub/profileExtra/static/poster-templates/{Path(name).stem}.webp", "WEBP", None, {"lossless": True, "exact": True, "method": 6}
    if "cases/" in source:
        return f"pagesSub/matchmaker/static/cases/{name}", "JPEG", 960, {"quality": 84, "optimize": True, "progressive": True}
    if name == "custom-matchmaker-hero.jpg":
        return f"pagesSub/matchmaker/static/{name}", "JPEG", 960, {"quality": 84, "optimize": True, "progressive": True}
    if "portraits/" in source:
        return source, "JPEG", 1152, {"quality": 80, "optimize": True, "progressive": True}
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-revision", default=SOURCE_REVISION)
    args = parser.parse_args()
    revision = subprocess.check_output(["git", "-C", str(ROOT), "rev-parse", args.source_revision], text=True).strip()
    names = subprocess.check_output(["git", "-C", str(ROOT), "ls-tree", "-r", "--name-only", revision, "static"], text=True).splitlines()
    entries = []
    for source in names:
        if Path(source).suffix.lower() not in {".png", ".jpg", ".jpeg"}:
            continue
        settings = recipe(source)
        if settings is None:
            continue
        target, image_format, max_edge, options = settings
        original = git_bytes(revision, source)
        with Image.open(BytesIO(original)) as source_image:
            image = ImageOps.exif_transpose(source_image)
            if max_edge is not None:
                image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
            if image_format == "JPEG":
                image = image.convert("RGB")
            output = BytesIO()
            image.save(output, image_format, **options)
            encoded = output.getvalue()
            kept_original = target.endswith(".jpg") and len(encoded) >= len(original)
            if kept_original:
                encoded = original
            with Image.open(BytesIO(encoded)) as packaged_image:
                size = list(packaged_image.size)
        if len(encoded) > 204800:
            raise ValueError(f"Media exceeds 200 KiB: {target}")
        destination = (ROOT / target).resolve()
        destination.relative_to(ROOT)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(encoded)
        if source != target:
            old_file = (ROOT / source).resolve()
            old_file.relative_to(ROOT)
            old_file.unlink(missing_ok=True)
        entries.append({
            "source": source, "path": target,
            "sourceSha256": hashlib.sha256(original).hexdigest(),
            "sha256": hashlib.sha256(encoded).hexdigest(),
            "originalBytes": len(original), "bytes": len(encoded),
            "size": size, "format": image_format, "maxEdge": max_edge,
            "encoderOptions": options, "keptOriginal": kept_original,
        })
        print(f"{target}: {len(original) / 1024:.1f} -> {len(encoded) / 1024:.1f} KiB")
    manifest = {"sourceRevision": revision, "encoder": f"Pillow {pillow_version}", "assets": entries}
    (ROOT / "scripts/mp-media-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
