import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { AssignmentRepositoryPort } from "../../../domain/assignment/ports/assignment.repository.port";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class DeleteAssignmentUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly assignments: AssignmentRepositoryPort,
  ) {}

  async execute(assignmentId: string, teacherId: string) {
    const assignment = await this.assignments.findById(assignmentId);
    if (!assignment) throw AppError.notFound("Bài tập không tồn tại");

    const classroom = await this.classes.findById(assignment.classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền");
    }

    await this.assignments.delete(assignmentId);
    return { deleted: true };
  }
}
