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
import type { RequestUser } from "../../infra/auth/types/request-user.type";
import { ListTermsUseCase } from "../../application/term/use-cases/list-terms.use-case";
import { CreateTermUseCase } from "../../application/term/use-cases/create-term.use-case";
import { GetTermUseCase } from "../../application/term/use-cases/get-term.use-case";
import { UpdateTermUseCase } from "../../application/term/use-cases/update-term.use-case";
import { DeleteTermUseCase } from "../../application/term/use-cases/delete-term.use-case";
import { SetTermAudioUseCase } from "../../application/term/use-cases/set-term-audio.use-case";

@ApiTags("terms")
@Controller("terms")
@ApiBearerAuth()
@Roles("TEACHER")
export class TermController {
  constructor(
    private readonly listTermsUseCase: ListTermsUseCase,
    private readonly createTermUseCase: CreateTermUseCase,
    private readonly getTermUseCase: GetTermUseCase,
    private readonly updateTermUseCase: UpdateTermUseCase,
    private readonly deleteTermUseCase: DeleteTermUseCase,
    private readonly setTermAudioUseCase: SetTermAudioUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: "Danh sách từ vựng theo classId" })
  async listByClass(@CurrentUser() user: RequestUser, @Query("classId") classId?: string) {
    return this.listTermsUseCase.execute(classId ?? "", user.id);
  }

  @Post()
  @ApiOperation({ summary: "Tạo từ vựng mới" })
  async create(
    @CurrentUser() user: RequestUser,
    @Body() body: { classId?: string; wordEn?: string; wordVi?: string; imageUrl?: string; exampleSentence?: string },
  ) {
    return this.createTermUseCase.execute(user.id, {
      classId: body.classId ?? "",
      wordEn: body.wordEn ?? "",
      wordVi: body.wordVi ?? "",
      imageUrl: body.imageUrl,
      exampleSentence: body.exampleSentence,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Chi tiết từ vựng" })
  async getOne(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.getTermUseCase.execute(id, user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Cập nhật từ vựng" })
  async patch(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() body: { wordEn?: string; wordVi?: string; imageUrl?: string; audioUrl?: string; exampleSentence?: string },
  ) {
    return this.updateTermUseCase.execute(id, user.id, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa từ vựng" })
  async remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.deleteTermUseCase.execute(id, user.id);
  }

  @Post(":id/audio")
  @ApiOperation({ summary: "Cập nhật audio cho từ vựng" })
  async setAudio(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() body: { classId?: string; audioUrl?: string },
  ) {
    return this.setTermAudioUseCase.execute(id, body.classId ?? "", user.id, body.audioUrl ?? "");
  }
}
