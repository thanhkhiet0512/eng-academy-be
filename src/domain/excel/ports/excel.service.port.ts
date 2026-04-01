export type ExcelRow = Record<string, unknown>;

export abstract class ExcelServicePort {
  abstract parse(buffer: Buffer): ExcelRow[];

  abstract build(
    rows: Record<string, string>[],
    columns: { header: string; key: string; width: number }[],
  ): Buffer;
}
