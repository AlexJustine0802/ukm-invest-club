import ExcelJS from "exceljs";

export interface SheetColumn {
  header: string;
  /** Column width in characters. Falls back to something sane per header. */
  width?: number;
}

/**
 * Build a one-sheet .xlsx from a header row and rows of cells.
 *
 * A real workbook rather than a CSV: Excel guesses the separator from the
 * machine's locale, so a comma-separated file lands in a single column on any
 * machine set to Indonesian. A workbook has no separator to guess, and it can
 * carry the column widths and a frozen header that make the sheet readable.
 */
export async function buildSheet(
  sheetName: string,
  columns: SheetColumn[],
  rows: (string | number | Date | null)[][],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(sheetName.slice(0, 31));

  sheet.columns = columns.map((c) => ({
    header: c.header,
    // Wide enough for the header itself when nothing better is given.
    width: c.width ?? Math.max(14, c.header.length + 2),
  }));

  const header = sheet.getRow(1);
  header.height = 28;
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.alignment = { vertical: "middle", horizontal: "left" };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF144DC8" },
  };
  header.eachCell((cell) => {
    cell.border = {
      bottom: { style: "medium", color: { argb: "FF0F3B9D" } },
    };
  });
  // The header stays put while scrolling a long directory.
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  for (const [index, row] of rows.entries()) {
    const added = sheet.addRow(row);
    added.alignment = { vertical: "top", wrapText: true };
    added.eachCell((cell) => {
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
      };
      if (index % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
    });
  }

  // Click-to-filter on every column, which is what makes a directory usable.
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };

  const data = await workbook.xlsx.writeBuffer();
  return Buffer.from(data);
}

export const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
