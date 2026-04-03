import { Injectable } from "@nestjs/common";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import type { UpdateLessonDto } from "../dtos/create-lesson.dto";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class UpdateLessonUseCase {
  constructor(private readonly lessons: LessonRepositoryPort) {}

  async execute(teacherId: string, lessonId: string, dto: UpdateLessonDto) {
    const lesson = await this.lessons.findById(lessonId);
    if (!lesson) throw AppError.notFound("Bài học không tồn tại");
    if (lesson.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");

    return this.lessons.update(lessonId, dto);
  }
}
