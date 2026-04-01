import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AttendanceRepositoryPort } from "../../../domain/attendance/ports/attendance.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { AppError } from "../../../common/errors/app.error";

// Use case: teacher removes a student and cascades deletion of attendance + attempts
@Injectable()
export class RemoveStudentUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
    private readonly attendance: AttendanceRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
  ) {}

  async execute(classId: string, teacherId: string, studentId: string): Promise<{ ok: true }> {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const student = await this.students.findById(studentId);
    if (!student || student.classId !== classId) {
      throw AppError.notFound("Student not found in this class");
    }

    // Delete related data before removing student record
    await this.attendance.deleteByStudentId(studentId, classId);
    await this.attempts.deleteByStudentId(studentId);
    await this.students.delete(studentId);

    return { ok: true };
  }
}
