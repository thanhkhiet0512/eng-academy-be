import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { AttendanceRepositoryPort } from "../../../domain/attendance/ports/attendance.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AppError } from "../../../common/errors/app.error";

const YEAR_MONTH_REGEX = /^\d{4}-\d{2}$/;

export type MonthlyAttendanceResult = {
  yearMonth: string;
  students: { id: string; code: string; name: string }[];
  records: { studentId: string; date: string; present: boolean }[];
};

// Use case: teacher retrieves all attendance records for a class in a given month
@Injectable()
export class GetMonthlyAttendanceUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly attendance: AttendanceRepositoryPort,
    private readonly students: StudentRepositoryPort,
  ) {}

  async execute(
    classId: string,
    teacherId: string,
    yearMonth: string,
  ): Promise<MonthlyAttendanceResult> {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    if (!yearMonth || !YEAR_MONTH_REGEX.test(yearMonth)) {
      throw AppError.badRequest("Query ?yearMonth=YYYY-MM là bắt buộc");
    }

    const [studentList, rows] = await Promise.all([
      this.students.findByClassId(classId),
      this.attendance.findByClassIdAndMonth(classId, yearMonth),
    ]);

    return {
      yearMonth,
      students: studentList.map((s) => ({ id: s.id, code: s.code ?? "", name: s.name })),
      records: rows.map((r) => ({ studentId: r.studentId, date: r.date, present: r.present })),
    };
  }
}
