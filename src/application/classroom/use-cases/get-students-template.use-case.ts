import { ForbiddenException, Injectable } from "@nestjs/common";
import * as XLSX from "xlsx";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";

// Use case: generate and return an Excel buffer pre-filled with the class's current student list
@Injectable()
export class GetStudentsTemplateUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
  ) {}

  async execute(classId: string, teacherId: string): Promise<Buffer> {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw new ForbiddenException("Bạn không có quyền với lớp này");
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

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      rows.length ? rows : [{ name: "", dateOfBirth: "", parentName: "", parentPhone: "" }],
      { header: ["name", "dateOfBirth", "parentName", "parentPhone"] },
    );
    ws["!cols"] = [{ wch: 28 }, { wch: 14 }, { wch: 24 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }
}
