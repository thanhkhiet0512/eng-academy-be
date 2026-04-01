import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { AssignmentRepositoryPort } from "../../../domain/assignment/ports/assignment.repository.port";
import { AppError } from "../../../common/errors/app.error";

export type CreateAssignmentInput = {
  classId: string;
  lessonId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  maxAttempts?: number;
};

@Injectable()
export class CreateAssignmentUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly lessons: LessonRepositoryPort,
    private readonly assignments: AssignmentRepositoryPort,
  ) {}

  async execute(teacherId: string, input: CreateAssignmentInput) {
    const classroom = await this.classes.findById(input.classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const lesson = await this.lessons.findById(input.lessonId);
    if (!lesson || lesson.classId !== input.classId) {
      throw AppError.notFound("Bài học không thuộc lớp này");
    }

    const assignment = await this.assignments.create({
      classId: input.classId,
      lessonId: input.lessonId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      dueDate: new Date(input.dueDate),
      maxAttempts: input.maxAttempts ?? 1,
    });

    return {
      id: assignment.id,
      title: assignment.title,
      lessonTitle: lesson.unitTitle,
      dueDate: assignment.dueDate.toISOString(),
    };
  }
}
