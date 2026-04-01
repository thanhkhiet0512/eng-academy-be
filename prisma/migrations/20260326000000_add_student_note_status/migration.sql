-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "students" ADD COLUMN "note" TEXT;
ALTER TABLE "students" ADD COLUMN "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE';
