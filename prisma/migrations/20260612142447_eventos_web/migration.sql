-- CreateEnum
CREATE TYPE "TipoEventoWeb" AS ENUM ('PAGEVIEW', 'WHATSAPP_CLICK', 'INSTAGRAM_CLICK', 'PEDIDO_WEB');

-- CreateTable
CREATE TABLE "EventoWeb" (
    "id" TEXT NOT NULL,
    "tipo" "TipoEventoWeb" NOT NULL DEFAULT 'PAGEVIEW',
    "path" TEXT,
    "fuente" TEXT,
    "visitante" TEXT,
    "ciudad" TEXT,
    "region" TEXT,
    "pais" TEXT,
    "valor" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoWeb_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventoWeb_tipo_createdAt_idx" ON "EventoWeb"("tipo", "createdAt");

-- CreateIndex
CREATE INDEX "EventoWeb_createdAt_idx" ON "EventoWeb"("createdAt");

