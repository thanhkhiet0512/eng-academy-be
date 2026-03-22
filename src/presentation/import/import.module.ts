import { Module } from "@nestjs/common";
import { ImportController } from "./import.controller";
import { ParseExcelUseCase } from "../../application/import/use-cases/parse-excel.use-case";

@Module({
  controllers: [ImportController],
  providers: [ParseExcelUseCase],
  exports: [ParseExcelUseCase],
})
export class ImportModule {}
