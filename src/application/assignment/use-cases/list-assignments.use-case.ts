import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { AssignmentRepositoryPort } from "../../../domain/assignment/ports/assignment.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class ListAssignmentsUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly assignments: AssignmentRepositoryPort,
    private readonly lessons: LessonRepositoryPort,
  ) {}

  async execute(classId: string, teacherId: string) {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const [assignmentList, lessonList] = await Promise.all([
      this.assignments.findByClassId(classId),
      this.lessons.findByClassId(classId),
    ]);

    const lessonMap = new Map(lessonList.map((l) => [l.id, l]));
    const now = new Date();

    return {
      assignments: assignmentList.map((a) => {
        const lesson = lessonMap.get(a.lessonId);
        const isOverdue = a.status === "ACTIVE" && a.dueDate < now;
        return {
          id: a.id,
          title: a.title,
          description: a.description,
          lessonId: a.lessonId,
          lessonTitle: lesson?.unitTitle ?? "Bài đã xóa",
          lessonTopic: lesson?.topic ?? "",
          dueDate: a.dueDate.toISOString(),
          maxAttempts: a.maxAttempts,
          status: a.status,
          isOverdue,
          createdAt: a.createdAt.toISOString(),
        };
      }),
    };
  }
}
