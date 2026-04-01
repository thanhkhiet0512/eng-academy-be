// Domain entity representing a student
export type StudentStatus = "ACTIVE" | "INACTIVE";

export type StudentEntity = {
  id: string;
  classId: string;
  name: string;
  code: string | null;
  dateOfBirth: Date | null;
  parentName: string | null;
  parentPhone: string | null;
  note: string | null;
  status: StudentStatus;
  createdAt: Date;
};
