import { Module } from "@nestjs/common";
import { ClassroomController } from "./classroom.controller";
import { ClassRepositoryPort } from "../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../domain/student/ports/student.repository.port";
import { AttendanceRepositoryPort } from "../../domain/attendance/ports/attendance.repository.port";
import { AttemptRepositoryPort } from "../../domain/lesson/ports/attempt.repository.port";
import { LessonRepositoryPort } from "../../domain/lesson/ports/lesson.repository.port";
import { TermRepositoryPort } from "../../domain/term/ports/term.repository.port";
import { ClassRepositoryAdapter } from "../../infrastructure/database/prisma/class/class.repository.adapter";
import { StudentRepositoryAdapter } from "../../infrastructure/database/prisma/student/student.repository.adapter";
import { AttendanceRepositoryAdapter } from "../../infrastructure/database/prisma/attendance/attendance.repository.adapter";
import { AttemptRepositoryAdapter } from "../../infrastructure/database/prisma/attempt.repository.adapter";
import { LessonRepositoryAdapter } from "../../infrastructure/database/prisma/lesson.repository.adapter";
import { TermRepositoryAdapter } from "../../infrastructure/database/prisma/term/term.repository.adapter";
import { CreateClassUseCase } from "../../application/classroom/use-cases/create-class.use-case";
import { GetClassDashboardUseCase } from "../../application/classroom/use-cases/get-class-dashboard.use-case";
import { GetAttendanceUseCase } from "../../application/classroom/use-cases/get-attendance.use-case";
import { PatchAttendanceUseCase } from "../../application/classroom/use-cases/patch-attendance.use-case";
import { AddStudentsUseCase } from "../../application/classroom/use-cases/add-students.use-case";
import { RemoveStudentUseCase } from "../../application/classroom/use-cases/remove-student.use-case";
import { GetStudentsTemplateUseCase } from "../../application/classroom/use-cases/get-students-template.use-case";
import { ParseStudentsExcelUseCase } from "../../application/classroom/use-cases/parse-students-excel.use-case";
import { GetStudentsListUseCase } from "../../application/classroom/use-cases/get-students-list.use-case";
import { UpdateStudentUseCase } from "../../application/classroom/use-cases/update-student.use-case";
import { GetStudentProfileUseCase } from "../../application/classroom/use-cases/get-student-profile.use-case";
import { ExportScoresUseCase } from "../../application/classroom/use-cases/export-scores.use-case";
import { ExportAttendanceUseCase } from "../../application/classroom/use-cases/export-attendance.use-case";
import { SetClassStatusUseCase } from "../../application/classroom/use-cases/set-class-status.use-case";
import { GetMonthlyAttendanceUseCase } from "../../application/classroom/use-cases/get-monthly-attendance.use-case";
import { ExcelModule } from "../../infra/excel/excel.module";

@Module({
  imports: [ExcelModule],
  controllers: [ClassroomController],
  providers: [
    { provide: ClassRepositoryPort, useClass: ClassRepositoryAdapter },
    { provide: StudentRepositoryPort, useClass: StudentRepositoryAdapter },
    { provide: AttendanceRepositoryPort, useClass: AttendanceRepositoryAdapter },
    { provide: AttemptRepositoryPort, useClass: AttemptRepositoryAdapter },
    { provide: LessonRepositoryPort, useClass: LessonRepositoryAdapter },
    { provide: TermRepositoryPort, useClass: TermRepositoryAdapter },
    CreateClassUseCase,
    GetClassDashboardUseCase,
    GetAttendanceUseCase,
    PatchAttendanceUseCase,
    AddStudentsUseCase,
    RemoveStudentUseCase,
    GetStudentsTemplateUseCase,
    ParseStudentsExcelUseCase,
    GetStudentsListUseCase,
    UpdateStudentUseCase,
    GetStudentProfileUseCase,
    ExportScoresUseCase,
    ExportAttendanceUseCase,
    SetClassStatusUseCase,
    GetMonthlyAttendanceUseCase,
  ],
  exports: [
    ClassRepositoryPort,
    StudentRepositoryPort,
    AttendanceRepositoryPort,
    CreateClassUseCase,
    GetClassDashboardUseCase,
    GetAttendanceUseCase,
    PatchAttendanceUseCase,
    AddStudentsUseCase,
    RemoveStudentUseCase,
    GetStudentsTemplateUseCase,
    ParseStudentsExcelUseCase,
    GetStudentsListUseCase,
    UpdateStudentUseCase,
    GetStudentProfileUseCase,
  ],
})
export class ClassroomModule {}
