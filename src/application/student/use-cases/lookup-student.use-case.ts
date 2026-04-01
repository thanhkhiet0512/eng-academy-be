import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AppError } from "../../../common/errors/app.error";

export type LookupStudentResult = {
  studentId: string;
  classId: string;
  className: string;
  classCode: string;
  name: string;
  studentCode: string;
};

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
      throw AppError.badRequest("Nhập mã/tên lớp và họ tên ít nhất 2 ký tự.", "VALIDATION");
    }

    const resolved = await this.resolveClassByKey(trimmedKey);

    const matches = await this.students.findByClassIdAndName(resolved.classId, trimmedName);
    if (matches.length === 0) {
      throw AppError.notFound(
        "Không có học sinh trùng họ tên trong lớp này. Kiểm tra đúng chính tả, không thừa dấu cách (hoặc nhờ giáo viên xem lại danh sách).",
        "STUDENT_NOT_FOUND",
      );
    }
    if (matches.length > 1) {
      throw AppError.conflict(
        "Trong lớp có nhiều bạn trùng tên — nhờ giáo viên đổi tên hiển thị trong danh sách để phân biệt.",
        "DUPLICATE_NAME",
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

  private async resolveClassByKey(raw: string): Promise<{ classId: string; name: string; code: string | null }> {
    const byId = await this.classes.findById(raw);
    if (byId) return { classId: byId.id, name: byId.name, code: byId.code };

    const byCode = await this.classes.findByCode(raw);
    if (byCode.length === 1) return { classId: byCode[0]!.id, name: byCode[0]!.name, code: byCode[0]!.code };
    if (byCode.length > 1) {
      throw AppError.conflict(
        "Có nhiều lớp trùng mã này — nhờ giáo viên đặt mã lớp khác nhau hoặc dùng ID hệ thống.",
        "AMBIGUOUS_CLASS",
      );
    }

    const byName = await this.classes.findByName(raw);
    if (byName.length === 1) return { classId: byName[0]!.id, name: byName[0]!.name, code: byName[0]!.code };
    if (byName.length > 1) {
      throw AppError.conflict(
        "Có nhiều lớp trùng tên — nhờ giáo viên đổi tên lớp cho khác nhau, hoặc bạn nhập mã lớp (vd. L0001) / ID hệ thống.",
        "AMBIGUOUS_CLASS",
      );
    }

    throw AppError.notFound(
      "Không tìm thấy lớp. Nhập đúng mã lớp (vd. L0001, CLE-1A), tên lớp, hoặc ID hệ thống (c_…) giáo viên cung cấp.",
      "CLASS_NOT_FOUND",
    );
  }
}
