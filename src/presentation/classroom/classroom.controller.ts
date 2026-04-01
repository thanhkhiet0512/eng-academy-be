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
import { CurrentUser } from "../../infra/auth/decorators/current-user.decorator";
import { Roles } from "../../infra/auth/decorators/roles.decorator";
import type { RequestUser } from "../../infra/auth/types/request-user.type";
import { CreateClassUseCase } from "../../application/classroom/use-cases/create-class.use-case";
import { GetClassDashboardUseCase } from "../../application/classroom/use-cases/get-class-dashboard.use-case";
import { GetAttendanceUseCase } from "../../application/classroom/use-cases/get-attendance.use-case";
import { PatchAttendanceUseCase } from "../../application/classroom/use-cases/patch-attendance.use-case";
import { AddStudentsUseCase } from "../../application/classroom/use-cases/add-students.use-case";
import type { AddStudentsBody } from "../../application/classroom/use-cases/add-students.use-case";
import { RemoveStudentUseCase } from "../../application/classroom/use-cases/remove-student.use-case";
import { GetStudentsTemplateUseCase } from "../../application/classroom/use-cases/get-students-template.use-case";
import { ParseStudentsExcelUseCase } from "../../application/classroom/use-cases/parse-students-excel.use-case";
import { GetStudentsListUseCase } from "../../application/classroom/use-cases/get-students-list.use-case";
import { UpdateStudentUseCase, type UpdateStudentInput } from "../../application/classroom/use-cases/update-student.use-case";
import { GetStudentProfileUseCase } from "../../application/classroom/use-cases/get-student-profile.use-case";
import { ExportScoresUseCase } from "../../application/classroom/use-cases/export-scores.use-case";
import { ExportAttendanceUseCase } from "../../application/classroom/use-cases/export-attendance.use-case";
import { SetClassStatusUseCase } from "../../application/classroom/use-cases/set-class-status.use-case";
import { GetMonthlyAttendanceUseCase } from "../../application/classroom/use-cases/get-monthly-attendance.use-case";
import type { ClassStatus } from "../../domain/class/entities/class.entity";

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
    private readonly getStudentsListUseCase: GetStudentsListUseCase,
    private readonly updateStudentUseCase: UpdateStudentUseCase,
    private readonly getStudentProfileUseCase: GetStudentProfileUseCase,
    private readonly exportScoresUseCase: ExportScoresUseCase,
    private readonly exportAttendanceUseCase: ExportAttendanceUseCase,
    private readonly setClassStatusUseCase: SetClassStatusUseCase,
    private readonly getMonthlyAttendanceUseCase: GetMonthlyAttendanceUseCase,
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

  @Get(":id/students/list")
  @ApiOperation({ summary: "Danh sách HS enriched (điểm TB, ghi chú, trạng thái)" })
  async getStudentsList(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.getStudentsListUseCase.execute(id, user.id);
  }

  @Patch(":id/students/:studentId")
  @ApiOperation({ summary: "Cập nhật thông tin HS (note, status, parent info)" })
  async updateStudent(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Param("studentId") studentId: string,
    @Body() body: UpdateStudentInput,
  ) {
    return this.updateStudentUseCase.execute(id, studentId, user.id, body);
  }

  @Get(":id/students/:studentId/profile")
  @ApiOperation({ summary: "Chi tiết 1 HS: info, attempts, ghi chú" })
  async getStudentProfile(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Param("studentId") studentId: string,
  ) {
    return this.getStudentProfileUseCase.execute(id, studentId, user.id);
  }

  @Get(":id/dashboard")
  @ApiOperation({ summary: "Dashboard lớp học" })
  async getDashboard(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.getClassDashboardUseCase.execute(id, user.id);
  }

  @Get(":id/attendance/monthly")
  @ApiOperation({ summary: "Điểm danh cả tháng (yearMonth=YYYY-MM)" })
  async getMonthlyAttendance(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Query("yearMonth") yearMonth: string,
  ) {
    return this.getMonthlyAttendanceUseCase.execute(id, user.id, yearMonth);
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

  @Patch(":id/status")
  @ApiOperation({ summary: "Lưu trữ hoặc khôi phục lớp học (ACTIVE / ARCHIVED)" })
  async setStatus(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() body: { status?: string },
  ) {
    const status = body.status as ClassStatus;
    await this.setClassStatusUseCase.execute(id, user.id, status);
  }

  @Get(":id/export/scores")
  @ApiOperation({ summary: "Xuất điểm học sinh toàn lớp ra Excel" })
  async exportScores(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.exportScoresUseCase.execute(id, user.id);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get(":id/export/attendance")
  @ApiOperation({ summary: "Xuất điểm danh theo tháng ra Excel (yearMonth=YYYY-MM)" })
  async exportAttendance(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Query("yearMonth") yearMonth: string,
    @Res() res: Response,
  ) {
    const ym = yearMonth || new Date().toISOString().slice(0, 7);
    const { buffer, filename } = await this.exportAttendanceUseCase.execute(id, user.id, ym);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
