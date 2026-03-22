import { BadRequestException, Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import type { ClassEntity } from "../../../domain/class/entities/class.entity";

const SHORT_ID_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";

export type CreateClassInput = {
  teacherId: string;
  name: string;
  gradeLevel?: string;
  code?: string;
};

export type CreateClassResult = {
  classId: string;
  code: string;
};

// Use case: teacher creates a new classroom with optional custom code
@Injectable()
export class CreateClassUseCase {
  constructor(private readonly classes: ClassRepositoryPort) {}

  async execute(input: CreateClassInput): Promise<CreateClassResult> {
    const name = input.name.trim();
    if (name.length < 2) {
      throw new BadRequestException("name must be at least 2 characters");
    }
    const gradeLevel = (input.gradeLevel ?? "1-2").trim() || "1-2";

    // Validate and deduplicate custom code, or auto-generate one
    let code: string;
    if (input.code?.trim()) {
      const requested = input.code.trim();
      if (!this.isValidDisplayCode(requested)) {
        throw new BadRequestException(
          "Mã lớp: 2–32 ký tự, chỉ chữ số, gạch ngang, gạch dưới, dấu chấm",
        );
      }
      const dup = await this.classes.codeExistsForTeacher(input.teacherId, requested);
      if (dup) {
        throw new BadRequestException("Mã lớp đã tồn tại trong tài khoản của bạn");
      }
      code = requested;
    } else {
      code = await this.nextAutoCode(input.teacherId);
    }

    const classId = this.newId();
    const created: ClassEntity = await this.classes.create({
      id: classId,
      name,
      gradeLevel,
      code,
      teacherId: input.teacherId,
    });

    return { classId: created.id, code: created.code ?? code };
  }

  private isValidDisplayCode(raw: string): boolean {
    return /^[A-Za-z0-9._-]{2,32}$/.test(raw.trim());
  }

  private async nextAutoCode(teacherId: string): Promise<string> {
    // Try sequential codes like L0001, L0002; fall back to timestamp-based if all taken
    for (let bump = 0; bump < 50; bump++) {
      const n = await this.classes.countByTeacherId(teacherId);
      const candidate = `L${String(n + 1 + bump).padStart(4, "0")}`;
      const dup = await this.classes.codeExistsForTeacher(teacherId, candidate);
      if (!dup) return candidate;
    }
    return `L${Date.now().toString(36)}`;
  }

  private newId(): string {
    const buf = randomBytes(8);
    let out = "";
    for (let i = 0; i < 8; i++) {
      out += SHORT_ID_CHARS[buf[i]! % SHORT_ID_CHARS.length]!;
    }
    return `c_${out}`;
  }
}
