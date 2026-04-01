import { Injectable } from "@nestjs/common";
import * as XLSX from "xlsx";
import { ExcelServicePort, type ExcelRow } from "../../domain/excel/ports/excel.service.port";

@Injectable()
export class XlsxService extends ExcelServicePort {
  parse(buffer: Buffer): ExcelRow[] {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];
    if (!sheet) return [];
    return XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: "" });
  }

  build(
    rows: Record<string, string>[],
    columns: { header: string; key: string; width: number }[],
  ): Buffer {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      rows.length ? rows : [Object.fromEntries(columns.map((c) => [c.key, ""]))],
      {
        header: columns.map((c) => c.key),
      },
    );
    ws["!cols"] = columns.map((c) => ({ wch: c.width }));
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }
}
