import { Module } from "@nestjs/common";
import { UploadController } from "./upload.controller";
import { UploadFileUseCase } from "../../application/upload/use-cases/upload-file.use-case";
import { StorageModule } from "../../infra/storage/storage.module";

@Module({
  imports: [StorageModule],
  controllers: [UploadController],
  providers: [UploadFileUseCase],
  exports: [UploadFileUseCase],
})
export class UploadModule {}
