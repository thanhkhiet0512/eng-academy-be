import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import type { StudentStatus } from "../../../domain/student/entities/student.entity";
import { AppError } from "../../../common/errors/app.error";

export type UpdateStudentInput = {
  name?: string;
  dateOfBirth?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
  note?: string | null;
  status?: StudentStatus;
};

@Injectable()
export class UpdateStudentUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
  ) {}

  async execute(
    classId: string,
    studentId: string,
    teacherId: string,
    input: UpdateStudentInput,
  ) {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const student = await this.students.findById(studentId);
    if (!student || student.classId !== classId) {
      throw AppError.notFound("Học sinh không tồn tại trong lớp này");
    }

    const updateData: Parameters<StudentRepositoryPort["update"]>[1] = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.parentName !== undefined) updateData.parentName = input.parentName;
    if (input.parentPhone !== undefined) updateData.parentPhone = input.parentPhone;
    if (input.note !== undefined) updateData.note = input.note;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.dateOfBirth !== undefined) {
      updateData.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
    }

    const updated = await this.students.update(studentId, updateData);
    return {
      id: updated.id,
      name: updated.name,
      note: updated.note,
      status: updated.status,
      parentName: updated.parentName,
      parentPhone: updated.parentPhone,
      dateOfBirth: updated.dateOfBirth?.toISOString().split("T")[0] ?? null,
    };
  }
}
