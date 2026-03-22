import { ForbiddenException, Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { TermRepositoryPort } from "../../../domain/term/ports/term.repository.port";

export type ClassDashboardResult = {
  classId: string;
  className: string;
  classCode: string;
  students: {
    studentId: string;
    code: string;
    name: string;
    progressPercent: number;
    lastActive: Date;
  }[];
  lessons: { id: string; title: string; topic: string; createdAt: Date }[];
  termsCount: number;
};

// Use case: teacher views the full dashboard of a class they own
@Injectable()
export class GetClassDashboardUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
    private readonly lessons: LessonRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly terms: TermRepositoryPort,
  ) {}

  async execute(classId: string, teacherId: string): Promise<ClassDashboardResult> {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw new ForbiddenException("Bạn không có quyền với lớp này");
    }

    const [studentList, lessonList, termsCount, attemptList] = await Promise.all([
      this.students.findByClassId(classId),
      this.lessons.findByClassId(classId),
      this.terms.countByClassId(classId),
      this.attempts.findByClassId(classId),
    ]);

    const studentRows = studentList.map((student) => {
      const studentAttempts = attemptList.filter((a) => a.studentId === student.id);
      const avg =
        studentAttempts.length === 0
          ? 0
          : Math.round(
              (studentAttempts.reduce(
                (sum, a) => sum + (a.total ? (a.score / a.total) * 100 : 0),
                0,
              ) /
                studentAttempts.length) *
                10,
            ) / 10;
      return {
        studentId: student.id,
        code: student.code ?? "",
        name: student.name,
        progressPercent: avg,
        lastActive: studentAttempts[0]?.createdAt ?? student.createdAt,
      };
    });

    return {
      classId: classroom.id,
      className: classroom.name,
      classCode: classroom.code ?? "",
      students: studentRows,
      lessons: lessonList.map((x) => ({
        id: x.id,
        title: x.unitTitle,
        topic: x.topic,
        createdAt: x.createdAt,
      })),
      termsCount,
    };
  }
}
