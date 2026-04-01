import { Injectable } from "@nestjs/common";
import type { Exercise } from "../../../domain/lesson/entities/exercise.entity";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class GetLessonForStudentUseCase {
  constructor(
    private readonly lessons: LessonRepositoryPort,
    private readonly students: StudentRepositoryPort,
  ) {}

  async execute(lessonId: string, studentId: string) {
    const student = await this.students.findById(studentId);
    if (!student) throw AppError.notFound("Học sinh không tồn tại");

    const lesson = await this.lessons.findById(lessonId);
    if (!lesson) throw AppError.notFound("Bài học không tồn tại");

    if (student.classId !== lesson.classId) {
      throw AppError.forbidden("Bài học không thuộc lớp của bạn");
    }

    return {
      id: lesson.id,
      unitTitle: lesson.unitTitle,
      topic: lesson.topic,
      coverImageUrl: lesson.coverImageUrl,
      exercises: lesson.exercises.map((e) => this.sanitize(e)),
    };
  }

  private sanitize(exercise: Exercise): object {
    switch (exercise.type) {
      case "multiple_choice":
        return {
          id: exercise.id,
          type: exercise.type,
          prompt: exercise.prompt,
          choices: exercise.choices,
        };

      case "matching": {
        const rightItems = exercise.pairs
          .map((p, i) => ({ text: p.right, origIndex: i }))
          .sort(() => Math.random() - 0.5);
        return {
          id: exercise.id,
          type: exercise.type,
          leftItems: exercise.pairs.map((p, i) => ({ index: i, text: p.left })),
          rightItems,
        };
      }

      case "fill_blank":
        return {
          id: exercise.id,
          type: exercise.type,
          sentence: exercise.sentence,
          hint: exercise.hint,
        };

      case "word_arrangement": {
        return {
          id: exercise.id,
          type: exercise.type,
          // Giữ thứ tự gốc để student gửi bankIndex ổn định cho grading.
          words: exercise.words,
        };
      }
    }
  }
}
