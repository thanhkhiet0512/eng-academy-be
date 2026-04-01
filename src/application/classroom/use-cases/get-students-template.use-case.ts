import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { ExcelServicePort } from "../../../domain/excel/ports/excel.service.port";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class GetStudentsTemplateUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
    private readonly excel: ExcelServicePort,
  ) {}

  async execute(classId: string, teacherId: string): Promise<Buffer> {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const studentList = await this.students.findByClassId(classId);
    const rows = studentList.map((x) => ({
      name: x.name,
      dateOfBirth: x.dateOfBirth
        ? `${x.dateOfBirth.getDate().toString().padStart(2, "0")}/${(x.dateOfBirth.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${x.dateOfBirth.getFullYear()}`
        : "",
      parentName: x.parentName ?? "",
      parentPhone: x.parentPhone ?? "",
    }));

    return this.excel.build(rows, [
      { header: "Họ tên", key: "name", width: 28 },
      { header: "Ngày sinh", key: "dateOfBirth", width: 14 },
      { header: "Phụ huynh", key: "parentName", width: 24 },
      { header: "SĐT", key: "parentPhone", width: 16 },
    ]);
  }
}
