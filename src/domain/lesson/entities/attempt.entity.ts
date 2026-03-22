export type ExerciseBreakdown = {
  exerciseId: string;
  type: string;
  correct: boolean;
};

export type Attempt = {
  id: string;
  studentId: string;
  classId: string;
  lessonId: string;
  score: number;
  total: number;
  createdAt: Date;
};
