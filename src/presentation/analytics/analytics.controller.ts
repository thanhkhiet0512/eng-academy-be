import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../infra/auth/decorators/current-user.decorator";
import { Public } from "../../infra/auth/decorators/public.decorator";
import { Roles } from "../../infra/auth/decorators/roles.decorator";
import type { RequestUser } from "../../infra/auth/types/request-user.type";
import { GetClassAnalyticsUseCase } from "../../application/analytics/use-cases/get-class-analytics.use-case";
import { GetLeaderboardUseCase } from "../../application/analytics/use-cases/get-leaderboard.use-case";
import { GetStudentAnalyticsUseCase } from "../../application/analytics/use-cases/get-student-analytics.use-case";

@ApiTags("analytics")
@Controller()
@ApiBearerAuth()
export class AnalyticsController {
  constructor(
    private readonly getClassAnalytics: GetClassAnalyticsUseCase,
    private readonly getLeaderboard: GetLeaderboardUseCase,
    private readonly getStudentAnalytics: GetStudentAnalyticsUseCase,
  ) {}

  @Get("classes/:id/analytics")
  @Roles("TEACHER")
  @ApiOperation({ summary: "Tổng quan lớp: điểm TB, top HS, most improved, chart" })
  async classAnalytics(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
  ) {
    return this.getClassAnalytics.execute(id, user.id);
  }

  @Get("classes/:id/leaderboard")
  @Roles("TEACHER")
  @ApiOperation({ summary: "Bảng xếp hạng (week/month/all)" })
  async leaderboard(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Query("period") period?: "week" | "month" | "all",
  ) {
    return this.getLeaderboard.execute(id, user.id, period ?? "all");
  }

  @Get("student/:id/analytics")
  @Public()
  @ApiOperation({ summary: "Analytics HS: trend, rank, weak areas" })
  async studentAnalytics(@Param("id") id: string) {
    return this.getStudentAnalytics.execute(id);
  }
}
