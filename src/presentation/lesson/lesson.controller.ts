import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../infra/auth/decorators/current-user.decorator";
import { Public } from "../../infra/auth/decorators/public.decorator";
import type { RequestUser } from "../../infra/auth/types/request-user.type";
import { CreateLessonDto, UpdateLessonDto } from "../../application/lesson/dtos/create-lesson.dto";
import { SubmitAttemptDto } from "../../application/lesson/dtos/submit-attempt.dto";
import { CreateLessonUseCase } from "../../application/lesson/use-cases/create-lesson.use-case";
import { DeleteLessonUseCase } from "../../application/lesson/use-cases/delete-lesson.use-case";
import { GetLessonForStudentUseCase } from "../../application/lesson/use-cases/get-lesson-for-student.use-case";
import { GetLessonsUseCase } from "../../application/lesson/use-cases/get-lessons.use-case";
import { SubmitAttemptUseCase } from "../../application/lesson/use-cases/submit-attempt.use-case";
import { UpdateLessonUseCase } from "../../application/lesson/use-cases/update-lesson.use-case";

@ApiTags("lessons")
@Controller("lessons")
export class LessonController {
  constructor(
    private readonly createLesson: CreateLessonUseCase,
    private readonly getLessons: GetLessonsUseCase,
    private readonly getLessonForStudent: GetLessonForStudentUseCase,
    private readonly updateLesson: UpdateLessonUseCase,
    private readonly deleteLesson: DeleteLessonUseCase,
    private readonly submitAttempt: SubmitAttemptUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Teacher tạo bài học mới" })
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateLessonDto) {
    return this.createLesson.execute(user.id, dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Teacher lấy danh sách bài học" })
  list(@CurrentUser() user: RequestUser, @Query("classId") classId: string) {
    return this.getLessons.execute(user.id, classId);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Teacher xem chi tiết bài học" })
  getOne(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.getLessons.executeOne(user.id, id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Teacher sửa tiêu đề / chủ đề bài học" })
  update(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.updateLesson.execute(user.id, id, dto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Teacher xoá bài học" })
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.deleteLesson.execute(user.id, id);
  }

  @Public()
  @Get("student/:id")
  @ApiOperation({ summary: "Student lấy bài học (không có đáp án)" })
  getForStudent(@Param("id") lessonId: string, @Query("studentId") studentId: string) {
    return this.getLessonForStudent.execute(lessonId, studentId);
  }

  @Public()
  @Post("attempts")
  @HttpCode(200)
  @ApiOperation({ summary: "Student nộp bài — trả score + breakdown" })
  submit(@Body() dto: SubmitAttemptDto) {
    return this.submitAttempt.execute(dto);
  }
}
