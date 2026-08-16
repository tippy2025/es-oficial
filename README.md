# 🛡️ ¿Es Oficial?

**Antes de responder, preguntá.**

App web que analiza mensajes sospechosos (WhatsApp, SMS, mail) y devuelve en segundos un semáforo de riesgo de estafa, las señales concretas detectadas y qué hacer, anclado en una base curada de reglas sobre canales oficiales argentinos (PAMI, ANSES, bancos, billeteras).

Pensada para proteger a nuestros mayores: el 89% de los adultos mayores argentinos recibió intentos de estafa digital. El usuario típico es el hijo o la hija que recibe el "¿esto es verdad?" por WhatsApp — ahora tiene dónde reenviarlo.

Proyecto presentado a la **CoderCup AI 2026** de CoderHouse.

## Cómo funciona

1. Pegás el texto del mensaje o subís/pegás una captura de pantalla.
2. La IA (Claude o Gemini, con visión) lo analiza contra una base de reglas verificadas de canales oficiales argentinos y patrones de estafa.
3. Devuelve: semáforo (rojo/amarillo/verde), señales concretas citando el mensaje, acciones inmediatas y cómo verificar por el canal oficial.
4. Botón "Copiar para compartir": el análisis queda listo para reenviar por WhatsApp.

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
