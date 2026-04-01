import type { Prisma } from "@prisma/client";
import type { Exercise } from "../../../domain/lesson/entities/exercise.entity";
import type { Lesson } from "../../../domain/lesson/entities/lesson.entity";

export type LessonRow = {
  id: string;
  classId: string;
  unitTitle: string;
  topic: string;
  coverImageUrl: string | null;
  termIds: string[];
  questions: Prisma.JsonValue;
  createdAt: Date;
};

function normalizeStoredExercise(raw: unknown): Exercise {
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

export function mapLessonRowToDomain(row: LessonRow): Lesson {
  const raw = ((row.questions ?? []) as unknown[]) ?? [];
  const exercises = raw.map((e) => normalizeStoredExercise(e));

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
