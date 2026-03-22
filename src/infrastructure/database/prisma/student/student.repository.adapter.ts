import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { StudentRepositoryPort } from "../../../../domain/student/ports/student.repository.port";
import type { StudentEntity } from "../../../../domain/student/entities/student.entity";

// Implements StudentRepositoryPort — maps Prisma rows to domain StudentEntity
@Injectable()
export class StudentRepositoryAdapter extends StudentRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<StudentEntity | null> {
    const row = await this.prisma.student.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findByClassId(classId: string): Promise<StudentEntity[]> {
    const rows = await this.prisma.student.findMany({
      where: { classId },
      orderBy: { code: "asc" },
    });
    return rows.map((r) => this.map(r));
  }

  // Exact name match (case-insensitive) within a class
  async findByClassIdAndName(classId: string, name: string): Promise<StudentEntity[]> {
    const rows = await this.prisma.student.findMany({
      where: { classId, name: { equals: name, mode: "insensitive" } },
    });
    return rows.map((r) => this.map(r));
  }

  async countByClassId(classId: string): Promise<number> {
    return this.prisma.student.count({ where: { classId } });
  }

  async codeExistsInClass(classId: string, code: string): Promise<boolean> {
    const row = await this.prisma.student.findFirst({ where: { classId, code } });
    return row !== null;
  }

  async create(input: {
    id: string;
    classId: string;
    name: string;
    code: string;
    dateOfBirth?: Date | null;
    parentName?: string | null;
    parentPhone?: string | null;
  }): Promise<StudentEntity> {
    const row = await this.prisma.student.create({
      data: {
        id: input.id,
        classId: input.classId,
        name: input.name,
        code: input.code,
        dateOfBirth: input.dateOfBirth ?? null,
        parentName: input.parentName ?? null,
        parentPhone: input.parentPhone ?? null,
      },
    });
    return this.map(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.student.delete({ where: { id } });
  }

  private map(row: {
    id: string;
    classId: string;
    name: string;
    code: string | null;
    dateOfBirth: Date | null;
    parentName: string | null;
    parentPhone: string | null;
    createdAt: Date;
  }): StudentEntity {
    return {
      id: row.id,
      classId: row.classId,
      name: row.name,
      code: row.code,
      dateOfBirth: row.dateOfBirth,
      parentName: row.parentName,
      parentPhone: row.parentPhone,
      createdAt: row.createdAt,
    };
  }
}
