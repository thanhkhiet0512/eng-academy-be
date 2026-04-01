import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { AssignmentRepositoryPort } from "../../../../domain/assignment/ports/assignment.repository.port";
import type { AssignmentEntity, AssignmentStatus } from "../../../../domain/assignment/entities/assignment.entity";
import { mapAssignmentRowToDomain } from "./assignment.mapper";

@Injectable()
export class AssignmentRepositoryAdapter extends AssignmentRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: {
    classId: string;
    lessonId: string;
    title: string;
    description?: string | null;
    dueDate: Date;
    maxAttempts?: number;
  }): Promise<AssignmentEntity> {
    const row = await this.prisma.assignment.create({
      data: {
        classId: input.classId,
        lessonId: input.lessonId,
        title: input.title,
        description: input.description ?? null,
        dueDate: input.dueDate,
        maxAttempts: input.maxAttempts ?? 1,
      },
    });
    return mapAssignmentRowToDomain(row);
  }

  async findById(id: string): Promise<AssignmentEntity | null> {
    const row = await this.prisma.assignment.findUnique({ where: { id } });
    return row ? mapAssignmentRowToDomain(row) : null;
  }

  async findByClassId(classId: string): Promise<AssignmentEntity[]> {
    const rows = await this.prisma.assignment.findMany({
      where: { classId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => mapAssignmentRowToDomain(r));
  }

  async findByLessonId(lessonId: string): Promise<AssignmentEntity[]> {
    const rows = await this.prisma.assignment.findMany({
      where: { lessonId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => mapAssignmentRowToDomain(r));
  }

  async update(
    id: string,
    input: Partial<{
      title: string;
      description: string | null;
      dueDate: Date;
      maxAttempts: number;
      status: AssignmentStatus;
    }>,
  ): Promise<AssignmentEntity> {
    const row = await this.prisma.assignment.update({
      where: { id },
      data: input,
    });
    return mapAssignmentRowToDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.assignment.delete({ where: { id } });
  }
}
