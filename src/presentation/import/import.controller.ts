import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { ParseExcelUseCase } from "../../application/import/use-cases/parse-excel.use-case";

@ApiTags("import")
@Controller("import")
@ApiBearerAuth()
export class ImportController {
  constructor(private readonly parseExcelUseCase: ParseExcelUseCase) {}

  @Post("excel")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Parse excel từ vựng (preview)" })
  parseExcel(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file uploaded");
    return this.parseExcelUseCase.execute(file);
  }
}
