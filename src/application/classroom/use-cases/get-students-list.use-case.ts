import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { AttendanceRepositoryPort } from "../../../domain/attendance/ports/attendance.repository.port";
import { AppError } from "../../../common/errors/app.error";

export type StudentListItem = {
  id: string;
  code: string;
  name: string;
  dateOfBirth: string | null;
  parentName: string | null;
  parentPhone: string | null;
  note: string | null;
  status: string;
  avgScore: number;
  totalAttempts: number;
  attendanceRate: number;
  createdAt: Date;
};

@Injectable()
export class GetStudentsListUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly attendance: AttendanceRepositoryPort,
  ) {}

  async execute(
    classId: string,
    teacherId: string,
  ): Promise<{ students: StudentListItem[] }> {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const [studentList, attemptList] = await Promise.all([
      this.students.findByClassId(classId),
      this.attempts.findByClassId(classId),
    ]);

    const students: StudentListItem[] = studentList.map((s) => {
      const studentAttempts = attemptList.filter((a) => a.studentId === s.id);
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

      return {
        id: s.id,
        code: s.code ?? "",
        name: s.name,
        dateOfBirth: s.dateOfBirth?.toISOString().split("T")[0] ?? null,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        note: s.note,
        status: s.status,
        avgScore,
        totalAttempts: studentAttempts.length,
        attendanceRate: 0, // Will be calculated when attendance data is aggregated
        createdAt: s.createdAt,
      };
    });

    return { students };
  }
}
