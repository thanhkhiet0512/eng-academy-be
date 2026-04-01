import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class GetLessonsUseCase {
  constructor(
    private readonly lessons: LessonRepositoryPort,
    private readonly classes: ClassRepositoryPort,
  ) {}

  async execute(teacherId: string, classId: string) {
    const classroom = await this.classes.findById(classId);
    if (!classroom) throw AppError.notFound("Lớp không tồn tại");
    if (classroom.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");

    const lessons = await this.lessons.findByClassId(classId);
    return { lessons };
  }

  async executeOne(teacherId: string, lessonId: string) {
    const lesson = await this.lessons.findById(lessonId);
    if (!lesson) throw AppError.notFound("Bài học không tồn tại");

    const classroom = await this.classes.findById(lesson.classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Không có quyền");
    }

    return lesson;
  }
}
