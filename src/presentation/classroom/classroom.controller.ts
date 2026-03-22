import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { Roles } from "../../auth/decorators/roles.decorator";
import type { RequestUser } from "../../auth/types/request-user.type";
import { CreateClassUseCase } from "../../application/classroom/use-cases/create-class.use-case";
import { GetClassDashboardUseCase } from "../../application/classroom/use-cases/get-class-dashboard.use-case";
import { GetAttendanceUseCase } from "../../application/classroom/use-cases/get-attendance.use-case";
import { PatchAttendanceUseCase } from "../../application/classroom/use-cases/patch-attendance.use-case";
import { AddStudentsUseCase } from "../../application/classroom/use-cases/add-students.use-case";
import type { AddStudentsBody } from "../../application/classroom/use-cases/add-students.use-case";
import { RemoveStudentUseCase } from "../../application/classroom/use-cases/remove-student.use-case";
import { GetStudentsTemplateUseCase } from "../../application/classroom/use-cases/get-students-template.use-case";
import { ParseStudentsExcelUseCase } from "../../application/classroom/use-cases/parse-students-excel.use-case";

@ApiTags("classes")
@Controller("classes")
@ApiBearerAuth()
@Roles("TEACHER")
export class ClassroomController {
  constructor(
    private readonly createClassUseCase: CreateClassUseCase,
    private readonly getClassDashboardUseCase: GetClassDashboardUseCase,
    private readonly getAttendanceUseCase: GetAttendanceUseCase,
    private readonly patchAttendanceUseCase: PatchAttendanceUseCase,
    private readonly addStudentsUseCase: AddStudentsUseCase,
    private readonly removeStudentUseCase: RemoveStudentUseCase,
    private readonly getStudentsTemplateUseCase: GetStudentsTemplateUseCase,
    private readonly parseStudentsExcelUseCase: ParseStudentsExcelUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Tạo lớp mới cho giáo viên" })
  async createClass(
    @CurrentUser() user: RequestUser,
    @Body() body: { name?: string; gradeLevel?: string; code?: string },
  ) {
    return this.createClassUseCase.execute({
      teacherId: user.id,
      name: body.name ?? "",
      gradeLevel: body.gradeLevel,
      code: body.code,
    });
  }

  @Get(":id/dashboard")
  @ApiOperation({ summary: "Dashboard lớp học" })
  async getDashboard(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.getClassDashboardUseCase.execute(id, user.id);
  }

  @Get(":id/attendance")
  @ApiOperation({ summary: "Điểm danh theo ngày" })
  async getAttendance(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Query("date") date?: string,
  ) {
    return this.getAttendanceUseCase.execute(id, user.id, date ?? "");
  }

  @Patch(":id/attendance")
  @ApiOperation({ summary: "Cập nhật điểm danh một học sinh" })
  async patchAttendance(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() body: { studentId?: string; present?: boolean; date?: string },
  ) {
    return this.patchAttendanceUseCase.execute({
      classId: id,
      teacherId: user.id,
      studentId: body.studentId ?? "",
      present: body.present ?? false,
      date: body.date ?? "",
    });
  }

  @Post(":id/students")
  @ApiOperation({ summary: "Thêm học sinh vào lớp" })
  async addStudents(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() body: AddStudentsBody,
  ) {
    return this.addStudentsUseCase.execute(id, user.id, body);
  }

  @Delete(":id/students/:studentId")
  @ApiOperation({ summary: "Xóa học sinh khỏi lớp" })
  async deleteStudent(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Param("studentId") studentId: string,
  ) {
    return this.removeStudentUseCase.execute(id, user.id, studentId);
  }

  @Get(":id/students/import")
  @ApiOperation({ summary: "Download file excel danh sách học sinh" })
  async downloadStudentsTemplate(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Res() res: Response,
  ) {
    const buf = await this.getStudentsTemplateUseCase.execute(id, user.id);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="students.xlsx"');
    res.send(buf);
  }

  @Post(":id/students/import")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Parse excel học sinh (preview, chưa lưu DB)" })
  async parseStudentsExcel(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("No file uploaded");
    return this.parseStudentsExcelUseCase.execute(id, user.id, file);
  }
}
