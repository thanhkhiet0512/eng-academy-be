import { Module } from "@nestjs/common";
import { CreateLessonUseCase } from "../../application/lesson/use-cases/create-lesson.use-case";
import { DeleteLessonUseCase } from "../../application/lesson/use-cases/delete-lesson.use-case";
import { GetLessonForStudentUseCase } from "../../application/lesson/use-cases/get-lesson-for-student.use-case";
import { GetLessonsUseCase } from "../../application/lesson/use-cases/get-lessons.use-case";
import { SubmitAttemptUseCase } from "../../application/lesson/use-cases/submit-attempt.use-case";
import { UpdateLessonUseCase } from "../../application/lesson/use-cases/update-lesson.use-case";
import { ClassRepositoryPort } from "../../domain/class/ports/class.repository.port";
import { AttemptRepositoryPort } from "../../domain/lesson/ports/attempt.repository.port";
import { LessonRepositoryPort } from "../../domain/lesson/ports/lesson.repository.port";
import { StudentRepositoryPort } from "../../domain/student/ports/student.repository.port";
import { AttemptRepositoryAdapter } from "../../infrastructure/database/prisma/attempt.repository.adapter";
import { ClassRepositoryAdapter } from "../../infrastructure/database/prisma/class.repository.adapter";
import { LessonRepositoryAdapter } from "../../infrastructure/database/prisma/lesson.repository.adapter";
import { StudentRepositoryAdapter } from "../../infrastructure/database/prisma/student.repository.adapter";
import { LessonController } from "./lesson.controller";

@Module({
  controllers: [LessonController],
  providers: [
    CreateLessonUseCase,
    GetLessonsUseCase,
    GetLessonForStudentUseCase,
    UpdateLessonUseCase,
    DeleteLessonUseCase,
    SubmitAttemptUseCase,
    { provide: LessonRepositoryPort, useClass: LessonRepositoryAdapter },
    { provide: AttemptRepositoryPort, useClass: AttemptRepositoryAdapter },
    { provide: ClassRepositoryPort, useClass: ClassRepositoryAdapter },
    { provide: StudentRepositoryPort, useClass: StudentRepositoryAdapter },
  ],
})
export class LessonModule {}
