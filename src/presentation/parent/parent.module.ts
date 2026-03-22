import { Module } from "@nestjs/common";
import { ParentController } from "./parent.controller";
import { ClassRepositoryPort } from "../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../domain/student/ports/student.repository.port";
import { LessonRepositoryPort } from "../../domain/lesson/ports/lesson.repository.port";
import { AttemptRepositoryPort } from "../../domain/lesson/ports/attempt.repository.port";
import { TermRepositoryPort } from "../../domain/term/ports/term.repository.port";
import { UserRepositoryPort } from "../../domain/auth/ports/user.repository.port";
import { ClassRepositoryAdapter } from "../../infrastructure/database/prisma/class/class.repository.adapter";
import { StudentRepositoryAdapter } from "../../infrastructure/database/prisma/student/student.repository.adapter";
import { LessonRepositoryAdapter } from "../../infrastructure/database/prisma/lesson.repository.adapter";
import { AttemptRepositoryAdapter } from "../../infrastructure/database/prisma/attempt.repository.adapter";
import { TermRepositoryAdapter } from "../../infrastructure/database/prisma/term/term.repository.adapter";
import { UserRepositoryAdapter } from "../../infrastructure/database/prisma/user.repository.adapter";
import { GetParentDashboardUseCase } from "../../application/parent/use-cases/get-parent-dashboard.use-case";
import { GetClassReportUseCase } from "../../application/parent/use-cases/get-class-report.use-case";

@Module({
  controllers: [ParentController],
  providers: [
    { provide: ClassRepositoryPort, useClass: ClassRepositoryAdapter },
    { provide: StudentRepositoryPort, useClass: StudentRepositoryAdapter },
    { provide: LessonRepositoryPort, useClass: LessonRepositoryAdapter },
    { provide: AttemptRepositoryPort, useClass: AttemptRepositoryAdapter },
    { provide: TermRepositoryPort, useClass: TermRepositoryAdapter },
    { provide: UserRepositoryPort, useClass: UserRepositoryAdapter },
    GetParentDashboardUseCase,
    GetClassReportUseCase,
  ],
  exports: [GetParentDashboardUseCase, GetClassReportUseCase],
})
export class ParentModule {}
