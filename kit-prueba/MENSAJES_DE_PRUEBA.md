# 🧪 Kit de prueba de ¿Es Oficial?

Abrí **es-oficial.vercel.app** en el celular, copiá cualquiera de estos mensajes, pegalo y tocá **Analizar**. Las 4 capturas de pantalla (archivos `.png` en esta carpeta) sirven para probar el botón **📷 Subir captura**: mandátelas al celular por WhatsApp/mail, guardalas y subilas.

Al lado de cada uno está lo que la app **debería** responder. Si en alguno se equivoca, avisame — es exactamente el tipo de dato que quiero.

---

## 🔴 Estafas (deberían salir en ROJO)

**1. Suplantación de PAMI**
> Hola! Le escribimos de PAMI. Para no perder su cobertura de medicamentos gratis necesitamos validar su identidad hoy mismo. Envíenos foto de su DNI y el código de 6 dígitos que le llega por SMS. Es urgente, el sistema cierra a las 18hs.

Esperado: rojo, señala DNI + código SMS + urgencia; canal oficial PAMI con el 138.

**2. Hijo con número nuevo**
> Hola ma, se me rompió el celu y estoy usando este número nuevo. Necesito que me hagas una transferencia urgente de $180.000 a este alias porque tengo que pagar algo ya y no puedo entrar al banco. Después te explico, no le digas a nadie que me da vergüenza.

Esperado: rojo, patrón "familiar con número nuevo" + urgencia + secreto; recomienda llamar al número de siempre.

**3. Falso banco por teléfono (transcripción de llamada)**
> Buen día, lo llamo del área de seguridad de Banco Galicia. Detectamos una compra sospechosa de $95.000 con su tarjeta. Para cancelarla necesito que se acerque al cajero más cercano y siga mis indicaciones para generar un código de cancelación. Manténgase en línea, es urgente.

Esperado: rojo, "ir al cajero guiado por teléfono = estafa siempre"; canal oficial Galicia.

**4. Premio / sorteo**
> ¡FELICITACIONES! Su número fue seleccionado ganador de un Samsung Galaxy S25 en el sorteo aniversario de Mercado Libre. Para recibirlo solo debe abonar el costo de envío de $4.500 en el siguiente link: bit.ly/premio-ml-2026

Esperado: rojo, "premio que exige pagar para cobrar" + link acortado.

**5. Código de WhatsApp**
> Hola! Perdón, te mandé por error un código de 6 dígitos por SMS, ¿me lo pasás? Es que estaba registrando mi WhatsApp nuevo y puse mal el número. Gracias!!

Esperado: rojo, "el código de verificación de WhatsApp no se comparte con nadie = robo de cuenta".

**6. Oferta laboral con depósito**
> Hola, somos de RRHH de Amazon Argentina. Fuiste preseleccionado para trabajo remoto de carga de datos, $850.000/mes, medio tiempo. Para activar tu cuenta de trabajo necesitamos un depósito reembolsable de $25.000. Respondé SI para continuar.

Esperado: rojo, "trabajo que pide depósito = estafa".

## 🟡 Zona gris (debería salir AMARILLO o rojo suave)

**7. Cobro de expensas ambiguo**
> Hola vecino, soy la nueva administradora del consorcio. Cambiamos la cuenta para el pago de expensas, a partir de este mes transferí al alias CONSORCIO.NUEVO.2026. Cualquier duda me escribís por acá.

Esperado: amarillo — puede ser real, pero cambio de cuenta de cobro por WhatsApp = verificar por otro canal (llamar a la administración anterior / vecinos).

## 🟢 Legítimos (deberían salir en VERDE)

**8. Turno médico**
> Hospital Italiano: le recordamos su turno con Clínica Médica el jueves 21/08 a las 10:30 hs, sede central, piso 3. Si no puede asistir, cancele desde el Portal de Salud o la app.

Esperado: verde, sin pedidos de datos ni links; sugiere confirmar por el Portal.

**9. Aviso de entrega**
> Andreani: tu envío 360001234567 está en camino y llegará hoy entre las 14 y las 18 hs. No es necesario que hagas nada. Podés seguirlo desde nuestra app o en andreani.com.

Esperado: verde — no pide nada, no hay link de pago, no hay urgencia.

---

## 📷 Capturas para probar la subida de imágenes

| Archivo | Qué es | Esperado |
|---|---|---|
| `captura_whatsapp_banco.png` | WhatsApp de "Banco Nación - Seguridad" con link falso y 20 minutos de plazo | 🔴 rojo, dominio imitación `.com.ar.info` |
| `captura_sms_correo.png` | SMS de "Correo Argentino": paquete retenido en aduana, pagar tasa | 🔴 rojo, "el Correo no cobra por link" |
| `captura_mail_mercadopago.png` | Mail de "Mercado Pago" desde un dominio falso, cuenta suspendida en 24 h | 🔴 rojo, remitente `mercado-pago-alertas.com` no es oficial |
| `captura_whatsapp_turno_real.png` | WhatsApp de OSDE recordando un turno | 🟢 verde |

## 📱 Cómo probar "Compartir" en el celular

- **Android (Chrome):** menú ⋮ → *Agregar a pantalla de inicio / Instalar app*. Después, en WhatsApp: mantené apretado un mensaje → Compartir → **¿Es Oficial?** → se analiza solo.
- **iPhone (Safari):** botón Compartir (cuadrado con flecha ↑) → deslizá → **Agregar a inicio**. iPhone no permite compartir *hacia* apps web, así que ahí el flujo es copiar el mensaje y pegarlo (o guardar la captura y subirla con 📷).
