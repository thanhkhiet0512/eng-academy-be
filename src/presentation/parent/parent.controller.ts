import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../../infra/auth/decorators/public.decorator";
import { GetParentDashboardUseCase } from "../../application/parent/use-cases/get-parent-dashboard.use-case";
import { GetClassReportUseCase } from "../../application/parent/use-cases/get-class-report.use-case";

@ApiTags("parent")
@Controller("parent")
@Public()
export class ParentController {
  constructor(
    private readonly getParentDashboardUseCase: GetParentDashboardUseCase,
    private readonly getClassReportUseCase: GetClassReportUseCase,
  ) {}

  @Get("student/:studentId/dashboard")
  @ApiOperation({ summary: "Dashboard phụ huynh theo học sinh" })
  async studentDashboard(@Param("studentId") studentId: string) {
    return this.getParentDashboardUseCase.execute(studentId);
  }

  @Get(":classId/report")
  @ApiOperation({ summary: "Report tổng quan theo lớp (legacy)" })
  async classReport(@Param("classId") classId: string) {
    return this.getClassReportUseCase.execute(classId);
  }
}
