import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AttendanceRepositoryPort } from "../../../domain/attendance/ports/attendance.repository.port";
import { ExcelServicePort } from "../../../domain/excel/ports/excel.service.port";
import { AppError } from "../../../common/errors/app.error";

// Use case: export attendance for a class/month as an Excel buffer
@Injectable()
export class ExportAttendanceUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
    private readonly attendance: AttendanceRepositoryPort,
    private readonly excel: ExcelServicePort,
  ) {}

  async execute(
    classId: string,
    teacherId: string,
    yearMonth: string, // "YYYY-MM"
  ): Promise<{ buffer: Buffer; filename: string }> {
    if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
      throw AppError.badRequest("yearMonth phải có định dạng YYYY-MM");
    }

    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const [studentList, records] = await Promise.all([
      this.students.findByClassId(classId),
      this.attendance.findByClassIdAndMonth(classId, yearMonth),
    ]);

    // Collect unique dates sorted
    const dateSet = new Set<string>();
    for (const r of records) dateSet.add(r.date);
    const dates = [...dateSet].sort();

    // Map: studentId → date → present
    const grid = new Map<string, Map<string, boolean>>();
    for (const r of records) {
      if (!grid.has(r.studentId)) grid.set(r.studentId, new Map());
      grid.get(r.studentId)!.set(r.date, r.present);
    }

    const rows = studentList.map((s) => {
      const row: Record<string, string> = {
        code: s.code ?? "",
        name: s.name,
      };
      let presentCount = 0;
      for (const date of dates) {
        const present = grid.get(s.id)?.get(date);
        if (present === true) presentCount++;
        row[date] = present === true ? "✓" : present === false ? "✗" : "—";
      }
      row["total"] = `${presentCount}/${dates.length}`;
      return row;
    });

    const [year, month] = yearMonth.split("-");
    const dayColumns = dates.map((d) => ({
      header: d.slice(8), // "DD"
      key: d,
      width: 6,
    }));

    const columns: { header: string; key: string; width: number }[] = [
      { header: "Mã HS", key: "code", width: 10 },
      { header: "Họ tên", key: "name", width: 28 },
      ...dayColumns,
      { header: "Có mặt", key: "total", width: 10 },
    ];

    const buffer = this.excel.build(rows, columns);
    const filename = `diemdanh_${classroom.name.replace(/\s+/g, "_")}_${year}_${month}.xlsx`;
    return { buffer, filename };
  }
}
