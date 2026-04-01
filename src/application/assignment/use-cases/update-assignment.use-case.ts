import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { AssignmentRepositoryPort } from "../../../domain/assignment/ports/assignment.repository.port";
import type { AssignmentStatus } from "../../../domain/assignment/entities/assignment.entity";
import { AppError } from "../../../common/errors/app.error";

export type UpdateAssignmentInput = {
  title?: string;
  description?: string | null;
  dueDate?: string;
  maxAttempts?: number;
  status?: AssignmentStatus;
};

@Injectable()
export class UpdateAssignmentUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly assignments: AssignmentRepositoryPort,
  ) {}

  async execute(assignmentId: string, teacherId: string, input: UpdateAssignmentInput) {
    const assignment = await this.assignments.findById(assignmentId);
    if (!assignment) throw AppError.notFound("Bài tập không tồn tại");

    const classroom = await this.classes.findById(assignment.classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền");
    }

    const updateData: Parameters<AssignmentRepositoryPort["update"]>[1] = {};
    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.description !== undefined) updateData.description = input.description?.trim() || null;
    if (input.dueDate !== undefined) updateData.dueDate = new Date(input.dueDate);
    if (input.maxAttempts !== undefined) updateData.maxAttempts = input.maxAttempts;
    if (input.status !== undefined) updateData.status = input.status;

    const updated = await this.assignments.update(assignmentId, updateData);
    return {
      id: updated.id,
      title: updated.title,
      status: updated.status,
      dueDate: updated.dueDate.toISOString(),
    };
  }
}
