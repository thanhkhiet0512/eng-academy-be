import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { ClassRepositoryPort } from "../../../../domain/class/ports/class.repository.port";
import type { ClassEntity } from "../../../../domain/class/entities/class.entity";

// Implements ClassRepositoryPort — maps Prisma rows to domain ClassEntity
@Injectable()
export class ClassRepositoryAdapter extends ClassRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<ClassEntity | null> {
    const row = await this.prisma.class.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findByTeacherId(teacherId: string): Promise<ClassEntity[]> {
    const rows = await this.prisma.class.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => this.map(r));
  }

  // Find classes whose code matches (case-insensitive)
  async findByCode(code: string): Promise<ClassEntity[]> {
    const rows = await this.prisma.class.findMany({
      where: { code: { equals: code, mode: "insensitive" } },
    });
    return rows.map((r) => this.map(r));
  }

  // Find classes whose name matches (case-insensitive)
  async findByName(name: string): Promise<ClassEntity[]> {
    const rows = await this.prisma.class.findMany({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    return rows.map((r) => this.map(r));
  }

  async codeExistsForTeacher(teacherId: string, code: string): Promise<boolean> {
    const row = await this.prisma.class.findFirst({ where: { teacherId, code } });
    return row !== null;
  }

  async countByTeacherId(teacherId: string): Promise<number> {
    return this.prisma.class.count({ where: { teacherId } });
  }

  async create(input: {
    id: string;
    name: string;
    gradeLevel: string;
    code: string;
    teacherId: string;
  }): Promise<ClassEntity> {
    const row = await this.prisma.class.create({ data: input });
    return this.map(row);
  }

  private map(row: {
    id: string;
    name: string;
    gradeLevel: string;
    code: string | null;
    teacherId: string;
    createdAt: Date;
  }): ClassEntity {
    return {
      id: row.id,
      name: row.name,
      gradeLevel: row.gradeLevel,
      code: row.code,
      teacherId: row.teacherId,
      createdAt: row.createdAt,
    };
  }
}
