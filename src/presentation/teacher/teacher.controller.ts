import { Body, Controller, Get, Patch, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { Roles } from "../../auth/decorators/roles.decorator";
import type { RequestUser } from "../../auth/types/request-user.type";
import { PatchTeacherPreferencesDto } from "./dtos/patch-teacher-preferences.dto";
import { GetTeacherClassesUseCase } from "../../application/teacher/use-cases/get-teacher-classes.use-case";
import { GetTeacherPreferencesUseCase } from "../../application/teacher/use-cases/get-teacher-preferences.use-case";
import { PatchTeacherPreferencesUseCase } from "../../application/teacher/use-cases/patch-teacher-preferences.use-case";
import { SearchTeacherUseCase } from "../../application/teacher/use-cases/search-teacher.use-case";

@ApiTags("teacher")
@Controller("teacher")
@ApiBearerAuth()
@Roles("TEACHER")
export class TeacherController {
  constructor(
    private readonly getTeacherClassesUseCase: GetTeacherClassesUseCase,
    private readonly getTeacherPreferencesUseCase: GetTeacherPreferencesUseCase,
    private readonly patchTeacherPreferencesUseCase: PatchTeacherPreferencesUseCase,
    private readonly searchTeacherUseCase: SearchTeacherUseCase,
  ) {}

  @Get("classes")
  @ApiOperation({ summary: "Danh sách lớp của giáo viên đăng nhập" })
  async getClasses(@CurrentUser() user: RequestUser) {
    return this.getTeacherClassesUseCase.execute(user.id);
  }

  @Get("preferences")
  @ApiOperation({ summary: "Lấy teacher preferences" })
  async getPreferences(@CurrentUser() user: RequestUser) {
    return this.getTeacherPreferencesUseCase.execute(user.id);
  }

  @Patch("preferences")
  @ApiOperation({ summary: "Cập nhật teacher preferences" })
  async patchPreferences(@CurrentUser() user: RequestUser, @Body() dto: PatchTeacherPreferencesDto) {
    return this.patchTeacherPreferencesUseCase.execute(user.id, dto);
  }

  @Get("search")
  @ApiOperation({ summary: "Tìm lớp/học sinh trong các lớp của giáo viên" })
  async search(@CurrentUser() user: RequestUser, @Query("q") q?: string) {
    return this.searchTeacherUseCase.execute(user.id, q ?? "");
  }
}
