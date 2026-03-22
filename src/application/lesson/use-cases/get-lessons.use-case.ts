import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";

@Injectable()
export class GetLessonsUseCase {
  constructor(
    private readonly lessons: LessonRepositoryPort,
    private readonly classes: ClassRepositoryPort,
  ) {}

  async execute(teacherId: string, classId: string) {
    const classroom = await this.classes.findById(classId);
    if (!classroom) throw new NotFoundException("Lớp không tồn tại");
    if (classroom.teacherId !== teacherId) throw new ForbiddenException("Không có quyền");

    const lessons = await this.lessons.findByClassId(classId);
    return { lessons };
  }

  async executeOne(teacherId: string, lessonId: string) {
    const lesson = await this.lessons.findById(lessonId);
    if (!lesson) throw new NotFoundException("Bài học không tồn tại");

    const classroom = await this.classes.findById(lesson.classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw new ForbiddenException("Không có quyền");
    }

    return lesson;
  }
}
