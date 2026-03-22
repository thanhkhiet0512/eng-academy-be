import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";

@Injectable()
export class ClassRepositoryAdapter extends ClassRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<{ id: string; teacherId: string } | null> {
    const row = await this.prisma.class.findUnique({
      where: { id },
      select: { id: true, teacherId: true },
    });
    return row ?? null;
  }
}
