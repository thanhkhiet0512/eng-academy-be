import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../infra/auth/decorators/current-user.decorator";
import { Roles } from "../../infra/auth/decorators/roles.decorator";
import { Public } from "../../infra/auth/decorators/public.decorator";
import type { RequestUser } from "../../infra/auth/types/request-user.type";
import { CreateAssignmentUseCase, type CreateAssignmentInput } from "../../application/assignment/use-cases/create-assignment.use-case";
import { ListAssignmentsUseCase } from "../../application/assignment/use-cases/list-assignments.use-case";
import { GetAssignmentDetailUseCase } from "../../application/assignment/use-cases/get-assignment-detail.use-case";
import { UpdateAssignmentUseCase, type UpdateAssignmentInput } from "../../application/assignment/use-cases/update-assignment.use-case";
import { DeleteAssignmentUseCase } from "../../application/assignment/use-cases/delete-assignment.use-case";
import { GetStudentAssignmentsUseCase } from "../../application/assignment/use-cases/get-student-assignments.use-case";

@ApiTags("assignments")
@Controller("assignments")
@ApiBearerAuth()
export class AssignmentController {
  constructor(
    private readonly createAssignment: CreateAssignmentUseCase,
    private readonly listAssignments: ListAssignmentsUseCase,
    private readonly getAssignmentDetail: GetAssignmentDetailUseCase,
    private readonly updateAssignment: UpdateAssignmentUseCase,
    private readonly deleteAssignment: DeleteAssignmentUseCase,
    private readonly getStudentAssignments: GetStudentAssignmentsUseCase,
  ) {}

  @Post()
  @Roles("TEACHER")
  @ApiOperation({ summary: "Tạo bài tập (GV chọn lesson + deadline)" })
  async create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateAssignmentInput,
  ) {
    return this.createAssignment.execute(user.id, body);
  }

  @Get()
  @Roles("TEACHER")
  @ApiOperation({ summary: "Danh sách bài tập theo lớp" })
  async list(
    @CurrentUser() user: RequestUser,
    @Query("classId") classId: string,
  ) {
    return this.listAssignments.execute(classId, user.id);
  }

  @Get("student/:studentId")
  @Public()
  @ApiOperation({ summary: "HS xem bài tập được giao" })
  async studentAssignments(@Param("studentId") studentId: string) {
    return this.getStudentAssignments.execute(studentId);
  }

  @Get(":id")
  @Roles("TEACHER")
  @ApiOperation({ summary: "Chi tiết bài tập + trạng thái nộp bài mỗi HS" })
  async detail(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
  ) {
    return this.getAssignmentDetail.execute(id, user.id);
  }

  @Patch(":id")
  @Roles("TEACHER")
  @ApiOperation({ summary: "Sửa bài tập (deadline, status...)" })
  async update(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() body: UpdateAssignmentInput,
  ) {
    return this.updateAssignment.execute(id, user.id, body);
  }

  @Delete(":id")
  @Roles("TEACHER")
  @ApiOperation({ summary: "Xóa bài tập" })
  async remove(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
  ) {
    return this.deleteAssignment.execute(id, user.id);
  }
}
