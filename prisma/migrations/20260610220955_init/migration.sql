-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'VENTAS', 'FABRICA');

-- CreateEnum
CREATE TYPE "TipoOpcion" AS ENUM ('MADERA', 'PATINA', 'TALLADO', 'TAMANO', 'EXTRA');

-- CreateEnum
CREATE TYPE "TipoProveedor" AS ENUM ('MADERA', 'ESPEJO', 'INSUMO', 'HERRAJE');

-- CreateEnum
CREATE TYPE "OrigenCliente" AS ENUM ('WEB', 'INSTAGRAM', 'LOCAL', 'REFERIDO', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "TipoInteraccion" AS ENUM ('NOTA', 'LLAMADA', 'WHATSAPP', 'VISITA', 'EMAIL');

-- CreateEnum
CREATE TYPE "EstadoCatalogo" AS ENUM ('DISPONIBLE', 'RESERVADO', 'VENDIDO');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PRESUPUESTO', 'CONFIRMADO', 'EN_FABRICACION', 'TERMINADO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoFabricacion" AS ENUM ('PARA_FABRICAR', 'EN_FABRICACION', 'TERMINADO_CLIENTE', 'TERMINADO_STOCK');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('BAJA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "EstadoPublicacion" AS ENUM ('BORRADOR', 'PROGRAMADA', 'PUBLICADA', 'ERROR');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'VENTAS',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "nombreNegocio" TEXT NOT NULL DEFAULT 'Zatiori',
    "direccion" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "emailContacto" TEXT,
    "logoUrl" TEXT,
    "datosFiscales" TEXT,
    "textoNosotros" TEXT,
    "textoTerminos" TEXT,
    "horarios" TEXT,
    "igTokenEncrypted" TEXT,
    "igBusinessId" TEXT,
    "fbPageId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpcionConfigurador" (
    "id" TEXT NOT NULL,
    "tipo" "TipoOpcion" NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioAdicional" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "imagenUrl" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpcionConfigurador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" TEXT NOT NULL,
    "tipo" "TipoProveedor" NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "origen" "OrigenCliente" NOT NULL DEFAULT 'WEB',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteraccionCliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipo" "TipoInteraccion" NOT NULL DEFAULT 'NOTA',
    "contenido" TEXT NOT NULL,
    "usuarioId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InteraccionCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EspejoCatalogo" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoMarco" TEXT,
    "alto" INTEGER,
    "ancho" INTEGER,
    "madera" TEXT,
    "patina" TEXT,
    "tallado" TEXT,
    "proveedorId" TEXT,
    "precio" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estado" "EstadoCatalogo" NOT NULL DEFAULT 'DISPONIBLE',
    "esStock" BOOLEAN NOT NULL DEFAULT true,
    "publicadoWeb" BOOLEAN NOT NULL DEFAULT false,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EspejoCatalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "numeroSeq" SERIAL NOT NULL,
    "clienteId" TEXT NOT NULL,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'PRESUPUESTO',
    "origen" "OrigenCliente" NOT NULL DEFAULT 'WEB',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sena" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "saldo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fechaEstimada" TIMESTAMP(3),
    "notas" TEXT,
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "espejoCatalogoId" TEXT,
    "descripcion" TEXT NOT NULL,
    "alto" INTEGER,
    "ancho" INTEGER,
    "maderaOpcionId" TEXT,
    "patinaOpcionId" TEXT,
    "talladoOpcionId" TEXT,
    "extras" JSONB,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precioUnitario" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fotoReferenciaUrl" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EspejoFabricacion" (
    "id" TEXT NOT NULL,
    "pedidoItemId" TEXT,
    "espejoCatalogoId" TEXT,
    "clienteId" TEXT,
    "estado" "EstadoFabricacion" NOT NULL DEFAULT 'PARA_FABRICAR',
    "descripcion" TEXT NOT NULL,
    "alto" INTEGER,
    "ancho" INTEGER,
    "especificaciones" JSONB,
    "responsableId" TEXT,
    "prioridad" "Prioridad" NOT NULL DEFAULT 'MEDIA',
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "fotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notasProduccion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EspejoFabricacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resena" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "token" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "fotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aprobada" BOOLEAN NOT NULL DEFAULT false,
    "publicadaWeb" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicacionInstagram" (
    "id" TEXT NOT NULL,
    "espejoCatalogoId" TEXT,
    "espejoFabricacionId" TEXT,
    "caption" TEXT NOT NULL,
    "imagenes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estado" "EstadoPublicacion" NOT NULL DEFAULT 'BORRADOR',
    "fechaProgramada" TIMESTAMP(3),
    "igMediaId" TEXT,
    "igPermalink" TEXT,
    "errorMensaje" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicacionInstagram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "OpcionConfigurador_tipo_activo_orden_idx" ON "OpcionConfigurador"("tipo", "activo", "orden");

-- CreateIndex
CREATE INDEX "InteraccionCliente_clienteId_fecha_idx" ON "InteraccionCliente"("clienteId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "EspejoCatalogo_slug_key" ON "EspejoCatalogo"("slug");

-- CreateIndex
CREATE INDEX "EspejoCatalogo_publicadoWeb_estado_idx" ON "EspejoCatalogo"("publicadoWeb", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_numero_key" ON "Pedido"("numero");

-- CreateIndex
CREATE INDEX "Pedido_estado_createdAt_idx" ON "Pedido"("estado", "createdAt");

-- CreateIndex
CREATE INDEX "EspejoFabricacion_estado_prioridad_idx" ON "EspejoFabricacion"("estado", "prioridad");

-- CreateIndex
CREATE UNIQUE INDEX "Resena_token_key" ON "Resena"("token");

-- CreateIndex
CREATE INDEX "Resena_aprobada_publicadaWeb_idx" ON "Resena"("aprobada", "publicadaWeb");

-- CreateIndex
CREATE INDEX "PublicacionInstagram_estado_fechaProgramada_idx" ON "PublicacionInstagram"("estado", "fechaProgramada");

-- AddForeignKey
ALTER TABLE "InteraccionCliente" ADD CONSTRAINT "InteraccionCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteraccionCliente" ADD CONSTRAINT "InteraccionCliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EspejoCatalogo" ADD CONSTRAINT "EspejoCatalogo_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_espejoCatalogoId_fkey" FOREIGN KEY ("espejoCatalogoId") REFERENCES "EspejoCatalogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_maderaOpcionId_fkey" FOREIGN KEY ("maderaOpcionId") REFERENCES "OpcionConfigurador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_patinaOpcionId_fkey" FOREIGN KEY ("patinaOpcionId") REFERENCES "OpcionConfigurador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_talladoOpcionId_fkey" FOREIGN KEY ("talladoOpcionId") REFERENCES "OpcionConfigurador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EspejoFabricacion" ADD CONSTRAINT "EspejoFabricacion_pedidoItemId_fkey" FOREIGN KEY ("pedidoItemId") REFERENCES "ItemPedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EspejoFabricacion" ADD CONSTRAINT "EspejoFabricacion_espejoCatalogoId_fkey" FOREIGN KEY ("espejoCatalogoId") REFERENCES "EspejoCatalogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EspejoFabricacion" ADD CONSTRAINT "EspejoFabricacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EspejoFabricacion" ADD CONSTRAINT "EspejoFabricacion_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacionInstagram" ADD CONSTRAINT "PublicacionInstagram_espejoCatalogoId_fkey" FOREIGN KEY ("espejoCatalogoId") REFERENCES "EspejoCatalogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacionInstagram" ADD CONSTRAINT "PublicacionInstagram_espejoFabricacionId_fkey" FOREIGN KEY ("espejoFabricacionId") REFERENCES "EspejoFabricacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
