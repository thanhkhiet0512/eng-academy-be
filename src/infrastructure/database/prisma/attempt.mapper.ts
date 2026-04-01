import type { Attempt } from "../../../domain/lesson/entities/attempt.entity";

export type AttemptRow = {
  id: string;
  studentId: string;
  classId: string;
  lessonId: string;
  score: number;
  total: number;
  createdAt: Date;
};

export function mapAttemptRowToDomain(row: AttemptRow): Attempt {
  return {
    id: row.id,
    studentId: row.studentId,
    classId: row.classId,
    lessonId: row.lessonId,
    score: row.score,
    total: row.total,
    createdAt: row.createdAt,
  };
}
