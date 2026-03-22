import { Module } from "@nestjs/common";
import { ClassRepositoryPort } from "../../domain/class/ports/class.repository.port";
import { StudentRepositoryPort } from "../../domain/student/ports/student.repository.port";
import { UserRepositoryPort } from "../../domain/auth/ports/user.repository.port";
import { ClassRepositoryAdapter } from "../../infrastructure/database/prisma/class/class.repository.adapter";
import { StudentRepositoryAdapter } from "../../infrastructure/database/prisma/student/student.repository.adapter";
import { UserRepositoryAdapter } from "../../infrastructure/database/prisma/user.repository.adapter";
import { GetTeacherClassesUseCase } from "../../application/teacher/use-cases/get-teacher-classes.use-case";
import { GetTeacherPreferencesUseCase } from "../../application/teacher/use-cases/get-teacher-preferences.use-case";
import { PatchTeacherPreferencesUseCase } from "../../application/teacher/use-cases/patch-teacher-preferences.use-case";
import { SearchTeacherUseCase } from "../../application/teacher/use-cases/search-teacher.use-case";
import { TeacherController } from "./teacher.controller";

@Module({
  controllers: [TeacherController],
  providers: [
    { provide: ClassRepositoryPort, useClass: ClassRepositoryAdapter },
    { provide: StudentRepositoryPort, useClass: StudentRepositoryAdapter },
    { provide: UserRepositoryPort, useClass: UserRepositoryAdapter },
    GetTeacherClassesUseCase,
    GetTeacherPreferencesUseCase,
    PatchTeacherPreferencesUseCase,
    SearchTeacherUseCase,
  ],
})
export class TeacherModule {}
