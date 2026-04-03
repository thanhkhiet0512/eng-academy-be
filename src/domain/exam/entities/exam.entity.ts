export type ExamQuestion = {
  id: string;
  type: "multiple_choice" | "matching" | "fill_blank" | "word_arrangement";
  points: number; // e.g. 1, 0.5, 2 — sum of all must be <= 10
  // multiple_choice
  prompt?: string;
  choices?: string[];
  correctIndex?: number;
  // matching
  pairs?: { left: string; right: string }[];
  // fill_blank
  sentence?: string;
  answer?: string;
  hint?: string;
  // word_arrangement
  words?: string[];
};

export type Exam = {
  id: string;
  teacherId: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  questions: ExamQuestion[];
  createdAt: Date;
};

export type ClassExam = {
  id: string;
  classId: string;
  examId: string;
  scheduledAt: Date | null;
  dueDate: Date | null;
  maxAttempts: number;
  status: "ACTIVE" | "CLOSED";
  createdAt: Date;
};

export type ExamAttempt = {
  id: string;
  studentId: string;
  classId: string;
  examId: string;
  scoreX100: number;
  totalX100: number;
  answers: unknown;
  createdAt: Date;
};
