import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { ClassRepositoryPort } from "../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../domain/student/ports/student.repository.port";
import { AttemptRepositoryPort } from "../../domain/lesson/ports/attempt.repository.port";
import { AttendanceRepositoryPort } from "../../domain/attendance/ports/attendance.repository.port";
import { LessonRepositoryPort } from "../../domain/lesson/ports/lesson.repository.port";
import { ClassRepositoryAdapter } from "../../infrastructure/database/prisma/class/class.repository.adapter";
import { StudentRepositoryAdapter } from "../../infrastructure/database/prisma/student/student.repository.adapter";
import { AttemptRepositoryAdapter } from "../../infrastructure/database/prisma/attempt.repository.adapter";
import { AttendanceRepositoryAdapter } from "../../infrastructure/database/prisma/attendance/attendance.repository.adapter";
import { LessonRepositoryAdapter } from "../../infrastructure/database/prisma/lesson.repository.adapter";
import { GetClassAnalyticsUseCase } from "../../application/analytics/use-cases/get-class-analytics.use-case";
import { GetLeaderboardUseCase } from "../../application/analytics/use-cases/get-leaderboard.use-case";
import { GetStudentAnalyticsUseCase } from "../../application/analytics/use-cases/get-student-analytics.use-case";

@Module({
  controllers: [AnalyticsController],
  providers: [
    { provide: ClassRepositoryPort, useClass: ClassRepositoryAdapter },
    { provide: StudentRepositoryPort, useClass: StudentRepositoryAdapter },
    { provide: AttemptRepositoryPort, useClass: AttemptRepositoryAdapter },
    { provide: AttendanceRepositoryPort, useClass: AttendanceRepositoryAdapter },
    { provide: LessonRepositoryPort, useClass: LessonRepositoryAdapter },
    GetClassAnalyticsUseCase,
    GetLeaderboardUseCase,
    GetStudentAnalyticsUseCase,
  ],
})
export class AnalyticsModule {}
