// Domain entity representing an attendance record
export type AttendanceEntity = {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  present: boolean;
};
