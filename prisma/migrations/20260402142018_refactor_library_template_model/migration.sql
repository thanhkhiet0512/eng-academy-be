/*
  Warnings:

  - You are about to drop the column `class_id` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the `assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `terms` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `teacher_id` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_class_id_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_class_id_fkey";

-- DropForeignKey
ALTER TABLE "terms" DROP CONSTRAINT "terms_class_id_fkey";

-- DropIndex
DROP INDEX "lessons_class_id_idx";

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "class_id",
ADD COLUMN     "teacher_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "assignments";

-- DropTable
DROP TABLE "terms";

-- DropEnum
DROP TYPE "AssignmentStatus";

-- CreateTable
CREATE TABLE "vocabulary_units" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocabulary_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_terms" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "word_en" TEXT NOT NULL,
    "word_vi" TEXT NOT NULL,
    "image_url" TEXT,
    "audio_url" TEXT,
    "example_sentence" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocabulary_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_units" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_lessons" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration_minutes" INTEGER NOT NULL,
    "questions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_lessons" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,

    CONSTRAINT "exam_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_exams" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "max_attempts" INTEGER NOT NULL DEFAULT 1,
    "status" "ExamStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "score_x100" INTEGER NOT NULL,
    "total_x100" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vocabulary_units_teacher_id_idx" ON "vocabulary_units"("teacher_id");

-- CreateIndex
CREATE INDEX "vocabulary_terms_unit_id_idx" ON "vocabulary_terms"("unit_id");

-- CreateIndex
CREATE INDEX "class_units_class_id_idx" ON "class_units"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "class_units_class_id_unit_id_key" ON "class_units"("class_id", "unit_id");

-- CreateIndex
CREATE INDEX "class_lessons_class_id_idx" ON "class_lessons"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "class_lessons_class_id_lesson_id_key" ON "class_lessons"("class_id", "lesson_id");

-- CreateIndex
CREATE INDEX "exams_teacher_id_idx" ON "exams"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_lessons_exam_id_lesson_id_key" ON "exam_lessons"("exam_id", "lesson_id");

-- CreateIndex
CREATE INDEX "class_exams_class_id_idx" ON "class_exams"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "class_exams_class_id_exam_id_key" ON "class_exams"("class_id", "exam_id");

-- CreateIndex
CREATE INDEX "exam_attempts_student_id_idx" ON "exam_attempts"("student_id");

-- CreateIndex
CREATE INDEX "exam_attempts_class_id_idx" ON "exam_attempts"("class_id");

-- CreateIndex
CREATE INDEX "exam_attempts_exam_id_idx" ON "exam_attempts"("exam_id");

-- CreateIndex
CREATE INDEX "lessons_teacher_id_idx" ON "lessons"("teacher_id");

-- AddForeignKey
ALTER TABLE "vocabulary_units" ADD CONSTRAINT "vocabulary_units_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_terms" ADD CONSTRAINT "vocabulary_terms_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "vocabulary_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_units" ADD CONSTRAINT "class_units_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_units" ADD CONSTRAINT "class_units_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "vocabulary_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_lessons" ADD CONSTRAINT "class_lessons_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_lessons" ADD CONSTRAINT "class_lessons_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_lessons" ADD CONSTRAINT "exam_lessons_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_lessons" ADD CONSTRAINT "exam_lessons_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_exams" ADD CONSTRAINT "class_exams_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_exams" ADD CONSTRAINT "class_exams_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
