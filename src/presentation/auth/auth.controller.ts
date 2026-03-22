import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { RegisterDto } from "../../application/auth/dtos/register.dto";
import { LoginDto } from "../../application/auth/dtos/login.dto";
import { RegisterUseCase } from "../../application/auth/use-cases/register.use-case";
import { LoginUseCase } from "../../application/auth/use-cases/login.use-case";
import { Public } from "../../auth/decorators/public.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import type { RequestUser } from "../../auth/types/request-user.type";

const SESSION_COOKIE = "ea_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;

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
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.registerUseCase.execute(dto);
    this.setSessionCookie(res, result.accessToken);
    return {
      ok: true,
      teacherId: result.user.id,
      email: result.user.email,
      name: result.user.name,
    };
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Đăng nhập — trả JWT Bearer" })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.loginUseCase.execute(dto);
    this.setSessionCookie(res, result.accessToken);
    return {
      ok: true,
      teacherId: result.user.id,
      email: result.user.email,
      name: result.user.name,
    };
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Thông tin user từ JWT" })
  me(@CurrentUser() user: RequestUser) {
    return {
      teacherId: user.id,
      email: user.email,
      name: user.name,
    };
  }

  @Public()
  @Post("logout")
  @HttpCode(200)
  @ApiOperation({ summary: "Đăng xuất (xóa cookie phiên)" })
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return { ok: true };
  }

  private setSessionCookie(res: Response, token: string) {
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_AGE_SECONDS * 1000,
    });
  }
}
