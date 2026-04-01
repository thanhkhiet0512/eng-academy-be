import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import type { ClassStatus } from "../../../domain/class/entities/class.entity";
import { AppError } from "../../../common/errors/app.error";

// Use case: teacher archives or restores a class
@Injectable()
export class SetClassStatusUseCase {
  constructor(private readonly classes: ClassRepositoryPort) {}

  async execute(classId: string, teacherId: string, status: ClassStatus): Promise<void> {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }
    if (classroom.status === status) return;
    await this.classes.setStatus(classId, status);
  }
}
