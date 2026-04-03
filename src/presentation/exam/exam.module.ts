import { Module } from "@nestjs/common";
import { ExamUseCase } from "../../application/exam/use-cases/exam.use-case";
import { ExamRepositoryPort } from "../../domain/exam/ports/exam.repository.port";
import { ClassRepositoryPort } from "../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../domain/student/ports/student.repository.port";
import { ExamRepositoryAdapter } from "../../infrastructure/database/prisma/exam/exam.repository.adapter";
import { ClassRepositoryAdapter } from "../../infrastructure/database/prisma/class/class.repository.adapter";
import { StudentRepositoryAdapter } from "../../infrastructure/database/prisma/student/student.repository.adapter";
import { ExamController } from "./exam.controller";

@Module({
  controllers: [ExamController],
  providers: [
    ExamUseCase,
    { provide: ExamRepositoryPort, useClass: ExamRepositoryAdapter },
    { provide: ClassRepositoryPort, useClass: ClassRepositoryAdapter },
    { provide: StudentRepositoryPort, useClass: StudentRepositoryAdapter },
  ],
})
export class ExamModule {}
