import type { StudentEntity, StudentStatus } from "../../../../domain/student/entities/student.entity";

export type StudentRow = {
  id: string;
  classId: string;
  name: string;
  code: string | null;
  dateOfBirth: Date | null;
  parentName: string | null;
  parentPhone: string | null;
  note: string | null;
  status: string;
  createdAt: Date;
};

export function mapStudentRowToDomain(row: StudentRow): StudentEntity {
  return {
    id: row.id,
    classId: row.classId,
    name: row.name,
    code: row.code,
    dateOfBirth: row.dateOfBirth,
    parentName: row.parentName,
    parentPhone: row.parentPhone,
    note: row.note,
    status: row.status as StudentStatus,
    createdAt: row.createdAt,
  };
}
