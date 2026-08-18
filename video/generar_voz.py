"""Genera la voz en off de cada escena con edge-tts (voz argentina neural)."""
import asyncio, json, os, subprocess, sys

import edge_tts

BASE = os.path.dirname(os.path.abspath(__file__))
VOZ = sys.argv[1] if len(sys.argv) > 1 else "es-AR-TomasNeural"
FFPROBE = os.path.expandvars(r"%LOCALAPPDATA%\ffmpeg\bin\ffprobe.exe")


async def main():
    with open(os.path.join(BASE, "guion.json"), encoding="utf-8") as f:
        escenas = json.load(f)
    out_dir = os.path.join(BASE, "voz")
    os.makedirs(out_dir, exist_ok=True)
    total = 0.0
    for e in escenas:
        out = os.path.join(out_dir, f"{e['id']}.mp3")
        tts = edge_tts.Communicate(e["texto"], VOZ, rate="+4%")
        await tts.save(out)
        dur = float(
            subprocess.check_output(
                [FFPROBE, "-v", "error", "-show_entries", "format=duration",
                 "-of", "default=nw=1:nk=1", out]
            ).decode().strip()
        )
        e["duracion"] = round(dur, 2)
        total += dur
        print(f"{e['id']}: {dur:.1f}s")
    print(f"TOTAL: {total:.1f}s")
    with open(os.path.join(BASE, "guion_tiempos.json"), "w", encoding="utf-8") as f:
        json.dump(escenas, f, ensure_ascii=False, indent=2)


asyncio.run(main())
