import type { AssignmentEntity, AssignmentStatus } from "../entities/assignment.entity";

export abstract class AssignmentRepositoryPort {
  abstract create(input: {
    classId: string;
    lessonId: string;
    title: string;
    description?: string | null;
    dueDate: Date;
    maxAttempts?: number;
  }): Promise<AssignmentEntity>;

  abstract findById(id: string): Promise<AssignmentEntity | null>;
  abstract findByClassId(classId: string): Promise<AssignmentEntity[]>;
  abstract findByLessonId(lessonId: string): Promise<AssignmentEntity[]>;

  abstract update(
    id: string,
    input: Partial<{
      title: string;
      description: string | null;
      dueDate: Date;
      maxAttempts: number;
      status: AssignmentStatus;
    }>,
  ): Promise<AssignmentEntity>;

  abstract delete(id: string): Promise<void>;
}
