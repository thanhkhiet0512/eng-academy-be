export type ClassStatus = "ACTIVE" | "ARCHIVED";

// Domain entity representing a classroom
export type ClassEntity = {
  id: string;
  name: string;
  gradeLevel: string;
  code: string | null;
  teacherId: string;
  status: ClassStatus;
  createdAt: Date;
};
