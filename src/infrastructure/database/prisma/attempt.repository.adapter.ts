import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import type { Attempt } from "../../../domain/lesson/entities/attempt.entity";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";

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
    return this.prisma.attempt.create({ data: input });
  }

  async findByStudentId(studentId: string): Promise<Attempt[]> {
    return this.prisma.attempt.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
    });
  }
}
