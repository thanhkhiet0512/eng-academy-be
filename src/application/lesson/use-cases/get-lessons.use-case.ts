import { Injectable } from "@nestjs/common";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class GetLessonsUseCase {
  constructor(
    private readonly lessons: LessonRepositoryPort,
    private readonly classes: ClassRepositoryPort,
  ) {}

  // All lessons owned by teacher (library view)
  async execute(teacherId: string) {
    const lessons = await this.lessons.findByTeacherId(teacherId);
    return { lessons };
  }

  // Lessons assigned to a specific class
  async executeByClass(teacherId: string, classId: string) {
    const classroom = await this.classes.findById(classId);
    if (!classroom) throw AppError.notFound("Lớp không tồn tại");
    if (classroom.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");
    const lessons = await this.lessons.findByClassId(classId);
    return { lessons };
  }

  async executeOne(teacherId: string, lessonId: string) {
    const lesson = await this.lessons.findById(lessonId);
    if (!lesson) throw AppError.notFound("Bài học không tồn tại");
    if (lesson.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");
    return lesson;
  }

  async assignToClass(teacherId: string, classId: string, lessonId: string) {
    const lesson = await this.lessons.findById(lessonId);
    if (!lesson) throw AppError.notFound("Bài học không tồn tại");
    if (lesson.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");

    const classroom = await this.classes.findById(classId);
    if (!classroom) throw AppError.notFound("Lớp không tồn tại");
    if (classroom.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");

    await this.lessons.assignToClass(classId, lessonId);
    return { ok: true };
  }

  async removeFromClass(teacherId: string, classId: string, lessonId: string) {
    const lesson = await this.lessons.findById(lessonId);
    if (!lesson) throw AppError.notFound("Bài học không tồn tại");
    if (lesson.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");

    await this.lessons.removeFromClass(classId, lessonId);
    return { ok: true };
  }
}
