import type { AttendanceEntity } from "../entities/attendance.entity";

// Port (abstract class used as NestJS DI token) for attendance persistence
export abstract class AttendanceRepositoryPort {
  abstract findByClassIdAndDate(classId: string, date: string): Promise<AttendanceEntity[]>;
  abstract findByStudentId(classId: string, date: string, studentId: string): Promise<AttendanceEntity | null>;
  abstract upsert(input: {
    classId: string;
    studentId: string;
    date: string;
    present: boolean;
  }): Promise<void>;
  abstract deleteByStudentId(studentId: string, classId: string): Promise<void>;
}
