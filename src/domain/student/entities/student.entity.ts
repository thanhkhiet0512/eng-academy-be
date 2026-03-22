// Domain entity representing a student
export type StudentEntity = {
  id: string;
  classId: string;
  name: string;
  code: string | null;
  dateOfBirth: Date | null;
  parentName: string | null;
  parentPhone: string | null;
  createdAt: Date;
};
