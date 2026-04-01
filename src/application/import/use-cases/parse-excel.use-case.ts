import { Injectable } from "@nestjs/common";
import { ExcelServicePort } from "../../../domain/excel/ports/excel.service.port";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class ParseExcelUseCase {
  constructor(private readonly excel: ExcelServicePort) {}

  execute(file: Express.Multer.File) {
    const ext = file.originalname.split(".").pop()?.toLowerCase();
    if (!ext || !["xlsx", "xls", "csv"].includes(ext)) {
      throw AppError.badRequest("Chỉ hỗ trợ file .xlsx, .xls, .csv");
    }

    const rawRows = this.excel.parse(file.buffer);
    if (rawRows.length === 0) {
      throw AppError.badRequest("File trống hoặc không có dữ liệu");
    }

    const headerMap = this.buildHeaderMap(rawRows[0]!);
    const rows = rawRows.map((rawRow, idx) => {
      const row: {
        wordEn: string;
        wordVi: string;
        exampleSentence?: string;
        question?: string;
        choiceA?: string;
        choiceB?: string;
        choiceC?: string;
        choiceD?: string;
        correct?: string;
        _errors?: string[];
      } = { wordEn: "", wordVi: "" };
      const errors: string[] = [];

      for (const [origin, target] of Object.entries(headerMap)) {
        const value = String(rawRow[origin] ?? "").trim();
        if (target === "wordEn") row.wordEn = value;
        if (target === "wordVi") row.wordVi = value;
        if (target === "exampleSentence") row.exampleSentence = value;
        if (target === "question") row.question = value;
        if (target === "choiceA") row.choiceA = value;
        if (target === "choiceB") row.choiceB = value;
        if (target === "choiceC") row.choiceC = value;
        if (target === "choiceD") row.choiceD = value;
        if (target === "correct") row.correct = value;
      }

      if (!row.wordEn) errors.push(`Dòng ${idx + 2}: thiếu từ tiếng Anh`);
      if (!row.wordVi) errors.push(`Dòng ${idx + 2}: thiếu nghĩa tiếng Việt`);
      if (row.correct) {
        const upper = row.correct.toUpperCase();
        if (!["A", "B", "C", "D"].includes(upper)) {
          errors.push(`Dòng ${idx + 2}: cột "correct" phải là A, B, C hoặc D`);
        } else {
          row.correct = upper;
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
      if (["worde", "worden", "english", "en", "từtiếnganh", "tiếnganh"].includes(norm)) map[key] = "wordEn";
      else if (["wordvi", "wordvn", "vietnamese", "vi", "vn", "tiếngviệt", "nghĩa"].includes(norm)) map[key] = "wordVi";
      else if (["example", "examplesentence", "ví dụ", "vídu", "sentence"].includes(norm)) map[key] = "exampleSentence";
      else if (["question", "câuhỏi", "cauhoi", "prompt"].includes(norm)) map[key] = "question";
      else if (["choicea", "a", "đáp ána", "đápána"].includes(norm)) map[key] = "choiceA";
      else if (["choiceb", "b", "đáp ánb", "đápánb"].includes(norm)) map[key] = "choiceB";
      else if (["choicec", "c", "đáp ánc", "đápánc"].includes(norm)) map[key] = "choiceC";
      else if (["choiced", "d", "đáp ánd", "đápánd"].includes(norm)) map[key] = "choiceD";
      else if (["correct", "answer", "đáp ánđúng", "đápánđúng", "đúng"].includes(norm)) map[key] = "correct";
    }
    return map;
  }
}
