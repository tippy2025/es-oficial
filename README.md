# 🛡️ ¿Es Oficial?

**Antes de responder, preguntá.**

App web que analiza mensajes sospechosos (WhatsApp, SMS, mail) y devuelve en segundos un semáforo de riesgo de estafa, las señales concretas detectadas y qué hacer, anclado en una base curada de reglas sobre canales oficiales argentinos (PAMI, ANSES, bancos, billeteras).

Pensada para proteger a nuestros mayores: el 89% de los adultos mayores argentinos recibió intentos de estafa digital. El usuario típico es el hijo o la hija que recibe el "¿esto es verdad?" por WhatsApp — ahora tiene dónde reenviarlo.

Proyecto presentado a la **CoderCup AI 2026** de CoderHouse.

Acepta **texto, capturas de pantalla y notas de voz**: hoy alcanzan treinta segundos de audio para clonar la voz de un familiar, así que el audio también se analiza.

## Cómo funciona

1. Pegás el texto del mensaje, subís/pegás una captura, o mandás la nota de voz (grabándola o subiendo el archivo).
2. Si es audio, se transcribe primero (Gemini) y el texto pasa por el mismo motor de análisis.
3. La IA (Claude, con visión) lo analiza contra una base de reglas verificadas de canales oficiales argentinos y patrones de estafa.
4. Devuelve: semáforo (rojo/amarillo/verde), señales concretas citando el mensaje, acciones inmediatas y **el canal oficial verificado** — el teléfono real del organismo, que sale de un directorio propio y nunca del modelo.
5. Botón "Copiar para compartir": el análisis queda listo para reenviar por WhatsApp.

Probado con **71 casos reales** de estafas y mensajes legítimos argentinos (`tests/`): 99% de acierto.

La app evalúa **riesgo**, nunca certeza: un verde significa "sin señales típicas", no "100% seguro". Nada de lo analizado se almacena.

## Correr localmente

```bash
npm install
cp .env.example .env.local   # completá una API key (ver el archivo)
npm run dev
```

## Deploy

Pensada para Vercel: conectar el repo y cargar `ANTHROPIC_API_KEY` (o `GEMINI_API_KEY`) en Environment Variables.

## Stack

Next.js (App Router) + TypeScript + Tailwind · API de Claude/Gemini con visión · Vercel.
