// Domain entity for homework assignments
export type AssignmentStatus = "ACTIVE" | "CLOSED";

export type AssignmentEntity = {
  id: string;
  classId: string;
  lessonId: string;
  title: string;
  description: string | null;
  dueDate: Date;
  maxAttempts: number;
  status: AssignmentStatus;
  createdAt: Date;
};
