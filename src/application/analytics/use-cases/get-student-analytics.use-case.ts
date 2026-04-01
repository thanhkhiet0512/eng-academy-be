import { Injectable } from "@nestjs/common";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { AppError } from "../../../common/errors/app.error";

const WEAK_AREA_SCORE_THRESHOLD = 70;
const MAX_WEAK_AREAS = 5;

@Injectable()
export class GetStudentAnalyticsUseCase {
  constructor(
    private readonly students: StudentRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly lessons: LessonRepositoryPort,
  ) {}

  async execute(studentId: string) {
    const student = await this.students.findById(studentId);
    if (!student) throw AppError.notFound("Học sinh không tồn tại");

    const [attemptList, lessonList, classmateList] = await Promise.all([
      this.attempts.findByStudentId(studentId),
      this.lessons.findByClassId(student.classId),
      this.students.findByClassId(student.classId),
    ]);

    // All class attempts for percentile
    const allClassAttempts = await this.attempts.findByClassId(student.classId);

    const lessonMap = new Map(lessonList.map((l) => [l.id, l]));
    const now = new Date();

    // Overall avg
    const overallAvg =
      attemptList.length === 0
        ? 0
        : Math.round(
            (attemptList.reduce((sum, a) => sum + (a.total ? (a.score / a.total) * 100 : 0), 0) /
              attemptList.length) *
              10,
          ) / 10;

    // Class avg for comparison
    const classAvg =
      allClassAttempts.length === 0
        ? 0
        : Math.round(
            (allClassAttempts.reduce(
              (sum, a) => sum + (a.total ? (a.score / a.total) * 100 : 0),
              0,
            ) /
              allClassAttempts.length) *
              10,
          ) / 10;

    // Rank in class
    const activeClassmates = classmateList.filter((s) => s.status === "ACTIVE");
    const classmateAvgs = activeClassmates.map((s) => {
      const sa = allClassAttempts.filter((a) => a.studentId === s.id);
      return {
        studentId: s.id,
        avg:
          sa.length === 0
            ? 0
            : sa.reduce((sum, a) => sum + (a.total ? (a.score / a.total) * 100 : 0), 0) / sa.length,
      };
    });
    classmateAvgs.sort((a, b) => b.avg - a.avg);
    const rank = classmateAvgs.findIndex((c) => c.studentId === studentId) + 1;

    // Weekly averages (last 8 weeks) for trend chart
    const weeklyTrend: { weekStart: string; avg: number; count: number }[] = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekAttempts = attemptList.filter((a) => a.createdAt >= weekStart && a.createdAt < weekEnd);
      const weekAvg =
        weekAttempts.length === 0
          ? 0
          : Math.round(
              (weekAttempts.reduce((sum, a) => sum + (a.total ? (a.score / a.total) * 100 : 0), 0) /
                weekAttempts.length) *
                10,
            ) / 10;
      weeklyTrend.push({
        weekStart: weekStart.toISOString().split("T")[0],
        avg: weekAvg,
        count: weekAttempts.length,
      });
    }

    // Per-lesson performance (weak areas)
    const lessonPerf = lessonList.map((l) => {
      const la = attemptList.filter((a) => a.lessonId === l.id);
      const avg =
        la.length === 0
          ? null
          : Math.round(
              (la.reduce((sum, a) => sum + (a.total ? (a.score / a.total) * 100 : 0), 0) / la.length) * 10,
            ) / 10;
      return {
        lessonId: l.id,
        title: l.unitTitle,
        topic: l.topic,
        avgScore: avg,
        attempts: la.length,
      };
    }).filter((l) => l.attempts > 0);

    // Sort weak areas: lowest avg first
    const weakAreas = [...lessonPerf]
      .filter((l) => l.avgScore !== null && l.avgScore < WEAK_AREA_SCORE_THRESHOLD)
      .sort((a, b) => (a.avgScore ?? 0) - (b.avgScore ?? 0))
      .slice(0, MAX_WEAK_AREAS);

    // Streak
    let streak = 0;
    const attemptDates = new Set(attemptList.map((a) => a.createdAt.toISOString().split("T")[0]));
    for (let i = 0; i <= 365; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const ds = d.toISOString().split("T")[0];
      if (attemptDates.has(ds)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      studentName: student.name,
      overallAvg,
      classAvg,
      rank,
      totalInClass: activeClassmates.length,
      totalAttempts: attemptList.length,
      streak,
      weeklyTrend,
      weakAreas,
      lessonPerformance: lessonPerf,
    };
  }
}
