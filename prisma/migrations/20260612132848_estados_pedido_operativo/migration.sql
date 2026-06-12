-- AlterEnum
BEGIN;
CREATE TYPE "EstadoPedido_new" AS ENUM ('SIN_PRESUPUESTAR', 'PRESUPUESTADO', 'PARA_FABRICAR', 'EN_FABRICACION', 'PARA_ENTREGAR', 'ENTREGADO');
ALTER TABLE "public"."Pedido" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "estado" TYPE "EstadoPedido_new" USING ("estado"::text::"EstadoPedido_new");
ALTER TYPE "EstadoPedido" RENAME TO "EstadoPedido_old";
ALTER TYPE "EstadoPedido_new" RENAME TO "EstadoPedido";
DROP TYPE "public"."EstadoPedido_old";
ALTER TABLE "Pedido" ALTER COLUMN "estado" SET DEFAULT 'SIN_PRESUPUESTAR';
COMMIT;

-- AlterTable
ALTER TABLE "Pedido" ALTER COLUMN "estado" SET DEFAULT 'SIN_PRESUPUESTAR';

