import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";

@Injectable()
export class StudentRepositoryAdapter extends StudentRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<{ id: string; classId: string } | null> {
    const row = await this.prisma.student.findUnique({
      where: { id },
      select: { id: true, classId: true },
    });
    return row ?? null;
  }
}
