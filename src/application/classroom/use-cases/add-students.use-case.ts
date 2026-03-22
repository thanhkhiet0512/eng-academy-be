import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";

const SHORT_ID_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";

// Raw body shape accepted from the HTTP layer — three supported input modes
export type AddStudentsBody = {
  name?: string;
  names?: string[];
  students?: { name?: string; dateOfBirth?: string | null; parentName?: string | null; parentPhone?: string | null }[];
  dateOfBirth?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
};

export type AddStudentsResult = {
  added: { studentId: string; name: string; code: string }[];
};

// Use case: normalize input, validate, and add one or more students to a class
@Injectable()
export class AddStudentsUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
  ) {}

  async execute(classId: string, teacherId: string, body: AddStudentsBody): Promise<AddStudentsResult> {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw new ForbiddenException("Bạn không có quyền với lớp này");
    }

    // Normalize the three possible input shapes into a uniform list
    const items = this.normalize(body);
    if (items.length === 0) {
      throw new BadRequestException("Provide name or names (non-empty)");
    }

    const added: AddStudentsResult["added"] = [];
    for (const item of items) {
      const studentId = this.newStudentId();
      const code = await this.nextAutoStudentCode(classId);
      await this.students.create({
        id: studentId,
        classId,
        name: item.name,
        code,
        dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : null,
        parentName: item.parentName ?? null,
        parentPhone: item.parentPhone ?? null,
      });
      added.push({ studentId, name: item.name, code });
    }

    return { added };
  }

  // Supports three input modes: structured array, names-only array, or single name
  private normalize(input: AddStudentsBody): { name: string; dateOfBirth?: string | null; parentName?: string | null; parentPhone?: string | null }[] {
    if (input.students?.length) {
      return input.students
        .map((x) => ({
          name: (x.name ?? "").trim(),
          dateOfBirth: x.dateOfBirth ?? null,
          parentName: x.parentName?.trim() ?? null,
          parentPhone: x.parentPhone?.trim() ?? null,
        }))
        .filter((x) => x.name.length > 0);
    }
    if (input.names?.length) {
      return [...new Set(input.names.map((x) => x.trim()).filter(Boolean))].map((name) => ({ name }));
    }
    if ((input.name ?? "").trim().length > 0) {
      return [{
        name: input.name!.trim(),
        dateOfBirth: input.dateOfBirth ?? null,
        parentName: input.parentName?.trim() ?? null,
        parentPhone: input.parentPhone?.trim() ?? null,
      }];
    }
    return [];
  }

  private async nextAutoStudentCode(classId: string): Promise<string> {
    for (let bump = 0; bump < 50; bump++) {
      const n = await this.students.countByClassId(classId);
      const candidate = `HS${String(n + 1 + bump).padStart(4, "0")}`;
      const dup = await this.students.codeExistsInClass(classId, candidate);
      if (!dup) return candidate;
    }
    return `HS${Date.now().toString(36)}`;
  }

  private newStudentId(): string {
    const buf = randomBytes(8);
    let out = "";
    for (let i = 0; i < 8; i++) {
      out += SHORT_ID_CHARS[buf[i]! % SHORT_ID_CHARS.length]!;
    }
    return `s_${out}`;
  }
}
