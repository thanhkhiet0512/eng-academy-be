import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../infra/auth/decorators/current-user.decorator";
import type { RequestUser } from "../../infra/auth/types/request-user.type";
import { UnitUseCase } from "../../application/unit/use-cases/unit.use-case";

@ApiTags("units")
@Controller("units")
@ApiBearerAuth()
export class UnitController {
  constructor(private readonly unitUseCase: UnitUseCase) {}

  // ── Units ──────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: "Danh sách unit từ vựng của giáo viên" })
  listUnits(@CurrentUser() user: RequestUser) {
    return this.unitUseCase.listUnits(user.id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "Tạo unit từ vựng mới" })
  createUnit(@CurrentUser() user: RequestUser, @Body() body: { title: string }) {
    return this.unitUseCase.createUnit(user.id, body.title);
  }

  @Patch(":unitId")
  @ApiOperation({ summary: "Đổi tên unit" })
  updateUnit(
    @CurrentUser() user: RequestUser,
    @Param("unitId") unitId: string,
    @Body() body: { title: string },
  ) {
    return this.unitUseCase.updateUnit(user.id, unitId, body.title);
  }

  @Delete(":unitId")
  @ApiOperation({ summary: "Xóa unit (và toàn bộ từ vựng trong unit)" })
  deleteUnit(@CurrentUser() user: RequestUser, @Param("unitId") unitId: string) {
    return this.unitUseCase.deleteUnit(user.id, unitId);
  }

  // ── Terms ──────────────────────────────────────────────────────────────────

  @Post(":unitId/terms")
  @HttpCode(201)
  @ApiOperation({ summary: "Thêm từ vựng vào unit" })
  createTerm(
    @CurrentUser() user: RequestUser,
    @Param("unitId") unitId: string,
    @Body()
    body: {
      wordEn: string;
      wordVi: string;
      imageUrl?: string | null;
      audioUrl?: string | null;
      exampleSentence?: string | null;
    },
  ) {
    return this.unitUseCase.createTerm(user.id, unitId, body);
  }

  @Patch("terms/:termId")
  @ApiOperation({ summary: "Cập nhật từ vựng" })
  updateTerm(
    @CurrentUser() user: RequestUser,
    @Param("termId") termId: string,
    @Body()
    body: {
      wordEn?: string;
      wordVi?: string;
      imageUrl?: string | null;
      audioUrl?: string | null;
      exampleSentence?: string | null;
    },
  ) {
    return this.unitUseCase.updateTerm(user.id, termId, body);
  }

  @Delete("terms/:termId")
  @ApiOperation({ summary: "Xóa từ vựng" })
  deleteTerm(@CurrentUser() user: RequestUser, @Param("termId") termId: string) {
    return this.unitUseCase.deleteTerm(user.id, termId);
  }
}
