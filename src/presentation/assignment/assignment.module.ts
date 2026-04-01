import { Module } from "@nestjs/common";
import { AssignmentController } from "./assignment.controller";
import { ClassRepositoryPort } from "../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../domain/student/ports/student.repository.port";
import { LessonRepositoryPort } from "../../domain/lesson/ports/lesson.repository.port";
import { AttemptRepositoryPort } from "../../domain/lesson/ports/attempt.repository.port";
import { AssignmentRepositoryPort } from "../../domain/assignment/ports/assignment.repository.port";
import { ClassRepositoryAdapter } from "../../infrastructure/database/prisma/class/class.repository.adapter";
import { StudentRepositoryAdapter } from "../../infrastructure/database/prisma/student/student.repository.adapter";
import { LessonRepositoryAdapter } from "../../infrastructure/database/prisma/lesson.repository.adapter";
import { AttemptRepositoryAdapter } from "../../infrastructure/database/prisma/attempt.repository.adapter";
import { AssignmentRepositoryAdapter } from "../../infrastructure/database/prisma/assignment/assignment.repository.adapter";
import { CreateAssignmentUseCase } from "../../application/assignment/use-cases/create-assignment.use-case";
import { ListAssignmentsUseCase } from "../../application/assignment/use-cases/list-assignments.use-case";
import { GetAssignmentDetailUseCase } from "../../application/assignment/use-cases/get-assignment-detail.use-case";
import { UpdateAssignmentUseCase } from "../../application/assignment/use-cases/update-assignment.use-case";
import { DeleteAssignmentUseCase } from "../../application/assignment/use-cases/delete-assignment.use-case";
import { GetStudentAssignmentsUseCase } from "../../application/assignment/use-cases/get-student-assignments.use-case";

@Module({
  controllers: [AssignmentController],
  providers: [
    { provide: ClassRepositoryPort, useClass: ClassRepositoryAdapter },
    { provide: StudentRepositoryPort, useClass: StudentRepositoryAdapter },
    { provide: LessonRepositoryPort, useClass: LessonRepositoryAdapter },
    { provide: AttemptRepositoryPort, useClass: AttemptRepositoryAdapter },
    { provide: AssignmentRepositoryPort, useClass: AssignmentRepositoryAdapter },
    CreateAssignmentUseCase,
    ListAssignmentsUseCase,
    GetAssignmentDetailUseCase,
    UpdateAssignmentUseCase,
    DeleteAssignmentUseCase,
    GetStudentAssignmentsUseCase,
  ],
})
export class AssignmentModule {}
