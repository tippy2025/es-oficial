# 🏆 Listado maestro de ideas — CoderCup AI 2026

**Método:** 4 rondas de investigación (16 agentes especializados) + consulta a ChatGPT y Gemini + jurado simulado de 3 jueces + red-team del proyecto + inteligencia sobre el jurado real y los competidores. ~45 ideas evaluadas.

**Criterio de ranking (el del concurso):** problema genuino y frecuente + solución que funciona en la demo + video de 2 min emocional. Ponderado por: cero cold-start, sin scraping frágil, construible por 1 persona en ≤5 días, bajo riesgo legal.

**Contexto clave descubierto:** el jurado es Iván Itzcovich (@surfingdev, StudioChat, ex-Microsoft, ITBA) — builder pragmático que valora "problema real → solución que funciona". Los competidores del curso construyen mayormente automatizaciones genéricas con n8n. ANSES emitió alerta oficial por estafas a jubilados en agosto 2026.

Cada ficha responde: **qué hace el producto** (entrada → salida), **cómo funciona por dentro**, **qué se ve en la demo** y **qué le falta para ganar**.

---

# 🥇 TIER S — Ganadores potenciales

## 1. ¿Es Oficial? — verificador de estafas · CONSTRUIDO ✅ · 9.0/10

**Problema:** 89% de los adultos mayores argentinos recibió intentos de estafa digital; ANSES y PAMI emitieron alertas oficiales en agosto 2026. La pregunta que reciben miles de hijos y nietos cada semana es la misma: *"¿esto es verdad?"*.

**Qué hace (lo que ya funciona en es-oficial.vercel.app):**
- **Entrada:** el usuario pega el texto de un mensaje sospechoso (WhatsApp, SMS, mail) **o sube/pega una captura de pantalla**.
- **Salida en ~3 segundos:**
  - Semáforo: 🔴 alto riesgo / 🟡 sospechoso, verificá / 🟢 sin señales típicas
  - **Señales concretas citando el mensaje** ("te pide el código de 6 dígitos del SMS", "usa urgencia: 'hoy mismo'", "PAMI no escribe por WhatsApp")
  - **Qué hacer ahora** en imperativo ("No respondas", "No toques el link", "Bloqueá el contacto")
  - **Cómo verificar por el canal oficial** (app Mi PAMI, llamá vos al 138)
  - Explicación de 2 frases "como para contársela a tu mamá"
  - Botón **"Copiar para compartir con mamá"** → el análisis queda formateado para reenviar por WhatsApp
- 3 ejemplos precargados (estafa PAMI, "hijo con número nuevo", turno médico legítimo) para que el jurado pruebe en 1 clic.

**Cómo funciona por dentro:** Next.js en Vercel → API que llama a Claude (Haiku 4.5, con visión para capturas) con un system prompt que inyecta una **base curada de reglas argentinas** (canales oficiales de PAMI/ANSES/ARCA/bancos/billeteras, patrones de estafa clásicos) → responde JSON estructurado → la UI lo renderiza. Nada se guarda. Cuesta ~medio centavo por análisis.

**Qué falta para ganar (blindaje, 2-3 días):**
1. **Compartir desde WhatsApp** — registrar la app como destino del menú "Compartir" del celular (PWA share target): desde el chat tocás Compartir → ¿Es Oficial? → la captura llega sola. Responde a la crítica "la abuela nunca va a entrar a una web".
2. **Directorio de canales oficiales verificados** — cuando detecta suplantación de PAMI, muestra el 138 real con botón de llamar; si es Banco Galicia, su 0800 verdadero; si es ANSES, el 130. Convierte "diagnóstico" en "acción".
3. **Botón "reportar como estafa real"** — guarda el patrón (anónimo) para que la base aprenda; demuestra que no muere en 60 días.
4. *(Bonus)* Verificar **links y sitios de compra** en el mismo flujo (pegás una URL → dominio imitación, HTTPS, edad del dominio).

**Demo / video:** abre con el WhatsApp de PAMI → análisis rojo en 3 seg → después el turno médico en verde (muestra criterio) → botón compartir con mamá → cierre "antes de responder, preguntá".

---

## 2. AmparoBot — tu reclamo cuando la prepaga te dice que no · 8.5/10

