import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";

// Use case: return all classes owned by the teacher with student counts
@Injectable()
export class GetTeacherClassesUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
  ) {}

  async execute(teacherId: string) {
    const classList = await this.classes.findByTeacherId(teacherId);

    // Fetch student counts per class in parallel
    const counts = await Promise.all(
      classList.map((c) => this.students.countByClassId(c.id)),
    );

    return {
      classes: classList.map((x, i) => ({
        id: x.id,
        code: x.code ?? "",
        name: x.name,
        gradeLevel: x.gradeLevel,
        createdAt: x.createdAt,
        studentCount: counts[i] ?? 0,
      })),
    };
  }
}
