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
import { ExamUseCase } from "../../application/exam/use-cases/exam.use-case";
import type { ExamQuestion } from "../../domain/exam/entities/exam.entity";

@ApiTags("exams")
@Controller("exams")
export class ExamController {
  constructor(private readonly examUseCase: ExamUseCase) {}

  // ── Teacher: Library ───────────────────────────────────────────────────────

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Danh sách đề thi của giáo viên" })
  list(@CurrentUser() user: RequestUser) {
    return this.examUseCase.listExams(user.id);
  }

  @Post()
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Tạo đề thi mới" })
  create(
    @CurrentUser() user: RequestUser,
    @Body()
    body: {
      title: string;
      description?: string | null;
      durationMinutes: number;
      questions: ExamQuestion[];
    },
  ) {
    return this.examUseCase.createExam(user.id, body);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cập nhật đề thi" })
  update(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body()
    body: {
      title?: string;
      description?: string | null;
      durationMinutes?: number;
      questions?: ExamQuestion[];
    },
  ) {
    return this.examUseCase.updateExam(user.id, id, body);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Xóa đề thi" })
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.examUseCase.deleteExam(user.id, id);
  }

  // ── Teacher: Assign to class ───────────────────────────────────────────────

  @Post(":examId/classes/:classId")
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Gán đề thi vào lớp" })
  assignToClass(
    @CurrentUser() user: RequestUser,
    @Param("examId") examId: string,
    @Param("classId") classId: string,
    @Body()
    body: {
      scheduledAt?: string | null;
      dueDate?: string | null;
      maxAttempts?: number;
    },
  ) {
    return this.examUseCase.assignToClass(user.id, classId, examId, {
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      maxAttempts: body.maxAttempts ?? 1,
    });
  }

  @Delete(":examId/classes/:classId")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Gỡ đề thi khỏi lớp" })
  removeFromClass(
    @CurrentUser() user: RequestUser,
    @Param("examId") examId: string,
    @Param("classId") classId: string,
  ) {
    return this.examUseCase.removeFromClass(user.id, classId, examId);
  }

  // ── Student ────────────────────────────────────────────────────────────────

  @Public()
  @Get("student/:examId")
  @ApiOperation({ summary: "Student lấy đề thi (không có đáp án)" })
  getForStudent(@Param("examId") examId: string, @Query("studentId") studentId: string) {
    return this.examUseCase.getExamForStudent(examId, studentId);
  }

  @Public()
  @Post("attempts")
  @HttpCode(200)
  @ApiOperation({ summary: "Student nộp bài thi" })
  submitAttempt(
    @Body()
    body: {
      studentId: string;
      examId: string;
      answers: { questionId: string; answer: unknown }[];
    },
  ) {
    return this.examUseCase.submitExamAttempt(body.studentId, body.examId, body.answers);
  }
}
