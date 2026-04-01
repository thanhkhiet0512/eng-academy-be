import { Module } from "@nestjs/common";
import { ExcelServicePort } from "../../domain/excel/ports/excel.service.port";
import { XlsxService } from "./xlsx.service";

@Module({
  providers: [{ provide: ExcelServicePort, useClass: XlsxService }],
  exports: [ExcelServicePort],
})
export class ExcelModule {}
