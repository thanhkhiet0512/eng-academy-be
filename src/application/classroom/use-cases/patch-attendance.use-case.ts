import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AttendanceRepositoryPort } from "../../../domain/attendance/ports/attendance.repository.port";
import { AppError } from "../../../common/errors/app.error";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export type PatchAttendanceInput = {
  classId: string;
  teacherId: string;
  studentId: string;
  present: boolean;
  date: string;
};

// Use case: teacher marks a student as present or absent for a given date
@Injectable()
export class PatchAttendanceUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
    private readonly attendance: AttendanceRepositoryPort,
  ) {}

  async execute(input: PatchAttendanceInput): Promise<{ ok: true; date: string; studentId: string; present: boolean }> {
    const classroom = await this.classes.findById(input.classId);
    if (!classroom || classroom.teacherId !== input.teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const studentId = input.studentId.trim();
    if (!studentId) throw AppError.badRequest("studentId is required");
    if (typeof input.present !== "boolean") throw AppError.badRequest("present must be boolean");
    if (!input.date || !DATE_REGEX.test(input.date)) throw AppError.badRequest("date must be YYYY-MM-DD");

    const student = await this.students.findById(studentId);
    if (!student || student.classId !== input.classId) {
      throw AppError.notFound("Học sinh không thuộc lớp này");
    }

    await this.attendance.upsert({
      classId: input.classId,
      studentId,
      date: input.date,
      present: input.present,
    });

    return { ok: true, date: input.date, studentId, present: input.present };
  }
}
