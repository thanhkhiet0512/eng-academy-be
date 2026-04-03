import type { Exercise } from "../entities/exercise.entity";
import type { Lesson } from "../entities/lesson.entity";

export abstract class LessonRepositoryPort {
  abstract findById(id: string): Promise<Lesson | null>;
  abstract findByTeacherId(teacherId: string): Promise<Lesson[]>;
  abstract findByClassId(classId: string): Promise<Lesson[]>;
  abstract create(input: {
    teacherId: string;
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

  // Class assignments
  abstract assignToClass(classId: string, lessonId: string): Promise<void>;
  abstract removeFromClass(classId: string, lessonId: string): Promise<void>;
  abstract isAssignedToClass(classId: string, lessonId: string): Promise<boolean>;
  abstract findAssignedClassIds(lessonId: string): Promise<string[]>;
}
