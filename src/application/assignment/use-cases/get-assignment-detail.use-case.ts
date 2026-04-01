import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AssignmentRepositoryPort } from "../../../domain/assignment/ports/assignment.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class GetAssignmentDetailUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
    private readonly assignments: AssignmentRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly lessons: LessonRepositoryPort,
  ) {}

  async execute(assignmentId: string, teacherId: string) {
    const assignment = await this.assignments.findById(assignmentId);
    if (!assignment) throw AppError.notFound("Bài tập không tồn tại");

    const classroom = await this.classes.findById(assignment.classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền");
    }

    const lesson = await this.lessons.findById(assignment.lessonId);

    const [studentList, attemptList] = await Promise.all([
      this.students.findByClassId(assignment.classId),
      this.attempts.findByClassId(assignment.classId),
    ]);

    const now = new Date();
    const isOverdue = assignment.status === "ACTIVE" && assignment.dueDate < now;

    // Filter attempts for this lesson, created after assignment was created
    const relevantAttempts = attemptList.filter(
      (a) => a.lessonId === assignment.lessonId && a.createdAt >= assignment.createdAt,
    );

    const submissions = studentList
      .filter((s) => s.status === "ACTIVE")
      .map((s) => {
        const studentAttempts = relevantAttempts
          .filter((a) => a.studentId === s.id)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const bestAttempt = studentAttempts.length
          ? studentAttempts.reduce((best, cur) =>
              cur.total && (cur.score / cur.total) > (best.score / best.total) ? cur : best,
            )
          : null;

        let submissionStatus: "completed" | "pending" | "overdue";
        if (studentAttempts.length > 0) {
          submissionStatus = "completed";
        } else if (isOverdue) {
          submissionStatus = "overdue";
        } else {
          submissionStatus = "pending";
        }

        return {
          studentId: s.id,
          studentName: s.name,
          studentCode: s.code ?? "",
          attemptCount: studentAttempts.length,
          bestScore: bestAttempt ? bestAttempt.score : null,
          bestTotal: bestAttempt ? bestAttempt.total : null,
          bestPercent: bestAttempt && bestAttempt.total
            ? Math.round((bestAttempt.score / bestAttempt.total) * 100)
            : null,
          lastAttemptAt: studentAttempts[0]?.createdAt.toISOString() ?? null,
          status: submissionStatus,
        };
      });

    const completedCount = submissions.filter((s) => s.status === "completed").length;
    const pendingCount = submissions.filter((s) => s.status === "pending").length;
    const overdueCount = submissions.filter((s) => s.status === "overdue").length;

    return {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      lessonId: assignment.lessonId,
      lessonTitle: lesson?.unitTitle ?? "Bài đã xóa",
      lessonTopic: lesson?.topic ?? "",
      dueDate: assignment.dueDate.toISOString(),
      maxAttempts: assignment.maxAttempts,
      status: assignment.status,
      isOverdue,
      createdAt: assignment.createdAt.toISOString(),
      summary: { completedCount, pendingCount, overdueCount, totalStudents: submissions.length },
      submissions,
    };
  }
}
