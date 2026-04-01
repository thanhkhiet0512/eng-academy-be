import type { AttendanceEntity } from "../../../../domain/attendance/entities/attendance.entity";

export type AttendanceRow = {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  present: boolean;
};

export function mapAttendanceRowToDomain(row: AttendanceRow): AttendanceEntity {
  return {
    id: row.id,
    classId: row.classId,
    studentId: row.studentId,
    date: row.date,
    present: row.present,
  };
}
