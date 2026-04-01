import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { AppError } from "../../../common/errors/app.error";

export type StudentProfile = {
  id: string;
  code: string;
  name: string;
  dateOfBirth: string | null;
  parentName: string | null;
  parentPhone: string | null;
  note: string | null;
  status: string;
  className: string;
  avgScore: number;
  totalAttempts: number;
  recentAttempts: {
    lessonId: string;
    lessonTitle: string;
    topic: string;
    score: number;
    total: number;
    percent: number;
    createdAt: string;
  }[];
  createdAt: string;
};

@Injectable()
export class GetStudentProfileUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly lessons: LessonRepositoryPort,
  ) {}

  async execute(
    classId: string,
    studentId: string,
    teacherId: string,
  ): Promise<StudentProfile> {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const student = await this.students.findById(studentId);
    if (!student || student.classId !== classId) {
      throw AppError.notFound("Học sinh không tồn tại trong lớp này");
    }

    const [studentAttempts, lessonList] = await Promise.all([
      this.attempts.findByStudentId(studentId),
      this.lessons.findByClassId(classId),
    ]);

    const lessonMap = new Map(lessonList.map((l) => [l.id, l]));

    const avgScore =
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

    // Most recent 20 attempts
    const recentAttempts = studentAttempts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20)
      .map((a) => {
        const lesson = lessonMap.get(a.lessonId);
        return {
          lessonId: a.lessonId,
          lessonTitle: lesson?.unitTitle ?? "Bài đã xóa",
          topic: lesson?.topic ?? "",
          score: a.score,
          total: a.total,
          percent: a.total ? Math.round((a.score / a.total) * 100) : 0,
          createdAt: a.createdAt.toISOString(),
        };
      });

    return {
      id: student.id,
      code: student.code ?? "",
      name: student.name,
      dateOfBirth: student.dateOfBirth?.toISOString().split("T")[0] ?? null,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      note: student.note,
      status: student.status,
      className: classroom.name,
      avgScore,
      totalAttempts: studentAttempts.length,
      recentAttempts,
      createdAt: student.createdAt.toISOString(),
    };
  }
}
