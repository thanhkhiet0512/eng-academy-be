import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { AttendanceRepositoryPort } from "../../../../domain/attendance/ports/attendance.repository.port";
import type { AttendanceEntity } from "../../../../domain/attendance/entities/attendance.entity";

// Implements AttendanceRepositoryPort — maps Prisma rows to domain AttendanceEntity
@Injectable()
export class AttendanceRepositoryAdapter extends AttendanceRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByClassIdAndDate(classId: string, date: string): Promise<AttendanceEntity[]> {
    const rows = await this.prisma.attendance.findMany({ where: { classId, date } });
    return rows.map((r) => this.map(r));
  }

  async findByStudentId(classId: string, date: string, studentId: string): Promise<AttendanceEntity | null> {
    const row = await this.prisma.attendance.findFirst({ where: { classId, date, studentId } });
    return row ? this.map(row) : null;
  }

  // Upsert: create or update attendance record for a student on a given date
  async upsert(input: {
    classId: string;
    studentId: string;
    date: string;
    present: boolean;
  }): Promise<void> {
    const existing = await this.prisma.attendance.findFirst({
      where: { classId: input.classId, date: input.date, studentId: input.studentId },
    });
    if (existing) {
      await this.prisma.attendance.update({ where: { id: existing.id }, data: { present: input.present } });
    } else {
      await this.prisma.attendance.create({
        data: {
          classId: input.classId,
          studentId: input.studentId,
          date: input.date,
          present: input.present,
        },
      });
    }
  }

  async deleteByStudentId(studentId: string, classId: string): Promise<void> {
    await this.prisma.attendance.deleteMany({ where: { studentId, classId } });
  }

  private map(row: {
    id: string;
    classId: string;
    studentId: string;
    date: string;
    present: boolean;
  }): AttendanceEntity {
    return {
      id: row.id,
      classId: row.classId,
      studentId: row.studentId,
      date: row.date,
      present: row.present,
    };
  }
}
