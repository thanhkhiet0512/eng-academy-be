import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { AppError } from "../../../common/errors/app.error";

type Period = "week" | "month" | "all";

@Injectable()
export class GetLeaderboardUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
  ) {}

  async execute(classId: string, teacherId: string, period: Period = "all") {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const [studentList, attemptList] = await Promise.all([
      this.students.findByClassId(classId),
      this.attempts.findByClassId(classId),
    ]);

    const now = new Date();
    let cutoff: Date | null = null;
    if (period === "week") {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filteredAttempts = cutoff
      ? attemptList.filter((a) => a.createdAt >= cutoff!)
      : attemptList;

    const activeStudents = studentList.filter((s) => s.status === "ACTIVE");

    const leaderboard = activeStudents
      .map((s) => {
        const studentAttempts = filteredAttempts.filter((a) => a.studentId === s.id);
        const avgScore =
          studentAttempts.length === 0
            ? 0
            : Math.round(
                (studentAttempts.reduce(
                  (sum, a) => sum + (a.total ? (a.score / a.total) * 100 : 0),
                  0,
                ) /
                  studentAttempts.length) *
                  10,
              ) / 10;

        // Streak: consecutive days with at least 1 attempt (from today backwards)
        let streak = 0;
        if (studentAttempts.length > 0) {
          const attemptDates = new Set(
            studentAttempts.map((a) => a.createdAt.toISOString().split("T")[0]),
          );
          for (let i = 0; i <= 365; i++) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const ds = d.toISOString().split("T")[0];
            if (attemptDates.has(ds)) {
              streak++;
            } else if (i > 0) {
              // Allow skipping today if no attempts yet
              break;
            }
          }
        }

        return {
          studentId: s.id,
          name: s.name,
          code: s.code ?? "",
          avgScore,
          totalAttempts: studentAttempts.length,
          streak,
        };
      })
      .filter((s) => s.totalAttempts > 0 || period === "all")
      .sort((a, b) => {
        // Primary: avg score, secondary: total attempts
        if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
        return b.totalAttempts - a.totalAttempts;
      });

    // Assign rank
    const ranked = leaderboard.map((s, i) => ({ ...s, rank: i + 1 }));

    return { period, leaderboard: ranked };
  }
}
