import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import type { Exercise } from "../../../domain/lesson/entities/exercise.entity";
import type { Lesson } from "../../../domain/lesson/entities/lesson.entity";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { mapLessonRowToDomain } from "./lesson.mapper";

@Injectable()
export class LessonRepositoryAdapter extends LessonRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Lesson | null> {
    const row = await this.prisma.lesson.findUnique({ where: { id } });
    return row ? mapLessonRowToDomain(row) : null;
  }

  async findByTeacherId(teacherId: string): Promise<Lesson[]> {
    const rows = await this.prisma.lesson.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => mapLessonRowToDomain(r));
  }

  async findByClassId(classId: string): Promise<Lesson[]> {
    const classLessons = await this.prisma.classLesson.findMany({
      where: { classId },
      include: { lesson: true },
      orderBy: { createdAt: "desc" },
    });
    return classLessons.map((cl) => mapLessonRowToDomain(cl.lesson));
  }

  async create(input: {
    teacherId: string;
    unitTitle: string;
    topic: string;
    coverImageUrl?: string | null;
    termIds: string[];
    exercises: Exercise[];
  }): Promise<Lesson> {
    const row = await this.prisma.lesson.create({
      data: {
        teacherId: input.teacherId,
        unitTitle: input.unitTitle,
        topic: input.topic,
        coverImageUrl: input.coverImageUrl,
        termIds: input.termIds,
        questions: input.exercises as unknown as Prisma.InputJsonValue,
      },
    });
    return mapLessonRowToDomain(row);
  }

  async update(
    id: string,
    input: Partial<Pick<Lesson, "unitTitle" | "topic">>,
  ): Promise<Lesson> {
    const row = await this.prisma.lesson.update({ where: { id }, data: input });
    return mapLessonRowToDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lesson.delete({ where: { id } });
  }

  async assignToClass(classId: string, lessonId: string): Promise<void> {
    await this.prisma.classLesson.upsert({
      where: { classId_lessonId: { classId, lessonId } },
      create: { classId, lessonId },
      update: {},
    });
  }

  async removeFromClass(classId: string, lessonId: string): Promise<void> {
    await this.prisma.classLesson.deleteMany({ where: { classId, lessonId } });
  }

  async isAssignedToClass(classId: string, lessonId: string): Promise<boolean> {
    const row = await this.prisma.classLesson.findUnique({
      where: { classId_lessonId: { classId, lessonId } },
    });
    return row !== null;
  }

  async findAssignedClassIds(lessonId: string): Promise<string[]> {
    const rows = await this.prisma.classLesson.findMany({ where: { lessonId } });
    return rows.map((r) => r.classId);
  }
}
