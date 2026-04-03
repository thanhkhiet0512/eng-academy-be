import { Injectable } from "@nestjs/common";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { UnitRepositoryPort } from "../../../domain/unit/ports/unit.repository.port";

// Use case: legacy class-level report for parents (public, no auth)
@Injectable()
export class GetClassReportUseCase {
  constructor(
    private readonly students: StudentRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly units: UnitRepositoryPort,
  ) {}

  async execute(classId: string) {
    const cid = classId.trim();
    const [studentCount, vocabCount, attemptList] = await Promise.all([
      this.students.countByClassId(cid),
      this.units.countTermsByClassId(cid),
      this.attempts.findByClassId(cid),
    ]);

    const avgScore =
      attemptList.length === 0
        ? 0
        : Math.round(
            (attemptList.reduce((sum, x) => sum + (x.total ? (x.score / x.total) * 100 : 0), 0) /
              attemptList.length) *
              10,
          ) / 10;

    return {
      studentCount,
      newVocabulary: vocabCount,
      averageScore: avgScore,
      attemptsThisWeek: attemptList.length,
      teacherMessage:
        "Be dang tien bo rat tot o phan phat am. Gia dinh tiep tuc dong hanh cung be nhe!",
    };
  }
}
