import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class DeleteLessonUseCase {
  constructor(
    private readonly lessons: LessonRepositoryPort,
    private readonly classes: ClassRepositoryPort,
  ) {}

  async execute(teacherId: string, lessonId: string) {
    const lesson = await this.lessons.findById(lessonId);
    if (!lesson) throw AppError.notFound("Bài học không tồn tại");

    const classroom = await this.classes.findById(lesson.classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Không có quyền");
    }

    await this.lessons.delete(lessonId);
    return { deleted: true };
  }
}
