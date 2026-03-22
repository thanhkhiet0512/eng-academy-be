import { Injectable, NotFoundException } from "@nestjs/common";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";

// Use case: return the full attempt history and overall progress for a student (public, no auth)
@Injectable()
export class GetStudentProgressUseCase {
  constructor(
    private readonly students: StudentRepositoryPort,
    private readonly lessons: LessonRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
  ) {}

  async execute(studentId: string) {
    const student = await this.students.findById(studentId.trim());
    if (!student) throw new NotFoundException("Không tìm thấy học sinh");

    const attemptList = await this.attempts.findByStudentId(student.id);
    const lessonIds = [...new Set(attemptList.map((x) => x.lessonId))];

    // Batch-fetch only the lessons that have attempts
    const lessonList =
      lessonIds.length > 0
        ? await Promise.all(lessonIds.map((id) => this.lessons.findById(id)))
        : [];
    const lessonById = new Map(
      lessonList.filter(Boolean).map((x) => [x!.id, x!]),
    );

    const history = attemptList.map((x) => {
      const lesson = lessonById.get(x.lessonId);
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

    const overall =
      attemptList.length === 0
        ? 0
        : Math.round(
            (attemptList.reduce((sum, x) => sum + (x.total ? (x.score / x.total) * 100 : 0), 0) /
              attemptList.length) *
              10,
          ) / 10;

    return { overall, history };
  }
}
