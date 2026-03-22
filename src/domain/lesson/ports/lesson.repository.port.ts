import type { Exercise } from "../entities/exercise.entity";
import type { Lesson } from "../entities/lesson.entity";

export abstract class LessonRepositoryPort {
  abstract findById(id: string): Promise<Lesson | null>;
  abstract findByClassId(classId: string): Promise<Lesson[]>;
  abstract create(input: {
    classId: string;
    unitTitle: string;
    topic: string;
    coverImageUrl?: string | null;
    termIds: string[];
    exercises: Exercise[];
  }): Promise<Lesson>;
  abstract update(
    id: string,
    input: Partial<Pick<Lesson, "unitTitle" | "topic">>,
  ): Promise<Lesson>;
  abstract delete(id: string): Promise<void>;
}
