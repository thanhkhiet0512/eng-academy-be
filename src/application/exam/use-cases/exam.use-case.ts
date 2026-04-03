import { Injectable } from "@nestjs/common";
import { ExamRepositoryPort } from "../../../domain/exam/ports/exam.repository.port";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import type { ExamQuestion } from "../../../domain/exam/entities/exam.entity";
import { AppError } from "../../../common/errors/app.error";

const MAX_TOTAL_POINTS = 10;

@Injectable()
export class ExamUseCase {
  constructor(
    private readonly exams: ExamRepositoryPort,
    private readonly classes: ClassRepositoryPort,
    private readonly students: StudentRepositoryPort,
  ) {}

  // ── Teacher: Library CRUD ──────────────────────────────────────────────────

  async listExams(teacherId: string) {
    const exams = await this.exams.findByTeacherId(teacherId);
    return { exams };
  }

  async createExam(
    teacherId: string,
    input: {
      title: string;
      description?: string | null;
      durationMinutes: number;
      questions: ExamQuestion[];
    },
  ) {
    if (!input.title?.trim()) throw AppError.badRequest("title là bắt buộc");
    if (!input.durationMinutes || input.durationMinutes < 1) {
      throw AppError.badRequest("durationMinutes phải >= 1");
    }
    this.validateQuestions(input.questions);

    const exam = await this.exams.create({
      teacherId,
      title: input.title.trim(),
      description: input.description ?? null,
      durationMinutes: input.durationMinutes,
      questions: input.questions,
    });
    return { examId: exam.id };
  }

