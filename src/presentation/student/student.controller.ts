import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../../infra/auth/decorators/public.decorator";
import { LookupStudentUseCase } from "../../application/student/use-cases/lookup-student.use-case";
import { GetStudentHomeUseCase } from "../../application/student/use-cases/get-student-home.use-case";
import { GetStudentProgressUseCase } from "../../application/student/use-cases/get-student-progress.use-case";

@ApiTags("student")
@Controller("student")
@Public()
export class StudentController {
  constructor(
    private readonly lookupStudentUseCase: LookupStudentUseCase,
    private readonly getStudentHomeUseCase: GetStudentHomeUseCase,
    private readonly getStudentProgressUseCase: GetStudentProgressUseCase,
  ) {}

  @Post("lookup")
  @ApiOperation({ summary: "Học sinh lookup theo class key + tên" })
  async lookup(@Body() body: { name?: string; classKey?: string; classId?: string }) {
    return this.lookupStudentUseCase.execute(
      body.name ?? "",
      body.classKey ?? body.classId ?? "",
    );
  }

  @Get(":id/home")
  @ApiOperation({ summary: "Home payload của học sinh" })
  async home(@Param("id") id: string) {
    return this.getStudentHomeUseCase.execute(id);
  }

  @Get(":id/progress")
  @ApiOperation({ summary: "Progress payload của học sinh" })
  async progress(@Param("id") id: string) {
    return this.getStudentProgressUseCase.execute(id);
  }
}
