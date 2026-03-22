import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import * as XLSX from "xlsx";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";

export type ParsedStudentRow = {
  name: string;
  dateOfBirth?: string;
  parentName?: string;
  parentPhone?: string;
  _errors?: string[];
};

export type ParseStudentsExcelResult = {
  rows: ParsedStudentRow[];
  validRows: number;
  errorRows: number;
};

// Use case: parse an uploaded Excel file and return a preview of student rows with validation errors
@Injectable()
export class ParseStudentsExcelUseCase {
  constructor(private readonly classes: ClassRepositoryPort) {}

  async execute(
    classId: string,
    teacherId: string,
    file: Express.Multer.File,
  ): Promise<ParseStudentsExcelResult> {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw new ForbiddenException("Bạn không có quyền với lớp này");
    }

    const ext = file.originalname.split(".").pop()?.toLowerCase();
    if (!ext || !["xlsx", "xls", "csv"].includes(ext)) {
      throw new BadRequestException("Chỉ hỗ trợ .xlsx, .xls, .csv");
    }

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];
    if (!sheet) throw new BadRequestException("File trống hoặc không có dữ liệu");

    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    if (rawRows.length === 0) throw new BadRequestException("File trống hoặc không có dữ liệu");

    const headerMap = this.buildHeaderMap(rawRows[0]!);
    const rows: ParsedStudentRow[] = rawRows.map((rawRow, idx) => {
      const row: ParsedStudentRow = { name: "" };
      const errors: string[] = [];
      for (const [origin, target] of Object.entries(headerMap)) {
        const value = String(rawRow[origin] ?? "").trim();
        if (target === "name") row.name = value;
        if (target === "dateOfBirth") row.dateOfBirth = value;
        if (target === "parentName") row.parentName = value;
        if (target === "parentPhone") row.parentPhone = value;
      }
      if (!row.name || row.name.length < 2) {
        errors.push(`Dòng ${idx + 2}: thiếu họ tên (ít nhất 2 ký tự)`);
      }
      if (row.dateOfBirth) {
        const parsed = this.parseDate(row.dateOfBirth);
        if (!parsed) {
          errors.push(`Dòng ${idx + 2}: ngày sinh không hợp lệ (dùng DD/MM/YYYY)`);
        } else {
          row.dateOfBirth = parsed;
        }
      }
      if (errors.length > 0) row._errors = errors;
      return row;
    });

    const validRows = rows.filter((x) => !x._errors?.length).length;
    const errorRows = rows.filter((x) => x._errors?.length).length;
    return { rows, validRows, errorRows };
  }

  private buildHeaderMap(firstRow: Record<string, unknown>): Record<string, string> {
    const map: Record<string, string> = {};
    for (const key of Object.keys(firstRow)) {
      const norm = key.toLowerCase().trim().replace(/\s+/g, "");
      if (["name", "họtên", "hotên", "hoten", "tên", "ten", "fullname"].includes(norm)) {
        map[key] = "name";
      } else if (["dateofbirth", "dob", "ngaysinh", "ngàysinh", "birthday", "birthdate", "sinh"].includes(norm)) {
        map[key] = "dateOfBirth";
      } else if (["parentname", "phụhuynh", "phuhuynh", "tênphụhuynh", "tenphuhuynh", "parent"].includes(norm)) {
        map[key] = "parentName";
      } else if (["parentphone", "sđtphụhuynh", "sdtphuhuynh", "điệnthoại", "dienthoai", "phone", "sdt"].includes(norm)) {
        map[key] = "parentPhone";
      }
    }
    return map;
  }

  private parseDate(raw: string): string | null {
    const s = raw.trim();
    const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmy) return `${dmy[3]}-${dmy[2]!.padStart(2, "0")}-${dmy[1]!.padStart(2, "0")}`;
    const ymd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (ymd) return `${ymd[1]}-${ymd[2]!.padStart(2, "0")}-${ymd[3]!.padStart(2, "0")}`;
    if (/^\d+$/.test(s)) {
      const serial = parseInt(s, 10);
      if (serial > 1000 && serial < 100000) {
        const d = XLSX.SSF.parse_date_code(serial);
        if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
      }
    }
    return null;
  }
}
