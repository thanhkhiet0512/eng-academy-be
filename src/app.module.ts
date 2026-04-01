import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./presentation/auth/auth.module";
import { LessonModule } from "./presentation/lesson/lesson.module";
import { TeacherModule } from "./presentation/teacher/teacher.module";
import { ClassroomModule } from "./presentation/classroom/classroom.module";
import { TermModule } from "./presentation/term/term.module";
import { StudentModule } from "./presentation/student/student.module";
import { ParentModule } from "./presentation/parent/parent.module";
import { ImportModule } from "./presentation/import/import.module";
import { UploadModule } from "./presentation/upload/upload.module";
import { AssignmentModule } from "./presentation/assignment/assignment.module";
import { AnalyticsModule } from "./presentation/analytics/analytics.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    LessonModule,
    TeacherModule,
    ClassroomModule,
    TermModule,
    StudentModule,
    ParentModule,
    ImportModule,
    UploadModule,
    AssignmentModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
