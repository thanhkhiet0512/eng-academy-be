import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";

const MIN_SEARCH_LEN = 2;
const MAX_SEARCH_RESULTS = 40;

// Use case: search classes and students belonging to a teacher by a query string
@Injectable()
export class SearchTeacherUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
  ) {}

  async execute(teacherId: string, query: string) {
    const raw = query.trim();
    if (raw.length < MIN_SEARCH_LEN) {
      return { query: raw, classes: [], students: [] };
    }

    const classList = await this.classes.findByTeacherId(teacherId);
    const pattern = new RegExp(this.escapeRegex(raw), "i");

    const matchedClasses = classList
      .filter((x) => pattern.test(x.name) || (!!x.code && pattern.test(x.code)))
      .slice(0, MAX_SEARCH_RESULTS)
      .map((x) => ({ id: x.id, code: x.code ?? "", name: x.name, gradeLevel: x.gradeLevel }));

    const classIds = classList.map((x) => x.id);
    const classNameById = new Map(classList.map((x) => [x.id, x.name]));

    // Search students in all teacher classes that match name or code
    const allStudents =
      classIds.length > 0
        ? await Promise.all(classIds.map((id) => this.students.findByClassId(id)))
        : [];

    const matchedStudents = allStudents
      .flat()
      .filter(
        (s) =>
          pattern.test(s.name) || (!!s.code && pattern.test(s.code)),
      )
      .slice(0, MAX_SEARCH_RESULTS)
      .map((s) => ({
        studentId: s.id,
        name: s.name,
        studentCode: s.code ?? "",
        classId: s.classId,
        className: classNameById.get(s.classId) ?? "",
      }));

    return { query: raw, classes: matchedClasses, students: matchedStudents };
  }

  private escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
