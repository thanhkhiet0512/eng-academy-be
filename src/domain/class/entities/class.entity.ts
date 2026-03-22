// Domain entity representing a classroom
export type ClassEntity = {
  id: string;
  name: string;
  gradeLevel: string;
  code: string | null;
  teacherId: string;
  createdAt: Date;
};
