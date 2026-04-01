-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "status" "ClassStatus" NOT NULL DEFAULT 'ACTIVE';
