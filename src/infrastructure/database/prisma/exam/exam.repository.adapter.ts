import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../../prisma/prisma.service";
import { ExamRepositoryPort } from "../../../../domain/exam/ports/exam.repository.port";
import type { ClassExam, Exam, ExamAttempt, ExamQuestion } from "../../../../domain/exam/entities/exam.entity";

function mapExamRow(row: {
  id: string;
  teacherId: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  questions: Prisma.JsonValue;
  createdAt: Date;
}): Exam {
  return {
    id: row.id,
    teacherId: row.teacherId,
    title: row.title,
    description: row.description,
    durationMinutes: row.durationMinutes,
    questions: (row.questions as unknown as ExamQuestion[]) ?? [],
    createdAt: row.createdAt,
  };
}

function mapClassExamRow(row: {
  id: string;
  classId: string;
  examId: string;
  scheduledAt: Date | null;
  dueDate: Date | null;
  maxAttempts: number;
  status: string;
  createdAt: Date;
}): ClassExam {
  return {
    id: row.id,
    classId: row.classId,
    examId: row.examId,
    scheduledAt: row.scheduledAt,
    dueDate: row.dueDate,
    maxAttempts: row.maxAttempts,
    status: row.status as "ACTIVE" | "CLOSED",
    createdAt: row.createdAt,
  };
}

@Injectable()
export class ExamRepositoryAdapter extends ExamRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Exam | null> {
    const row = await this.prisma.exam.findUnique({ where: { id } });
    return row ? mapExamRow(row) : null;
  }

  async findByTeacherId(teacherId: string): Promise<Exam[]> {
    const rows = await this.prisma.exam.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapExamRow);
  }

  async create(input: {
    teacherId: string;
    title: string;
    description?: string | null;
    durationMinutes: number;
    questions: ExamQuestion[];
  }): Promise<Exam> {
    const row = await this.prisma.exam.create({
      data: {
        teacherId: input.teacherId,
        title: input.title,
        description: input.description ?? null,
        durationMinutes: input.durationMinutes,
        questions: input.questions as unknown as Prisma.InputJsonValue,
      },
    });
    return mapExamRow(row);
  }

  async update(
    id: string,
    input: Partial<Pick<Exam, "title" | "description" | "durationMinutes" | "questions">>,
  ): Promise<Exam> {
    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.durationMinutes !== undefined) data.durationMinutes = input.durationMinutes;
    if (input.questions !== undefined) data.questions = input.questions as unknown as Prisma.InputJsonValue;

    const row = await this.prisma.exam.update({ where: { id }, data });
    return mapExamRow(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.exam.delete({ where: { id } });
  }

  async findClassExam(classId: string, examId: string): Promise<ClassExam | null> {
    const row = await this.prisma.classExam.findUnique({
      where: { classId_examId: { classId, examId } },
    });
    return row ? mapClassExamRow(row) : null;
  }

  async findClassExamsByClassId(classId: string): Promise<ClassExam[]> {
    const rows = await this.prisma.classExam.findMany({
      where: { classId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapClassExamRow);
  }

  async assignToClass(input: {
    classId: string;
    examId: string;
    scheduledAt?: Date | null;
    dueDate?: Date | null;
    maxAttempts: number;
  }): Promise<ClassExam> {
    const row = await this.prisma.classExam.upsert({
      where: { classId_examId: { classId: input.classId, examId: input.examId } },
      create: {
        classId: input.classId,
        examId: input.examId,
        scheduledAt: input.scheduledAt ?? null,
        dueDate: input.dueDate ?? null,
        maxAttempts: input.maxAttempts,
      },
      update: {
        scheduledAt: input.scheduledAt ?? null,
        dueDate: input.dueDate ?? null,
        maxAttempts: input.maxAttempts,
      },
    });
    return mapClassExamRow(row);
  }

  async updateClassExam(
    id: string,
    input: Partial<Pick<ClassExam, "scheduledAt" | "dueDate" | "maxAttempts" | "status">>,
  ): Promise<ClassExam> {
    const row = await this.prisma.classExam.update({ where: { id }, data: input });
    return mapClassExamRow(row);
  }

  async removeFromClass(classId: string, examId: string): Promise<void> {
    await this.prisma.classExam.deleteMany({ where: { classId, examId } });
  }

  async findAttemptsByStudentAndExam(studentId: string, examId: string): Promise<ExamAttempt[]> {
    const rows = await this.prisma.examAttempt.findMany({
      where: { studentId, examId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({ ...r }));
  }

  async createAttempt(input: {
    studentId: string;
    classId: string;
    examId: string;
    scoreX100: number;
    totalX100: number;
    answers: unknown;
  }): Promise<ExamAttempt> {
    const row = await this.prisma.examAttempt.create({
      data: {
        studentId: input.studentId,
        classId: input.classId,
        examId: input.examId,
        scoreX100: input.scoreX100,
        totalX100: input.totalX100,
        answers: input.answers as Prisma.InputJsonValue,
      },
    });
    return { ...row };
  }
}
