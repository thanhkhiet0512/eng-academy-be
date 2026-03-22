import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UploadController } from "./upload.controller";
import { UploadFileUseCase } from "../../application/upload/use-cases/upload-file.use-case";

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [UploadFileUseCase],
  exports: [UploadFileUseCase],
})
export class UploadModule {}
