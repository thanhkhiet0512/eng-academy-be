import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import type { Attempt } from "../../../domain/lesson/entities/attempt.entity";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { mapAttemptRowToDomain } from "./attempt.mapper";

@Injectable()
export class AttemptRepositoryAdapter extends AttemptRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: {
    studentId: string;
    classId: string;
    lessonId: string;
    score: number;
    total: number;
  }): Promise<Attempt> {
    const row = await this.prisma.attempt.create({ data: input });
    return mapAttemptRowToDomain(row);
  }

  async findByStudentId(studentId: string): Promise<Attempt[]> {
    const rows = await this.prisma.attempt.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => mapAttemptRowToDomain(r));
  }

  async findByClassId(classId: string): Promise<Attempt[]> {
    const rows = await this.prisma.attempt.findMany({
      where: { classId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => mapAttemptRowToDomain(r));
  }

  async deleteByStudentId(studentId: string): Promise<void> {
    await this.prisma.attempt.deleteMany({ where: { studentId } });
  }
}
