import { Injectable } from "@nestjs/common";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class DeleteLessonUseCase {
  constructor(private readonly lessons: LessonRepositoryPort) {}

  async execute(teacherId: string, lessonId: string) {
    const lesson = await this.lessons.findById(lessonId);
    if (!lesson) throw AppError.notFound("Bài học không tồn tại");
    if (lesson.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");

    await this.lessons.delete(lessonId);
    return { deleted: true };
  }
}
