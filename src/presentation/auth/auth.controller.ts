import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RegisterDto } from "../../application/auth/dtos/register.dto";
import { LoginDto } from "../../application/auth/dtos/login.dto";
import { RegisterUseCase } from "../../application/auth/use-cases/register.use-case";
import { LoginUseCase } from "../../application/auth/use-cases/login.use-case";
import { Public } from "../../auth/decorators/public.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import type { RequestUser } from "../../auth/types/request-user.type";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Public()
  @Post("register")
  @HttpCode(201)
  @ApiOperation({ summary: "Đăng ký (mặc định role TEACHER)" })
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Đăng nhập — trả JWT Bearer" })
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Thông tin user từ JWT" })
  me(@CurrentUser() user: RequestUser) {
    return { user };
  }
}
