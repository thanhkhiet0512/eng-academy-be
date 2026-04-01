import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { StorageServicePort } from "../../domain/upload/ports/storage.service.port";
import { R2StorageService } from "./r2.service";

@Module({
  imports: [ConfigModule],
  providers: [{ provide: StorageServicePort, useClass: R2StorageService }],
  exports: [StorageServicePort],
})
export class StorageModule {}
