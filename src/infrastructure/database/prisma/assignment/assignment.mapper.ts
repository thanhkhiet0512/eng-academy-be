import type { AssignmentEntity, AssignmentStatus } from "../../../../domain/assignment/entities/assignment.entity";

export type AssignmentRow = {
  id: string;
  classId: string;
  lessonId: string;
  title: string;
  description: string | null;
  dueDate: Date;
  maxAttempts: number;
  status: string;
  createdAt: Date;
};

export function mapAssignmentRowToDomain(row: AssignmentRow): AssignmentEntity {
  return {
    id: row.id,
    classId: row.classId,
    lessonId: row.lessonId,
    title: row.title,
    description: row.description,
    dueDate: row.dueDate,
    maxAttempts: row.maxAttempts,
    status: row.status as AssignmentStatus,
    createdAt: row.createdAt,
  };
}
