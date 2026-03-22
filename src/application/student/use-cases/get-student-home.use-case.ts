import { Injectable, NotFoundException } from "@nestjs/common";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";

// Use case: return the home page payload for a student (public, no auth)
@Injectable()
export class GetStudentHomeUseCase {
  constructor(
    private readonly students: StudentRepositoryPort,
    private readonly classes: ClassRepositoryPort,
    private readonly lessons: LessonRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
  ) {}

  async execute(studentId: string) {
    const student = await this.students.findById(studentId.trim());
    if (!student) throw new NotFoundException("Không tìm thấy học sinh");

    const [classroom, lessonList, attemptList] = await Promise.all([
      this.classes.findById(student.classId),
      this.lessons.findByClassId(student.classId),
      this.attempts.findByStudentId(student.id),
    ]);

    // Keep only the latest attempt per lesson
    const latestByLesson = new Map<string, (typeof attemptList)[number]>();
    for (const attempt of attemptList) {
      if (!latestByLesson.has(attempt.lessonId)) latestByLesson.set(attempt.lessonId, attempt);
    }

    const lessonRows = lessonList.map((x) => {
      const att = latestByLesson.get(x.id);
      return {
        id: x.id,
        unitTitle: x.unitTitle,
        topic: x.topic,
        coverImageUrl: x.coverImageUrl,
        createdAt: x.createdAt,
        lastAttempt: att
          ? {
              score: att.score,
              total: att.total,
              percent: att.total ? Math.round((att.score / att.total) * 100) : 0,
              at: att.createdAt,
            }
          : null,
      };
    });

    // Suggest the first lesson not yet attempted; fall back to the latest lesson
    const nextLessonRaw = lessonList.find((x) => !latestByLesson.has(x.id)) ?? lessonList[0] ?? null;
    const avg =
      attemptList.length > 0
        ? Math.round(
            (attemptList.reduce((sum, x) => sum + (x.total ? (x.score / x.total) * 100 : 0), 0) /
              attemptList.length) *
              10,
          ) / 10
        : 0;

    return {
      studentId: student.id,
      studentName: student.name,
      studentCode: student.code ?? "",
      classId: student.classId,
      className: classroom?.name ?? "",
      classCode: classroom?.code ?? "",
      progressPercent: Math.round(avg),
      lessons: lessonRows,
      nextLesson: nextLessonRaw
        ? {
            id: nextLessonRaw.id,
            unitTitle: nextLessonRaw.unitTitle,
            topic: nextLessonRaw.topic,
            coverImageUrl: nextLessonRaw.coverImageUrl,
          }
        : null,
    };
  }
}
