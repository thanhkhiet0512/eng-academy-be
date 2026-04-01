import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { ExcelServicePort } from "../../../domain/excel/ports/excel.service.port";
import { AppError } from "../../../common/errors/app.error";

// Use case: export student scores for a class as an Excel buffer
@Injectable()
export class ExportScoresUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly lessons: LessonRepositoryPort,
    private readonly excel: ExcelServicePort,
  ) {}

  async execute(classId: string, teacherId: string): Promise<{ buffer: Buffer; filename: string }> {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const [studentList, lessonList, allAttempts] = await Promise.all([
      this.students.findByClassId(classId),
      this.lessons.findByClassId(classId),
      this.attempts.findByClassId(classId),
    ]);

    // Map: lessonId → latest attempt score per student
    const scoreMap = new Map<string, Map<string, number>>();
    for (const attempt of allAttempts) {
      if (!scoreMap.has(attempt.studentId)) {
        scoreMap.set(attempt.studentId, new Map());
      }
      const studentMap = scoreMap.get(attempt.studentId)!;
      const existing = studentMap.get(attempt.lessonId);
      const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
      if (existing === undefined || pct > existing) {
        studentMap.set(attempt.lessonId, pct);
      }
    }

    const rows = studentList.map((s) => {
      const row: Record<string, string> = {
        code: s.code ?? "",
        name: s.name,
      };
      for (const lesson of lessonList) {
        const pct = scoreMap.get(s.id)?.get(lesson.id);
        row[lesson.id] = pct !== undefined ? `${pct}%` : "—";
      }
      return row;
    });

    const columns: { header: string; key: string; width: number }[] = [
      { header: "Mã HS", key: "code", width: 10 },
      { header: "Họ tên", key: "name", width: 28 },
      ...lessonList.map((l) => ({
        header: l.topic ?? l.unitTitle,
        key: l.id,
        width: 18,
      })),
    ];

    const buffer = this.excel.build(rows, columns);
    const filename = `diem_${classroom.name.replace(/\s+/g, "_")}.xlsx`;
    return { buffer, filename };
  }
}
