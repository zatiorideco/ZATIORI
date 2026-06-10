# PROMPT — Claude Code (Zatiori)

> Pegá esto en **Claude Code** dentro de una carpeta vacía. Antes de empezar, agregá al final los **design tokens** que te dio Claude Design (Paso 1). Construí por **fases**, no todo de una.

---

Sos mi desarrollador full-stack. Vas a construir **Zatiori**: la web pública + el software de gestión (panel) de un "Almacén de Espejos" artesanal de Bahía Blanca, Argentina. Vendemos espejos grandes con marcos de madera nueva/reciclada y pátinas, **piezas únicas** (no producción masiva). Todo en **español rioplatense**, precios en **ARS**.

## Stack (no te desvíes)
- Next.js 14 App Router + TypeScript
- TailwindCSS + shadcn/ui
- Prisma + PostgreSQL (Neon) — pedime el `DATABASE_URL` o usá `.env`
- NextAuth (credenciales) con roles
- `@react-pdf/renderer` para PDFs
- `dnd-kit` para el kanban
- Vercel Blob para imágenes
- Meta Graph API v25.0 para Instagram
- Deploy: Vercel

## Identidad (aplicar desde el primer commit)
Marrón madre `#775A48`, espresso `#3E2F26`, negro cálido `#1A1512`, crema `#F4EDE2`, arena `#E2D3BE`, madera `#B0875F`. Display `Anton`, editorial `Fraunces`, cuerpo `Inter`. Estética acogedora "casa de deco". Logo "ZATIORI". Botón flotante de WhatsApp (`https://wa.me/5492914313204`) + Instagram (`https://instagram.com/zatiori`) en toda la web.
*(Si pegaste los tokens de Design abajo, usá esos como fuente de verdad.)*

## Arquitectura
Un solo proyecto Next.js: rutas públicas `(public)` + panel protegido `(panel)` compartiendo la misma DB. **El configurador de la web crea un Pedido y genera automáticamente los registros de fábrica en estado PARA_FABRICAR con el cliente vinculado.**

## Modelo de datos (Prisma)
Implementá estas entidades (ajustá tipos según convenga):
- **Usuario**: nombre, email único, passwordHash, `rol` (ADMIN|VENTAS|FABRICA), activo.
- **Configuracion** (singleton): nombreNegocio, direccion, whatsapp, instagram, emailContacto, logoUrl, datosFiscales, textoNosotros, textoTerminos, horarios, `igTokenEncrypted`, igBusinessId, fbPageId.
- **OpcionConfigurador**: `tipo` (MADERA|PATINA|TALLADO|TAMAÑO|EXTRA), nombre, descripcion, precioAdicional, imagenUrl, activo, orden. (Las opciones del configurador se administran desde Configuración, no hardcodeadas.)
- **Proveedor**: `tipo` (MADERA|ESPEJO|INSUMO|HERRAJE), nombre, contacto, telefono, email, direccion, notas.
- **Cliente**: nombre, telefono, email, direccion, ciudad, `origen` (WEB|INSTAGRAM|LOCAL|REFERIDO|WHATSAPP), notas. Relación 1‑N con InteraccionCliente y Pedido.
- **InteraccionCliente**: clienteId, `tipo` (NOTA|LLAMADA|WHATSAPP|VISITA|EMAIL), contenido, usuarioId, fecha.
- **EspejoCatalogo**: slug único, nombre, descripcion, tipoMarco, alto, ancho, madera, patina, tallado, proveedorId, precio, fotos (string[]), `estado` (DISPONIBLE|RESERVADO|VENDIDO), esStock (bool), publicadoWeb (bool), destacado (bool).
- **Pedido**: `numero` autogenerado (ZAT-0001), clienteId, `estado` (PRESUPUESTO|CONFIRMADO|EN_FABRICACION|TERMINADO|ENTREGADO|CANCELADO), origen, subtotal, descuento, total, sena, saldo, fechaEstimada, notas, usuarioId.
- **ItemPedido**: pedidoId, espejoCatalogoId (opcional), descripcion, alto, ancho, maderaOpcionId, patinaOpcionId, talladoOpcionId, extras (json), cantidad, precioUnitario, fotoReferenciaUrl, notas.
- **EspejoFabricacion**: pedidoItemId (opcional), espejoCatalogoId (opcional), clienteId (opcional), `estado` (PARA_FABRICAR|EN_FABRICACION|TERMINADO_CLIENTE|TERMINADO_STOCK), descripcion, alto, ancho, especificaciones (json: madera/patina/tallado), responsableId, prioridad (BAJA|MEDIA|ALTA), fechaInicio, fechaFin, fotos (string[]), notasProduccion.
- **Resena**: clienteId (opcional), nombre, rating (1–5), texto, fotos (string[]), aprobada (bool, default false), publicadaWeb (bool).
- **PublicacionInstagram**: espejoCatalogoId o espejoFabricacionId, caption, imagenes (string[]), `estado` (BORRADOR|PROGRAMADA|PUBLICADA|ERROR), fechaProgramada, igMediaId, igPermalink.

