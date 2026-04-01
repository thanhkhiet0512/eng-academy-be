import { Injectable } from "@nestjs/common";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AssignmentRepositoryPort } from "../../../domain/assignment/ports/assignment.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class GetStudentAssignmentsUseCase {
  constructor(
    private readonly students: StudentRepositoryPort,
    private readonly assignments: AssignmentRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly lessons: LessonRepositoryPort,
  ) {}

  async execute(studentId: string) {
    const student = await this.students.findById(studentId);
    if (!student) throw AppError.notFound("Học sinh không tồn tại");

    const [assignmentList, attemptList, lessonList] = await Promise.all([
      this.assignments.findByClassId(student.classId),
      this.attempts.findByStudentId(studentId),
      this.lessons.findByClassId(student.classId),
    ]);

    const lessonMap = new Map(lessonList.map((l) => [l.id, l]));
    const now = new Date();

    // Only show ACTIVE assignments
    const activeAssignments = assignmentList.filter((a) => a.status === "ACTIVE");

    const items = activeAssignments.map((a) => {
      const lesson = lessonMap.get(a.lessonId);
      const studentAttempts = attemptList.filter(
        (att) => att.lessonId === a.lessonId && att.createdAt >= a.createdAt,
      );

      const isOverdue = a.dueDate < now;
      const isCompleted = studentAttempts.length > 0;
      const canRetry = studentAttempts.length < a.maxAttempts;

      const bestAttempt = studentAttempts.length
        ? studentAttempts.reduce((best, cur) =>
            cur.total && (cur.score / cur.total) > (best.score / best.total) ? cur : best,
          )
        : null;

      let displayStatus: "completed" | "pending" | "overdue";
      if (isCompleted) {
        displayStatus = "completed";
      } else if (isOverdue) {
        displayStatus = "overdue";
      } else {
        displayStatus = "pending";
      }

      // Days remaining
      const msLeft = a.dueDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        lessonId: a.lessonId,
        lessonTitle: lesson?.unitTitle ?? "Bài đã xóa",
        lessonTopic: lesson?.topic ?? "",
        dueDate: a.dueDate.toISOString(),
        daysLeft: isOverdue ? 0 : daysLeft,
        maxAttempts: a.maxAttempts,
        attemptCount: studentAttempts.length,
        canRetry: !isCompleted || canRetry,
        bestScore: bestAttempt?.score ?? null,
        bestTotal: bestAttempt?.total ?? null,
        bestPercent: bestAttempt && bestAttempt.total
          ? Math.round((bestAttempt.score / bestAttempt.total) * 100)
          : null,
        status: displayStatus,
      };
    });

    // Sort: overdue first, then pending (by dueDate asc), then completed
    const statusOrder = { overdue: 0, pending: 1, completed: 2 };
    items.sort((a, b) => {
      const so = statusOrder[a.status] - statusOrder[b.status];
      if (so !== 0) return so;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return { assignments: items };
  }
}
