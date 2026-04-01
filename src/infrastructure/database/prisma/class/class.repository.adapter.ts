import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { ClassRepositoryPort } from "../../../../domain/class/ports/class.repository.port";
import type { ClassEntity, ClassStatus } from "../../../../domain/class/entities/class.entity";
import { mapClassRowToDomain } from "./class.mapper";

@Injectable()
export class ClassRepositoryAdapter extends ClassRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<ClassEntity | null> {
    const row = await this.prisma.class.findUnique({ where: { id } });
    return row ? mapClassRowToDomain(row) : null;
  }

  async findByTeacherId(teacherId: string, status?: ClassStatus): Promise<ClassEntity[]> {
    const rows = await this.prisma.class.findMany({
      where: { teacherId, ...(status ? { status } : {}) },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => mapClassRowToDomain(r));
  }

  async findByCode(code: string): Promise<ClassEntity[]> {
    const rows = await this.prisma.class.findMany({
      where: { code: { equals: code, mode: "insensitive" } },
    });
    return rows.map((r) => mapClassRowToDomain(r));
  }

  async findByName(name: string): Promise<ClassEntity[]> {
    const rows = await this.prisma.class.findMany({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    return rows.map((r) => mapClassRowToDomain(r));
  }

  async codeExistsForTeacher(teacherId: string, code: string): Promise<boolean> {
    const row = await this.prisma.class.findFirst({ where: { teacherId, code } });
    return row !== null;
  }

  async nameExistsForTeacher(teacherId: string, name: string): Promise<boolean> {
    const row = await this.prisma.class.findFirst({
      where: { teacherId, name: { equals: name, mode: "insensitive" } },
    });
    return row !== null;
  }

  async countByTeacherId(teacherId: string): Promise<number> {
    return this.prisma.class.count({ where: { teacherId } });
  }

  async setStatus(id: string, status: ClassStatus): Promise<void> {
    await this.prisma.class.update({ where: { id }, data: { status } });
  }

  async create(input: {
    id: string;
    name: string;
    gradeLevel: string;
    code: string;
    teacherId: string;
  }): Promise<ClassEntity> {
    const row = await this.prisma.class.create({ data: input });
    return mapClassRowToDomain(row);
  }
}
