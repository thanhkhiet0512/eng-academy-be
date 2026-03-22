import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./presentation/auth/auth.module";
import { LessonModule } from "./presentation/lesson/lesson.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    LessonModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