**Problema:** las prepagas y obras sociales rechazan sistemáticamente medicamentos, estudios y tratamientos (~5 millones de rechazos/mes estimados), apostando a que el paciente no tiene energía ni plata para pelear. La Resolución 951/2026 de la Superintendencia de Salud las obliga ahora a responder reclamos en 5 días — pero nadie sabe cómo hacer el reclamo.

**Qué haría:**
- **Entrada:** foto de la receta/orden médica + foto o texto del rechazo de la prepaga (mail, captura de la app, carta) + nombre de la prepaga/obra social.
- **Salida:**
  - Veredicto: **"Este rechazo es ILEGAL"** (la insulina, la medicación oncológica, las terapias por CUD, etc. son cobertura obligatoria del PMO) o **"Este rechazo es válido"** (ej. cirugía estética) o "Zona gris: te conviene reclamar igual".
  - Explicación en criollo de por qué, citando el artículo del PMO / ley 26.682 / ley 24.901 (discapacidad) que aplica.
  - **Reclamo formal generado**: texto listo para copiar y pegar en el formulario de la Superintendencia de Servicios de Salud (SSSalud) o mandar por carta documento, con los datos del paciente, la prestación rechazada, la normativa citada y el plazo de 5 días.
  - Botón "descargar PDF" y "qué hacer si en 5 días no responden" (denuncia en SSSalud, amparo).
- Casos precargados para la demo: insulina rechazada, terapia de un chico con CUD rechazada, cirugía estética rechazada (para mostrar que dice "válido" cuando corresponde).

**Cómo funciona por dentro:** Claude con visión lee receta y rechazo → un system prompt con una **base curada del PMO y las leyes clave** (20-30 prestaciones más frecuentes con su fundamento legal, cargadas a mano) → clasifica y redacta → PDF con pdf-lib. Sin scraping.

**Riesgos:** genera documentos con valor legal (necesita disclaimer fuerte y limitar a los casos claros); el jurado tiene que entender qué es el PMO (30 segundos de video). Necesita 1 día de curaduría normativa antes de programar.

**Demo / video:** madre con la receta de insulina de su hijo y el mail de rechazo → foto, foto → "ILEGAL: la insulina es cobertura obligatoria (PMO art. X)" → PDF del reclamo en 5 segundos → "le ahorraste $500 mil de abogado a una familia".

---

## 3. Cotizador de oficios por audio · 8.0/10

**Problema:** plomeros, electricistas, gasistas y pintores pierden clientes frente a empresas grandes porque el presupuesto llega tarde y en un mensaje informal ("son 80 lucas más materiales"). Presupuestar les lleva horas de noche en la casa.

**Qué haría:**
- **Entrada:** el trabajador **graba un audio de 30 segundos** al salir de la casa del cliente ("fui a lo de Marta, hay que cambiar 2 metros de caño termofusión de 3/4, una llave de paso, y cobro 80 mil de mano de obra") — o lo escribe. Configuración única: nombre, oficio, logo opcional, teléfono.
- **Salida:** un **presupuesto PDF profesional** con membrete, detalle de materiales con cantidades, mano de obra, total, validez y forma de pago, más un texto listo para reenviar por WhatsApp al cliente. Precios de materiales sugeridos desde una tabla de referencia editable (el trabajador ajusta antes de enviar).
- Editable en pantalla antes de generar; historial de presupuestos en el navegador.

**Cómo funciona por dentro:** transcripción del audio (Whisper) → Claude estructura ítems, cantidades y precios → plantilla PDF. Todo local al navegador salvo las dos llamadas a la API. Cero dependencias frágiles — es la demo más robusta según el juez técnico.

**Demo / video:** plomero en la camioneta manda un audio → 5 segundos → PDF impecable con su logo → se lo manda a Marta → "el que cotiza primero y mejor, se queda con el trabajo".

---

# 🥈 TIER A — Muy buenos, algo por debajo

## 4. Escudo Inquilino — auditor de contratos de alquiler · 7.5/10

**Problema:** con la ley de alquileres desregulada, los contratos son "la ley de la selva"; la gente firma por desesperación sin poder pagar un abogado que revise el borrador. Miles de upvotes en Reddit pidiendo herramientas para inquilinos.

