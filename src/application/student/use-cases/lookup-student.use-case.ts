import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";

export type LookupStudentResult = {
  studentId: string;
  classId: string;
  className: string;
  classCode: string;
  name: string;
  studentCode: string;
};

// Use case: student looks themselves up by class key + name (public, no auth)
@Injectable()
export class LookupStudentUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
  ) {}

  async execute(name: string, classKey: string): Promise<LookupStudentResult> {
    const trimmedName = name.trim();
    const trimmedKey = classKey.trim();

    if (trimmedName.length < 2 || trimmedKey.length < 1) {
      throw new HttpException(
        { error: "Nhập mã/tên lớp và họ tên ít nhất 2 ký tự.", code: "VALIDATION" },
        HttpStatus.BAD_REQUEST,
      );
    }

    const resolved = await this.resolveClassByKey(trimmedKey);

    // Exact case-insensitive name match within the class
    const matches = await this.students.findByClassIdAndName(resolved.classId, trimmedName);
    if (matches.length === 0) {
      throw new HttpException(
        {
          error:
            "Không có học sinh trùng họ tên trong lớp này. Kiểm tra đúng chính tả, không thừa dấu cách (hoặc nhờ giáo viên xem lại danh sách).",
          code: "STUDENT_NOT_FOUND",
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (matches.length > 1) {
      throw new HttpException(
        {
          error:
            "Trong lớp có nhiều bạn trùng tên — nhờ giáo viên đổi tên hiển thị trong danh sách để phân biệt.",
          code: "DUPLICATE_NAME",
        },
        HttpStatus.CONFLICT,
      );
    }

    const student = matches[0]!;
    return {
      studentId: student.id,
      classId: resolved.classId,
      className: resolved.name,
      classCode: resolved.code ?? "",
      name: student.name,
      studentCode: student.code ?? "",
    };
  }

  // Resolves a class by id, code, or name; throws on not found or ambiguous
  private async resolveClassByKey(raw: string): Promise<{ classId: string; name: string; code: string | null }> {
    // Try direct ID lookup first
    const byId = await this.classes.findById(raw);
    if (byId) return { classId: byId.id, name: byId.name, code: byId.code };

    // Try code lookup
    const byCode = await this.classes.findByCode(raw);
    if (byCode.length === 1) return { classId: byCode[0]!.id, name: byCode[0]!.name, code: byCode[0]!.code };
    if (byCode.length > 1) {
      throw new HttpException(
        { error: "Có nhiều lớp trùng mã này — nhờ giáo viên đặt mã lớp khác nhau hoặc dùng ID hệ thống.", code: "AMBIGUOUS_CLASS" },
        HttpStatus.CONFLICT,
      );
    }

    // Try name lookup
    const byName = await this.classes.findByName(raw);
    if (byName.length === 1) return { classId: byName[0]!.id, name: byName[0]!.name, code: byName[0]!.code };
    if (byName.length > 1) {
      throw new HttpException(
        { error: "Có nhiều lớp trùng tên — nhờ giáo viên đổi tên lớp cho khác nhau, hoặc bạn nhập mã lớp (vd. L0001) / ID hệ thống.", code: "AMBIGUOUS_CLASS" },
        HttpStatus.CONFLICT,
      );
    }

    throw new HttpException(
      { error: "Không tìm thấy lớp. Nhập đúng mã lớp (vd. L0001, CLE-1A), tên lớp, hoặc ID hệ thống (c_…) giáo viên cung cấp.", code: "CLASS_NOT_FOUND" },
      HttpStatus.NOT_FOUND,
    );
  }
}
