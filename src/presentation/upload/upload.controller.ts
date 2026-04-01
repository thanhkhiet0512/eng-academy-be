import { BadRequestException, Controller, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request } from "express";
import { CurrentUser } from "../../infra/auth/decorators/current-user.decorator";
import type { RequestUser } from "../../infra/auth/types/request-user.type";
import { UploadFileUseCase } from "../../application/upload/use-cases/upload-file.use-case";

@ApiTags("upload")
@Controller("upload")
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadFileUseCase: UploadFileUseCase) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload file image/audio lên R2" })
  async upload(
    @CurrentUser() user: RequestUser,
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("Invalid request");
    const folder = this.readFolder(req);
    if (!folder) throw new BadRequestException("Invalid request");
    return this.uploadFileUseCase.execute(user.id, folder, file);
  }

  private readFolder(req: Request): "images" | "audio" | null {
    const raw = (req.body as { folder?: unknown } | undefined)?.folder;
    const folder = typeof raw === "string" ? raw : null;
    if (folder === "images" || folder === "audio") return folder;
    return null;
  }
}
