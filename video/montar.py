"""Monta el video final: cada escena = visual (placa PNG o grabación webm) + voz. 1080x1920, 30fps."""
import json, os, subprocess

BASE = os.path.dirname(os.path.abspath(__file__))
FF = os.path.expandvars(r"%LOCALAPPDATA%\ffmpeg\bin\ffmpeg.exe")
FFP = os.path.expandvars(r"%LOCALAPPDATA%\ffmpeg\bin\ffprobe.exe")
ESC = os.path.join(BASE, "escenas")
VOZ = os.path.join(BASE, "voz")
TMP = os.path.join(BASE, "tmp")
os.makedirs(TMP, exist_ok=True)

tiempos = {e["id"]: e["duracion"] for e in json.load(open(os.path.join(BASE, "guion_tiempos.json"), encoding="utf-8"))}


def run(args):
    subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error", *args], check=True)


def duracion(p):
    return float(subprocess.check_output([FFP, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", p]).decode().strip())


# Cada segmento: (archivo salida, visual, tipo, [audios en orden], duración objetivo)
# El visual se estira/recorta a la duración de la voz; los videos largos se aceleran suave si hace falta.
segmentos = [
    ("s01", "01_golpe.png", "img", ["01_golpe"], None),
    ("s02", "02_problema.png", "img", ["02_problema"], None),
    ("s03", "03_solucion.webm", "vid", ["03_solucion"], None),
    ("s04", "04_05_resultado_canal.webm", "vid", ["04_resultado", "05_canal"], None),
    ("s06", "06_audio.webm", "vid", ["06_audio"], None),
    ("s07", "07_verde.webm", "vid", ["07_verde"], None),
    ("s08", "08_cierre.png", "img", ["08_cierre"], None),
]

# La voz de 07 se reparte: los primeros 6s suenan sobre la placa, el resto sobre el video.
# Para simplificar: placa 07a lleva la primera parte del audio 07 y el video 07b el resto.
partes = []
for nombre, visual, tipo, audios, dur_fija in segmentos:
    out = os.path.join(TMP, f"{nombre}.mp4")
    if audios:
        # concatenar audios de la escena
        alist = os.path.join(TMP, f"{nombre}_a.txt")
        with open(alist, "w", encoding="utf-8") as f:
            for a in audios:
                f.write(f"file '{os.path.join(VOZ, a + '.mp3').replace(os.sep, '/')}'\n")
        audio = os.path.join(TMP, f"{nombre}.mp3")
        run(["-f", "concat", "-safe", "0", "-i", alist, "-c", "copy", audio])
        dur = duracion(audio) + 0.6  # respiro al final
    else:
        audio = None
        dur = dur_fija

    vis = os.path.join(ESC, visual)
    if tipo == "img":
        # Ken Burns muy sutil (zoom 1.00 → 1.04)
        frames = int(dur * 30)
        vf = (f"scale=1080:1920,zoompan=z='min(1.0+0.04*on/{frames},1.04)':d={frames}:s=1080x1920:fps=30,"
              "format=yuv420p")
        vin = ["-loop", "1", "-framerate", "30", "-i", vis]
    else:
        vdur = duracion(vis)
        # ajustar velocidad del video a la duración de la voz (setpts), máximo 1.6x más rápido o lento
        factor = max(0.6, min(1.6, dur / vdur))
        # la grabación viene con el contenido en la mitad superior izquierda (540x960 dentro de 1080x1920): recortar y escalar
        vf = f"setpts={factor}*PTS,crop=540:960:0:0,scale=1080:1920:flags=lanczos,fps=30,format=yuv420p"
        vin = ["-i", vis]

    args = [*vin]
    if audio:
        args += ["-i", audio]
    args += ["-vf", vf, "-t", f"{dur:.2f}"]
    if audio:
        args += ["-c:a", "aac", "-b:a", "160k", "-af", "apad", "-shortest"]
    else:
        args += ["-an"]
    args += ["-c:v", "libx264", "-preset", "medium", "-crf", "20", "-r", "30", "-pix_fmt", "yuv420p", out]
    run(args)
    partes.append(out)
    print(f"{nombre}: {dur:.1f}s")

# concatenar todo con re-encode para uniformar
lista = os.path.join(TMP, "lista.txt")
with open(lista, "w", encoding="utf-8") as f:
    for p in partes:
        f.write(f"file '{p.replace(os.sep, '/')}'\n")
final_sin_musica = os.path.join(TMP, "final_sin_musica.mp4")
run(["-f", "concat", "-safe", "0", "-i", lista, "-c:v", "libx264", "-crf", "20", "-preset", "medium",
     "-c:a", "aac", "-b:a", "160k", "-pix_fmt", "yuv420p", final_sin_musica])

# música de fondo suave generada (pad sintético, muy bajo volumen) para que no quede seco
total = duracion(final_sin_musica)
musica = os.path.join(TMP, "musica.wav")
run(["-f", "lavfi", "-i", f"sine=frequency=110:duration={total}", "-f", "lavfi", "-i", f"sine=frequency=165:duration={total}",
     "-filter_complex", "[0:a][1:a]amix=inputs=2,lowpass=f=400,volume=0.06,afade=t=in:d=2,afade=t=out:st=" + f"{total-3:.1f}" + ":d=3", musica])
FINAL = os.path.join(BASE, "es-oficial-video.mp4")
run(["-i", final_sin_musica, "-i", musica, "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=2[a]",
     "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", FINAL])
print(f"FINAL: {FINAL} ({duracion(FINAL):.1f}s)")
