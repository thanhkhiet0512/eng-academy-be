import type { Attempt } from "../entities/attempt.entity";

export abstract class AttemptRepositoryPort {
  abstract create(input: {
    studentId: string;
    classId: string;
    lessonId: string;
    score: number;
    total: number;
  }): Promise<Attempt>;
  abstract findByStudentId(studentId: string): Promise<Attempt[]>;
}
