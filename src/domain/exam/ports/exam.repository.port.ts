import type { ClassExam, Exam, ExamAttempt, ExamQuestion } from "../entities/exam.entity";

export abstract class ExamRepositoryPort {
  abstract findById(id: string): Promise<Exam | null>;
  abstract findByTeacherId(teacherId: string): Promise<Exam[]>;
  abstract create(input: {
    teacherId: string;
    title: string;
    description?: string | null;
    durationMinutes: number;
    questions: ExamQuestion[];
  }): Promise<Exam>;
  abstract update(
    id: string,
    input: Partial<Pick<Exam, "title" | "description" | "durationMinutes" | "questions">>,
  ): Promise<Exam>;
  abstract delete(id: string): Promise<void>;

  // ClassExam
  abstract findClassExam(classId: string, examId: string): Promise<ClassExam | null>;
  abstract findClassExamsByClassId(classId: string): Promise<ClassExam[]>;
  abstract assignToClass(input: {
    classId: string;
    examId: string;
    scheduledAt?: Date | null;
    dueDate?: Date | null;
    maxAttempts: number;
  }): Promise<ClassExam>;
  abstract updateClassExam(
    id: string,
    input: Partial<Pick<ClassExam, "scheduledAt" | "dueDate" | "maxAttempts" | "status">>,
  ): Promise<ClassExam>;
  abstract removeFromClass(classId: string, examId: string): Promise<void>;

  // ExamAttempts
  abstract findAttemptsByStudentAndExam(studentId: string, examId: string): Promise<ExamAttempt[]>;
  abstract createAttempt(input: {
    studentId: string;
    classId: string;
    examId: string;
    scoreX100: number;
    totalX100: number;
    answers: unknown;
  }): Promise<ExamAttempt>;
}
