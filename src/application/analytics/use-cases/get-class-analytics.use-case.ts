import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { AttendanceRepositoryPort } from "../../../domain/attendance/ports/attendance.repository.port";
import { AssignmentRepositoryPort } from "../../../domain/assignment/ports/assignment.repository.port";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class GetClassAnalyticsUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly attendance: AttendanceRepositoryPort,
    private readonly assignments: AssignmentRepositoryPort,
  ) {}

  async execute(classId: string, teacherId: string) {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const [studentList, attemptList, assignmentList] = await Promise.all([
      this.students.findByClassId(classId),
      this.attempts.findByClassId(classId),
      this.assignments.findByClassId(classId),
    ]);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const activeStudents = studentList.filter((s) => s.status === "ACTIVE");

    // Class average score
    const classAvg =
      attemptList.length === 0
        ? 0
        : Math.round(
            (attemptList.reduce((sum, a) => sum + (a.total ? (a.score / a.total) * 100 : 0), 0) /
              attemptList.length) *
              10,
          ) / 10;

    // Per-student stats for this week vs last week
    const studentStats = activeStudents.map((s) => {
      const allAttempts = attemptList.filter((a) => a.studentId === s.id);
      const thisWeek = allAttempts.filter((a) => a.createdAt >= oneWeekAgo);
      const lastWeek = allAttempts.filter((a) => a.createdAt >= twoWeeksAgo && a.createdAt < oneWeekAgo);

      const avg = (attempts: typeof allAttempts) =>
        attempts.length === 0
          ? 0
          : attempts.reduce((sum, a) => sum + (a.total ? (a.score / a.total) * 100 : 0), 0) / attempts.length;

      const thisWeekAvg = Math.round(avg(thisWeek) * 10) / 10;
      const lastWeekAvg = Math.round(avg(lastWeek) * 10) / 10;
      const overallAvg = Math.round(avg(allAttempts) * 10) / 10;
      const improvement = thisWeek.length > 0 && lastWeek.length > 0
        ? Math.round((thisWeekAvg - lastWeekAvg) * 10) / 10
        : 0;

      return {
        studentId: s.id,
        name: s.name,
        code: s.code ?? "",
        overallAvg,
        thisWeekAvg,
        lastWeekAvg,
        improvement,
        totalAttempts: allAttempts.length,
        thisWeekAttempts: thisWeek.length,
      };
    });

    // Top 5 students by avg
    const topStudents = [...studentStats]
      .sort((a, b) => b.overallAvg - a.overallAvg)
      .slice(0, 5)
      .map((s) => ({ name: s.name, code: s.code, avg: s.overallAvg, attempts: s.totalAttempts }));

    // Most improved (this week vs last week)
    const mostImproved = [...studentStats]
      .filter((s) => s.improvement > 0)
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 5)
      .map((s) => ({ name: s.name, code: s.code, improvement: s.improvement, thisWeek: s.thisWeekAvg, lastWeek: s.lastWeekAvg }));

    // Daily averages for the last 7 days (for mini chart)
    const dailyAvg: { date: string; avg: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = day.toISOString().split("T")[0];
      const dayAttempts = attemptList.filter((a) => a.createdAt.toISOString().split("T")[0] === dayStr);
      const dayAvg =
        dayAttempts.length === 0
          ? 0
          : Math.round(
              (dayAttempts.reduce((sum, a) => sum + (a.total ? (a.score / a.total) * 100 : 0), 0) /
                dayAttempts.length) *
                10,
            ) / 10;
      dailyAvg.push({ date: dayStr, avg: dayAvg, count: dayAttempts.length });
    }

    // Pending assignments
    const pendingAssignments = assignmentList.filter((a) => a.status === "ACTIVE" && a.dueDate >= now).length;
    const overdueAssignments = assignmentList.filter((a) => a.status === "ACTIVE" && a.dueDate < now).length;

    return {
      className: classroom.name,
      totalStudents: activeStudents.length,
      classAvg,
      totalAttempts: attemptList.length,
      pendingAssignments,
      overdueAssignments,
      topStudents,
      mostImproved,
      dailyAvg,
    };
  }
}
