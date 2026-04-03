import { Injectable } from "@nestjs/common";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { UnitRepositoryPort } from "../../../domain/unit/ports/unit.repository.port";
import { UserRepositoryPort } from "../../../domain/auth/ports/user.repository.port";
import { AppError } from "../../../common/errors/app.error";

// Use case: return the parent dashboard for a given student (public, no auth)
@Injectable()
export class GetParentDashboardUseCase {
  constructor(
    private readonly students: StudentRepositoryPort,
    private readonly classes: ClassRepositoryPort,
    private readonly lessons: LessonRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly units: UnitRepositoryPort,
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(studentId: string) {
    const student = await this.students.findById(studentId.trim());
    if (!student) throw AppError.notFound("Không tìm thấy học sinh");

    const [classroom, lessonList, attemptList, vocabCount] = await Promise.all([
      this.classes.findById(student.classId),
      this.lessons.findByClassId(student.classId),
      this.attempts.findByStudentId(student.id),
      this.units.countTermsByClassId(student.classId),
    ]);

    // Resolve teacher name from the class's teacherId
    let teacherName: string | null = null;
    if (classroom?.teacherId) {
      const teacher = await this.users.findById(classroom.teacherId);
      teacherName = teacher?.name ?? null;
    }

    const latestByLesson = new Map<string, (typeof attemptList)[number]>();
    for (const attempt of attemptList) {
      if (!latestByLesson.has(attempt.lessonId)) latestByLesson.set(attempt.lessonId, attempt);
    }

    const lessonIds = [...new Set(attemptList.map((x) => x.lessonId))];
    const attemptedLessons =
      lessonIds.length > 0
        ? await Promise.all(lessonIds.map((id) => this.lessons.findById(id)))
        : [];
    const titleById = new Map(attemptedLessons.filter(Boolean).map((x) => [x!.id, x!]));

    const avg =
      attemptList.length > 0
        ? Math.round(
            (attemptList.reduce((sum, x) => sum + (x.total ? (x.score / x.total) * 100 : 0), 0) /
              attemptList.length) *
              10,
          ) / 10
        : 0;

    const nextLessonRaw = lessonList.find((x) => !latestByLesson.has(x.id)) ?? lessonList[0] ?? null;
    const lessonsOverview = lessonList.map((x) => {
      const att = latestByLesson.get(x.id);
      return {
        id: x.id,
        unitTitle: x.unitTitle,
        topic: x.topic,
        lastAttempt: att
          ? { score: att.score, total: att.total, percent: att.total ? Math.round((att.score / att.total) * 100) : 0, at: att.createdAt }
          : null,
      };
    });

    const recentAttempts = attemptList.slice(0, 15).map((x) => {
      const lesson = titleById.get(x.lessonId);
      return {
        lessonId: x.lessonId,
        lessonTitle: lesson?.unitTitle ?? "Bài học",
        topic: lesson?.topic ?? "",
        score: x.score,
        total: x.total,
        percent: x.total ? Math.round((x.score / x.total) * 100) : 0,
        createdAt: x.createdAt,
      };
    });

    return {
      studentName: student.name,
      studentCode: student.code ?? "",
      className: classroom?.name ?? "",
      classCode: classroom?.code ?? "",
      teacherName,
      progressPercent: Math.round(avg),
      vocabCount,
      lessonCount: lessonList.length,
      attemptsTotal: attemptList.length,
      nextLesson: nextLessonRaw
        ? { id: nextLessonRaw.id, unitTitle: nextLessonRaw.unitTitle, topic: nextLessonRaw.topic }
        : null,
      lessonsOverview,
      recentAttempts,
      teacherMessage:
        "Cảm ơn phụ huynh đã đồng hành cùng con. Mọi thắc mắc xin trao đổi trực tiếp với giáo viên.",
    };
  }
}