**Qué haría:** subís el PDF/Word/foto del contrato → la IA lo lee y devuelve un **semáforo por cláusula**: 🔴 abusivas (te hacen pagar arreglos estructurales, indexación ilegal, penalidades desproporcionadas), 🟡 a negociar, 🟢 estándar. Cada una explicada en criollo con qué pedir cambiar y una **carta/mensaje sugerido para la inmobiliaria**. Resumen de una página: "lo que firmarías si no lo lees".

**Cómo funciona:** Claude con documento largo + base curada de normativa vigente (Código Civil y Comercial arts. de locación) y patrones de cláusulas abusivas.

**Por qué no es S:** el jurado necesita tener un contrato a mano (mitigable con 2 contratos de ejemplo); requiere curaduría legal.

## 5. COPREC Express — de la bronca al reclamo legal · 7.5/10

**Problema:** las empresas de servicios (prepagas, internet, luz, bancos) facturan mal, no dan de baja, ignoran reclamos; solo en Santa Fe hay 26.000 denuncias/año en Defensa del Consumidor, y la mayoría de la gente no reclama porque el formulario es largo y no sabe qué escribir.

**Qué haría:** subís capturas de tu pelea con el bot de la empresa o la factura mal cobrada → la IA arma la **cronología de los hechos**, identifica la infracción a la Ley de Defensa del Consumidor (24.240) y genera el **texto del reclamo listo para pegar en la web de COPREC/Defensa del Consumidor**, más el reclamo previo formal a la empresa. Te dice qué pruebas juntar y qué esperar (plazos, audiencia).

**Por qué no es S:** primo hermano de AmparoBot con menos carga emocional (nadie llora por la factura de internet… bueno, casi).

## 6. Traductor de jerga médica · 7.5/10

**Problema:** los pacientes no entienden recetas, análisis ni instrucciones post-alta → tratamientos mal seguidos y reinternaciones. Resolución 2214/2025 exige información "clara y acorde al paciente".

**Qué haría:** foto de la receta, del análisis de sangre o de la epicrisis → **explicación en criollo**: qué tenés, qué tomar y cuándo (con tabla horaria), qué valores están fuera de rango y qué significa, **señales de alarma** para ir a la guardia, y **preguntas para llevarle al médico** en la próxima consulta. Botón "leerlo en voz alta" y "compartir con la persona que te cuida".

**Por qué no es S:** responsabilidad médica (el jurado 1 lo castigó por eso); disclaimer fuerte y "nunca quita información, solo la reformatea".

## 7. Plata Perdida — lo que estás dejando de cobrar · 7.0/10

**Problema:** millones no cobran subsidios, tarifas sociales, exenciones y derechos que ya tienen porque la información está dispersa en 20 webs; 1 millón de nuevos pobres en el primer trimestre de 2026 (UCA) que nunca tuvieron que tramitar nada.

**Qué haría:** wizard de 5-8 preguntas (edad, provincia, trabajo, hijos, alquiler, CUD, jubilación) → **lista de beneficios que te corresponden** con: por qué calificás, qué necesitás, dónde tramitarlo (link oficial), estimación de plata por año. Botón "armame el checklist" y aviso de "última actualización" visible.

**Cómo funciona:** motor de reglas sobre una base curada de 25-30 beneficios concretos con fuentes oficiales + Claude para explicar y ordenar por impacto.

**Por qué no es S:** la base se desactualiza rápido; la demo es un wizard (menos "wow" instantáneo).

## 8. Guía CUD (discapacidad) · 7.0/10

**Problema:** las familias con un hijo con CUD no saben qué beneficios tienen (transporte gratuito, maestro integrador, cobertura 100% de terapias, asignaciones) ni cómo accederlos; la info está fragmentada en 5+ portales.

**Qué haría:** chat que responde en criollo: "mi hijo de 8 años tiene CUD por TEA en CABA, ¿qué me corresponde?" → **lista estructurada de beneficios** con requisitos, dónde y cuánto tarda, y **qué hacer si la obra social rechaza una sesión** (con el reclamo listo, apoyado en la ley 24.901). Base curada por provincia.

**Por qué no es S:** nicho más chico y misma fragilidad de datos que Plata Perdida; en cambio la emoción es altísima.

