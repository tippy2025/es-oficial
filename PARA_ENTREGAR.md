# Entrega — CoderCup AI 2026

**Cierra:** domingo 23/8/2026, 23:59 hora México.
**Formulario:** https://tally.so/r/VLXVRJ
**Ganadores:** 27/8/2026 · 🏆 USD 700 + curso · 🥈 USD 300 + curso · 🥉 una carrera

---

## Los cinco campos, listos para pegar

### 1. Nombre y apellido
```
Juan Manuel Sonenblum
```

### 2. Email
```
sonenblumjuanma@gmail.com
```

### 3. Link al proyecto
```
https://es-oficial.vercel.app
```

### 4. Link del video
```
https://es-oficial.vercel.app/demo
```

### 5. Descripción del problema y cómo lo resolvés

**Ojo con esto:** el formulario dice "mínimo 500 caracteres" pero además tiene un
**máximo de 800** que no está escrito en ninguna parte. Si pegás algo más largo,
te rechaza el envío. El texto de abajo tiene **766 caracteres**, justo adentro.

```
9 de cada 10 adultos mayores en Argentina recibió un intento de estafa digital; este mes ANSES sacó una alerta oficial. El problema no es solo «no sé si esto es falso»: es «no sé a quién preguntarle».

¿Es Oficial? es una app web: pegás el mensaje, la captura o la nota de voz y en segundos te da un semáforo de riesgo, las señales que detectó y qué hacer, en pasos. Lo que la distingue es el final: te muestra el teléfono oficial verificado de ese organismo, de un directorio propio, no inventado por la IA, para que llames vos.

También analiza audios: hoy se clona una voz con 30 segundos y la estafa del «hijo con número nuevo» ya llega hablada.

La probé contra 71 casos reales: 71/71. Next.js + Vercel + Claude, con Gemini de respaldo. Gratis y no guarda nada.
```

---

## El formulario ya está cargado

Los cinco campos quedaron completados en el panel del navegador de esta sesión,
a un clic de **Enviar**. Verificá de un vistazo que estén los cinco y dale.

Si el navegador se recargó y quedó vacío, abrí https://tally.so/r/VLXVRJ y pegá
los valores de arriba: son los mismos.

---

## Antes de tocar "Enviar", chequeá que anden (30 segundos)

1. Abrí https://es-oficial.vercel.app en el celular y tocá **"Soy de PAMI"** → **Analizar mensaje**. Tiene que dar rojo con el teléfono 138.
2. Abrí https://es-oficial.vercel.app/demo y dale play. Tiene que verse y oírse.

Los dos links son públicos y no piden login (el formulario aclara que si no son públicos descartan la entrega).

---

## Opcional: post en LinkedIn

Suma puntos según las bases (con #CoderCup y arroba a @coderhouse). Texto listo:

> Nueve de cada diez adultos mayores en Argentina recibió un intento de estafa digital. Este mes ANSES tuvo que sacar una alerta oficial.
>
> Para la CoderCup AI de CoderHouse construí **¿Es Oficial?**: pegás el mensaje raro, la captura o la nota de voz, y te dice si tiene señales de estafa, qué hacer, y —esto es lo importante— **con qué teléfono oficial verificar**.
>
> Porque el problema no es solo "no sé si esto es falso". Es "no sé a quién preguntarle".
>
> También analiza audios: hoy se clona una voz con 30 segundos sacados de Instagram, y la estafa del "hijo con número nuevo" ya llega hablada.
>
> La probé contra 71 casos reales de estafas argentinas y mensajes legítimos: 71 de 71.
>
> Gratis, sin registro, no guarda nada 👉 es-oficial.vercel.app
>
> #CoderCup @coderhouse

Subí el video (`video/es-oficial-video.mp4`) directo a LinkedIn en vez de poner el link: el video nativo llega a mucha más gente.

---

## Qué hay en cada link

| Link | Qué es |
|---|---|
| https://es-oficial.vercel.app | La app funcionando |
| https://es-oficial.vercel.app/demo | El video de 1:39 + accesos a la app y al código |
| https://github.com/tippy2025/es-oficial | El código |

## Si te preguntan por los audios en iPhone

Se puede, con un paso más. Apple **no permite** dos cosas en el navegador, y no
hay forma de esquivarlas:

1. Que una app web aparezca en el menú Compartir del sistema (Safari no
   implementa Web Share Target). En Android sí funciona: Compartir → ¿Es Oficial?
   y se analiza solo.
2. Grabar con el micrófono el audio que suena en ese mismo teléfono, porque al
   cambiar de app la grabación se corta.

**La ruta que sí anda en iPhone:** mantené apretada la nota de voz en WhatsApp →
Compartir → **Guardar en Archivos** → abrís la app → **Nota de voz** → la buscás.
La app te muestra esos pasos sola cuando detecta que estás en iPhone.

**Grabar** queda para lo que suena en otro aparato: una llamada en altavoz, o el
audio reproducido desde otro celular o la computadora. Ahí sí funciona en los dos
sistemas, y mientras grabás ves las barras de volumen moverse.

---

## Estado verificado el 22/8/2026

- Suite de 71 casos reales contra producción: **71/71 (100%)**
- Auditoría de diseño en pantalla de celular: sin solapes, sin desbordes, márgenes parejos
- Legibilidad para adultos mayores: texto de lectura en 17–19px y contraste 8:1
  (lo mínimo cómodo es 7:1). Solo quedan en 15–16px cuatro etiquetas cortas de
  sección, blanco sobre color pleno.
- Nota de voz compartida desde el sistema (Android): analiza sola, correcto
- Grabación con micrófono: detecta sonido y detecta silencio, correcto
- Saneador de teléfonos: 19/19
- Latencia promedio: ~5 segundos por análisis
