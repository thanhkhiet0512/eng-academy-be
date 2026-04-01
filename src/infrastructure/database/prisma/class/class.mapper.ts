import type { ClassEntity, ClassStatus } from "../../../../domain/class/entities/class.entity";

export type ClassRow = {
  id: string;
  name: string;
  gradeLevel: string;
  code: string | null;
  teacherId: string;
  status: string;
  createdAt: Date;
};

export function mapClassRowToDomain(row: ClassRow): ClassEntity {
  return {
    id: row.id,
    name: row.name,
    gradeLevel: row.gradeLevel,
    code: row.code,
    teacherId: row.teacherId,
    status: (row.status ?? "ACTIVE") as ClassStatus,
    createdAt: row.createdAt,
  };
}