## 9. ¿Quién me debe plata? — cobranzas para pymes · 7.0/10

**Problema:** 53% de las pymes reportó más incumplimiento de pagos en 2026; el dueño recibe una transferencia de "naranjajuanp" y no sabe qué factura es; horas de Excel por semana.

**Qué haría:** subís el CSV del banco/Mercado Pago + tu listado de facturas → la IA **empareja pagos con facturas** (por monto, fecha, alias, nombre parcial), marca los dudosos con % de confianza, y te devuelve el tablero: cobradas / parciales / **sin cobrar** con total en rojo. Botón **"generar reclamos"**: un mensaje de WhatsApp o mail cordial por cada deudor, listo para mandar.

**Por qué no es S:** B2B — ganador para Gemini en la ronda 1, pero poco emocional en un video de 2 minutos.

---

# 🥉 TIER B — Buenos negocios, no para este concurso

| # | Idea | Qué haría (en una línea) | Por qué queda afuera |
|---|------|--------------------------|----------------------|
| 10 | Presupuesto de obra desde el plano | Foto del plano → m² y materiales estimados con costo actual | OCR de planos falla en fotos malas |
| 11 | Costeo de recetas con inflación | Foto de la receta → costo por porción y precio sugerido | Base de precios frágil |
| 12 | Clasificador de facturas para contadores | 10 fotos → CSV contable categorizado | Muy útil, cero emoción |
| 13 | Rendiciones para clubes/consorcios | Fotos de comprobantes → rendición mensual con gráficos | Nicho tranquilo |
| 14 | Validador de cartas de porte (agro) | Foto → errores antes de que ARCA la rechace | El jurado no puede probarlo |
| 15 | Anti-burnout docente | Notas sueltas → informes de alumnos y comunicados | El jurado no tiene notas de alumnos a mano |
| 16 | Gestor de comedores comunitarios | Donaciones/voluntarios/stock + resumen diario por WhatsApp | Integración WhatsApp frágil |
| 17 | Reclamos de vuelos | Demora/cancelación → carta de reclamo con compensación | Estacional, nicho |
| 18 | Guía de sucesiones | Wizard → costos, plazos y checklist | Cálculos varían por provincia |
| 19 | Triaje veterinario | Foto + síntomas → urgencia sí/no | Falso negativo peligroso |
| 20 | Detector de sitios clonados | Pegás la URL de la tienda → riesgo de phishing | **Absorberlo como feature de ¿Es Oficial?** |
| 21 | Presupuesto familiar de emergencia | Ingresos/gastos → punto de quiebre y 3 salidas | Calculadora con IA encima |
| 22 | Ayuda ante violencia familiar | Quiz anónimo → tipo de violencia + refugios + plan de salida | Impacto altísimo, pero exige responsabilidad extrema; no es material de concurso |

# ❌ Descartados con razón documentada

| Idea | Razón |
|------|-------|
| Marketplace de oficios ("Rappi de oficios") | Cold-start fatal en la demo; Timbrit (40k profesionales), Home Solution, Zolvers ya lo dominan; IguanaFix fracasó con el modelo |
| Buscador de precios de súper + logística | Ratoneando (5M descargas) lo cubre; scraping de Coto/Carrefour frágil; logística inviable en 5 días |
| BoletínGPT / licitaciones | Datos que se desactualizan = "peor que nada" |
| VAR de fútbol amateur | Viral pero "un juguete, no un problema" |
| Colectivos en tiempo real | Requiere masa crítica de reportes |
| App rural offline | No es IA-céntrico; requiere curar contenido educativo |
| Verificación de edad para redes | Sesgo de modelos faciales; riesgo legal alto |

---

# 📌 Recomendación final

**Presentar "¿Es Oficial?" con el blindaje descripto en la ficha 1.** Es el único que combina: timing perfecto (alerta ANSES este mes), cero competencia interna, demo que el jurado siente en 10 segundos con su propio celular, y ya está construido, desplegado y en GitHub. Cambiar de caballo a 5 días del cierre es la clásica derrota autoinfligida.

**AmparoBot (ficha 2) queda como próximo proyecto de portfolio** — el problema es más pesado, y el músculo de construcción rápida ya está demostrado.