  async updateExam(
    teacherId: string,
    examId: string,
    input: {
      title?: string;
      description?: string | null;
      durationMinutes?: number;
      questions?: ExamQuestion[];
    },
  ) {
    const exam = await this.exams.findById(examId);
    if (!exam) throw AppError.notFound("Đề thi không tồn tại");
    if (exam.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");

    if (input.questions) this.validateQuestions(input.questions);

    await this.exams.update(examId, {
      title: input.title?.trim(),
      description: input.description,
      durationMinutes: input.durationMinutes,
      questions: input.questions,
    });
    return { ok: true };
  }

  async deleteExam(teacherId: string, examId: string) {
    const exam = await this.exams.findById(examId);
    if (!exam) throw AppError.notFound("Đề thi không tồn tại");
    if (exam.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");
    await this.exams.delete(examId);
    return { ok: true };
  }

  // ── Teacher: Assign to class ───────────────────────────────────────────────

  async assignToClass(
    teacherId: string,
    classId: string,
    examId: string,
    input: {
      scheduledAt?: Date | null;
      dueDate?: Date | null;
      maxAttempts?: number;
    },
  ) {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");

    const exam = await this.exams.findById(examId);
    if (!exam) throw AppError.notFound("Đề thi không tồn tại");
    if (exam.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");

    const classExam = await this.exams.assignToClass({
      classId,
      examId,
      scheduledAt: input.scheduledAt ?? null,
      dueDate: input.dueDate ?? null,
      maxAttempts: input.maxAttempts ?? 1,
    });
    return { classExamId: classExam.id };
  }

  async removeFromClass(teacherId: string, classId: string, examId: string) {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");
    await this.exams.removeFromClass(classId, examId);
    return { ok: true };
  }

  async listClassExams(teacherId: string, classId: string) {
    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");
    const classExams = await this.exams.findClassExamsByClassId(classId);
    return { classExams };
  }

  // ── Student: Take exam ─────────────────────────────────────────────────────

  async getExamForStudent(examId: string, studentId: string) {
    const student = await this.students.findById(studentId);
    if (!student) throw AppError.notFound("Học sinh không tồn tại");

    const classExam = await this.exams.findClassExam(student.classId, examId);
    if (!classExam || classExam.status === "CLOSED") {
      throw AppError.forbidden("Đề thi không có sẵn cho lớp bạn");
    }

    const now = new Date();
    if (classExam.scheduledAt && now < classExam.scheduledAt) {
      throw AppError.forbidden("Đề thi chưa bắt đầu");
    }
    if (classExam.dueDate && now > classExam.dueDate) {
      throw AppError.forbidden("Đề thi đã kết thúc");
    }

    // Check attempt count
    const attempts = await this.exams.findAttemptsByStudentAndExam(studentId, examId);
    if (attempts.length >= classExam.maxAttempts) {
      throw AppError.badRequest("Bạn đã hết lượt làm bài");
    }

    const exam = await this.exams.findById(examId);
    if (!exam) throw AppError.notFound("Đề thi không tồn tại");

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      questions: exam.questions.map((q) => this.sanitizeQuestion(q)),
      attemptsLeft: classExam.maxAttempts - attempts.length,
    };
  }

  async submitExamAttempt(
    studentId: string,
    examId: string,
    answers: { questionId: string; answer: unknown }[],
  ) {
    const student = await this.students.findById(studentId);
    if (!student) throw AppError.notFound("Học sinh không tồn tại");

    const classExam = await this.exams.findClassExam(student.classId, examId);
    if (!classExam || classExam.status === "CLOSED") {
      throw AppError.forbidden("Đề thi không có sẵn");
    }

    const attempts = await this.exams.findAttemptsByStudentAndExam(studentId, examId);
    if (attempts.length >= classExam.maxAttempts) {
      throw AppError.badRequest("Bạn đã hết lượt làm bài");
    }

    const exam = await this.exams.findById(examId);
    if (!exam) throw AppError.notFound("Đề thi không tồn tại");

    let scoreX100 = 0;
    const totalX100 = Math.round(exam.questions.reduce((s, q) => s + q.points, 0) * 100);

    const breakdown = exam.questions.map((q) => {
      const ans = answers.find((a) => a.questionId === q.id);
      const correct = ans ? this.gradeQuestion(q, ans.answer) : false;
      if (correct) scoreX100 += Math.round(q.points * 100);
      return { questionId: q.id, correct, points: correct ? q.points : 0 };
    });

    await this.exams.createAttempt({
      studentId,
      classId: student.classId,
      examId,
      scoreX100,
      totalX100,
      answers,
    });

    return {
      scoreX100,
      totalX100,
      score: scoreX100 / 100,
      total: totalX100 / 100,
      breakdown,
    };
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  private validateQuestions(questions: ExamQuestion[]) {
    if (!questions?.length) throw AppError.badRequest("Đề thi phải có ít nhất 1 câu hỏi");

    const total = questions.reduce((s, q) => s + (q.points ?? 0), 0);
    if (Math.round(total * 100) > MAX_TOTAL_POINTS * 100) {
      throw AppError.badRequest(`Tổng điểm không được vượt quá ${MAX_TOTAL_POINTS} điểm (hiện tại: ${total})`);
    }

    questions.forEach((q, idx) => {
      if (!q.points || q.points <= 0) {
        throw AppError.badRequest(`Câu ${idx + 1}: points phải > 0`);
      }
    });
  }

  private sanitizeQuestion(q: ExamQuestion): object {
    const base = { id: q.id, type: q.type, points: q.points };
    switch (q.type) {
      case "multiple_choice":
        return { ...base, prompt: q.prompt, choices: q.choices };
      case "matching": {
        const rightItems = (q.pairs ?? [])
          .map((p, i) => ({ text: p.right, origIndex: i }))
          .sort(() => Math.random() - 0.5);
        return {
          ...base,
          leftItems: (q.pairs ?? []).map((p, i) => ({ index: i, text: p.left })),
          rightItems,
        };
      }
      case "fill_blank":
        return { ...base, sentence: q.sentence, hint: q.hint };
      case "word_arrangement":
        return { ...base, words: q.words };
    }
  }

  private gradeQuestion(q: ExamQuestion, answer: unknown): boolean {
    const ans = answer as Record<string, unknown>;
    switch (q.type) {
      case "multiple_choice":
        return ans.selectedIndex === q.correctIndex;
      case "matching": {
        const pairs = ans.pairs as { leftIndex: number; rightIndex: number }[] | undefined;
        if (!pairs?.length || pairs.length !== (q.pairs?.length ?? 0)) return false;
        return pairs.every(({ leftIndex, rightIndex }) => leftIndex === rightIndex);
      }
      case "fill_blank": {
        const text = typeof ans.text === "string" ? ans.text : "";
        const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
        return normalize(text) === normalize(q.answer ?? "");
      }
      case "word_arrangement": {
        const arranged = ans.arranged as number[] | undefined;
        if (!arranged?.length) return false;
        const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
        const reconstructed = arranged.map((i) => (q.words ?? [])[i] ?? "").join(" ");
        return normalize(reconstructed) === normalize(q.answer ?? "");
      }
    }
  }
}
