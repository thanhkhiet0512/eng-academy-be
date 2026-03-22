import { Module } from "@nestjs/common";
import { StudentController } from "./student.controller";
import { ClassRepositoryPort } from "../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../domain/student/ports/student.repository.port";
import { LessonRepositoryPort } from "../../domain/lesson/ports/lesson.repository.port";
import { AttemptRepositoryPort } from "../../domain/lesson/ports/attempt.repository.port";
import { ClassRepositoryAdapter } from "../../infrastructure/database/prisma/class/class.repository.adapter";
import { StudentRepositoryAdapter } from "../../infrastructure/database/prisma/student/student.repository.adapter";
import { LessonRepositoryAdapter } from "../../infrastructure/database/prisma/lesson.repository.adapter";
import { AttemptRepositoryAdapter } from "../../infrastructure/database/prisma/attempt.repository.adapter";
import { LookupStudentUseCase } from "../../application/student/use-cases/lookup-student.use-case";
import { GetStudentHomeUseCase } from "../../application/student/use-cases/get-student-home.use-case";
import { GetStudentProgressUseCase } from "../../application/student/use-cases/get-student-progress.use-case";

@Module({
  controllers: [StudentController],
  providers: [
    { provide: ClassRepositoryPort, useClass: ClassRepositoryAdapter },
    { provide: StudentRepositoryPort, useClass: StudentRepositoryAdapter },
    { provide: LessonRepositoryPort, useClass: LessonRepositoryAdapter },
    { provide: AttemptRepositoryPort, useClass: AttemptRepositoryAdapter },
    LookupStudentUseCase,
    GetStudentHomeUseCase,
    GetStudentProgressUseCase,
  ],
  exports: [
    LookupStudentUseCase,
    GetStudentHomeUseCase,
    GetStudentProgressUseCase,
  ],
})
export class StudentModule {}