## Lógica del tablero de fábrica
4 columnas = 4 estados: **Para fabricar → En fabricación → Terminados Clientes / Terminados Stock**.
- Todo pedido nuevo entra como PARA_FABRICAR con `clienteId`.
- Espejos para stock se crean PARA_FABRICAR sin cliente.
- Al marcar "terminado": si tiene `clienteId` → TERMINADO_CLIENTE; si no → TERMINADO_STOCK (auto‑ruteo, con opción de override manual).
- Botón en TERMINADO_STOCK: "Pasar a catálogo" (crea/actualiza EspejoCatalogo con esStock=true).
- Dos vistas sobre los mismos datos: **Lista** (tabla filtrable: estado, prioridad, cliente, fecha) y **Pipeline** (kanban drag & drop con dnd-kit).

## Roles
- ADMIN: todo + usuarios + configuración + tokens + opciones + precios.
- VENTAS: clientes, pedidos, catálogo, reseñas, publicador IG.
- FABRICA: tablero de fábrica (estados, fotos, notas) + lectura del pedido.

## PDFs (con @react-pdf/renderer)
1. **PDF Pedido (cliente):** logo, datos cliente, detalle de cada espejo (medidas, madera, pátina, tallado, extras, foto ref), subtotal/seña/saldo, fecha estimada, contacto. Descargable y compartible por WhatsApp.
2. **Orden de Fabricación (interna):** specs técnicas, prioridad, responsable, checklist. Se genera junto al pedido.

## Integraciones
- **WhatsApp:** botón flotante (web) con mensaje prellenado + botón "Contactar por WhatsApp" en cliente/pedido (panel).
- **Instagram:** Graph API v25.0, Content Publishing. Token de larga duración **cifrado AES-256-GCM** guardado en Configuracion. Flujo: container de media → publicar/programar. Estados borrador/programada/publicada/error. **Por defecto creá en BORRADOR**; publicar solo con confirmación explícita.
- **Reseñas:** ruta pública `/resena/[token]` para dejar reseña + foto; entran `aprobada:false`; se publican en web tras aprobación.

## Construí por FASES (parar y mostrar al terminar cada una)
**Fase 1 — Cimientos:** setup Next+TS+Tailwind+shadcn, Prisma schema completo + migración, seed mínimo, NextAuth con roles, layout y design system (tokens), navbar/footer, botones flotantes WA+IG.
**Fase 2 — Web pública:** Home, Catálogo (grilla + filtros), Ficha de espejo, Nosotros, Términos. Deploy a Vercel. *(Acá ya tenés algo online.)*
**Fase 3 — Configurador → Pedido → Fábrica:** configurador paso a paso (lee OpcionConfigurador), cálculo de precio estimado, creación de Cliente+Pedido+EspejoFabricacion(PARA_FABRICAR), email/notificación interna.
**Fase 4 — Panel núcleo:** Dashboard (KPIs), CRM (clientes + timeline), Proveedores, Catálogo ABM (subida de fotos a Blob).
**Fase 5 — Fábrica + PDFs:** tablero lista + pipeline (dnd-kit), cambios de estado con auto-ruteo, los dos PDFs.
**Fase 6 — Extras:** Reseñas (captura + aprobación + publicación web), Publicador de Instagram, ABM de Usuarios, pantalla de Configuración (incluye carga/cifrado del token IG y administración de OpcionConfigurador).

## Criterios de aceptación
- Responsive y rápido (Next/Image). Mobile-first en web.
- El configurador entendible en 30s; el kanban usable en el taller.
- Seguridad: rutas del panel protegidas por rol; tokens cifrados; nunca exponer secretos al cliente.
- Código limpio, componentes reutilizables, `.env.example` documentado.

Arrancá por la **Fase 1** y mostrame el schema de Prisma antes de migrar para que lo valide.

---

### [PEGAR ACÁ LOS DESIGN TOKENS DE CLAUDE DESIGN]
```
(colores, fuentes, radios, sombras del Paso 1)
```
