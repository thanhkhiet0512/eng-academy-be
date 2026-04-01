import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { AttendanceRepositoryPort } from "../../../domain/attendance/ports/attendance.repository.port";
import { AppError } from "../../../common/errors/app.error";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export type GetAttendanceResult = {
  date: string;
  entries: Record<string, boolean>;
};

// Use case: teacher retrieves attendance records for a class on a specific date
@Injectable()
export class GetAttendanceUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly attendance: AttendanceRepositoryPort,
  ) {}

  async execute(classId: string, teacherId: string, date: string): Promise<GetAttendanceResult> {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    if (!date || !DATE_REGEX.test(date)) {
      throw AppError.badRequest("Query ?date=YYYY-MM-DD là bắt buộc");
    }

    const rows = await this.attendance.findByClassIdAndDate(classId, date);
    const entries: Record<string, boolean> = {};
    for (const row of rows) {
      entries[row.studentId] = row.present;
    }
    return { date, entries };
  }
}
