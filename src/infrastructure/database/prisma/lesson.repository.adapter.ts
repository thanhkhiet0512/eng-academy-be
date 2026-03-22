import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import type { Exercise } from "../../../domain/lesson/entities/exercise.entity";
import type { Lesson } from "../../../domain/lesson/entities/lesson.entity";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";

@Injectable()
export class LessonRepositoryAdapter extends LessonRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Lesson | null> {
    const row = await this.prisma.lesson.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findByClassId(classId: string): Promise<Lesson[]> {
    const rows = await this.prisma.lesson.findMany({
      where: { classId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => this.map(r));
  }

  async create(input: {
    classId: string;
    unitTitle: string;
    topic: string;
    coverImageUrl?: string | null;
    termIds: string[];
    exercises: Exercise[];
  }): Promise<Lesson> {
    const row = await this.prisma.lesson.create({
      data: {
        classId: input.classId,
        unitTitle: input.unitTitle,
        topic: input.topic,
        coverImageUrl: input.coverImageUrl,
        termIds: input.termIds,
        questions: input.exercises as unknown as Prisma.InputJsonValue,
      },
    });
    return this.map(row);
  }

  async update(
    id: string,
    input: Partial<Pick<Lesson, "unitTitle" | "topic">>,
  ): Promise<Lesson> {
    const row = await this.prisma.lesson.update({ where: { id }, data: input });
    return this.map(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lesson.delete({ where: { id } });
  }

  private map(row: {
    id: string;
    classId: string;
    unitTitle: string;
    topic: string;
    coverImageUrl: string | null;
    termIds: string[];
    questions: Prisma.JsonValue;
    createdAt: Date;
  }): Lesson {
    const raw = ((row.questions ?? []) as unknown[]) ?? [];
    const exercises = raw.map((e) => this.normalizeStoredExercise(e));

    return {
      id: row.id,
      classId: row.classId,
      unitTitle: row.unitTitle,
      topic: row.topic,
      coverImageUrl: row.coverImageUrl,
      termIds: row.termIds,
      exercises,
      createdAt: row.createdAt,
    };
  }

  private normalizeStoredExercise(raw: unknown): Exercise {
    const x = raw as Record<string, unknown>;
    const t = x.type;
    if (
      t === "multiple_choice" ||
      t === "matching" ||
      t === "fill_blank" ||
      t === "word_arrangement"
    ) {
      return x as Exercise;
    }
    return { ...x, type: "multiple_choice" } as Exercise;
  }
}
