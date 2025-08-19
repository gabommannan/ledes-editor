import { LEDES_HEADERS, LedesData } from "./types";

export class LedesFileHandler {
  static parseFile(content: string): LedesData {
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      throw new Error("File is empty");
    }

    let headers: string[];
    let dataStartIndex = 0;

    // Look for the header line (contains pipe delimiters and field names)
    let headerLine: string | null = null;
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      const line = lines[i];
      if (line.includes("|") && !line.match(/^LEDES98BI\s+V\d+\[\]$/)) {
        // This looks like a header line (has pipes and isn't version info)
        headerLine = line;
        dataStartIndex = i + 1;
        break;
      }
    }

    if (headerLine && headerLine.includes("|")) {
      headers = headerLine.split("|").map((h) => {
        // Remove LEDES format suffixes like [] from headers
        return h.trim().replace(/\[\]$/, "").trim();
      });
    } else {
      // Use default LEDES headers if no header line found
      headers = [...LEDES_HEADERS];
      dataStartIndex = 0;
    }

    // Parse data rows (skip lines before data)
    const dataLines = lines.slice(dataStartIndex);

    const rows = dataLines
      .filter((line) => {
        // Skip empty lines
        const trimmedLine = line.trim();
        if (!trimmedLine) return false;

        // Skip version lines
        if (trimmedLine.match(/^LEDES98BI\s+V\d+\[\]$/)) return false;

        // Skip lines that contain header indicators like [] at the end of every field
        if (trimmedLine.includes("[]") && trimmedLine.endsWith("[]")) {
          const fields = trimmedLine.split("|");
          const allFieldsHaveBrackets = fields.every((field) =>
            field.trim().endsWith("[]")
          );
          if (allFieldsHaveBrackets) return false;
        }

        // Must have pipe delimiters to be a valid data row
        if (!trimmedLine.includes("|")) return false;

        return true;
      })
      .map((line, index) => {
        const fields = line.split("|");

        // Ensure we have the right number of fields
        while (fields.length < headers.length) {
          fields.push("");
        }

        // Create row object
        const row: Record<string, string> = {};
        headers.forEach((header, i) => {
          row[header] = (fields[i] || "").trim();
        });

        return row;
      });

    return { headers, rows };
  }

  static formatForDownload(data: LedesData): string {
    const { headers, rows } = data;

    // Create header line with [] suffix for LEDES format
    const headerLine = headers.map((h) => `${h}[]`).join("|");

    // Create data lines
    const dataLines = rows.map((row) =>
      headers.map((header) => row[header] || "").join("|")
    );

    return [headerLine, ...dataLines].join("\n");
  }

  static downloadFile(
    data: LedesData,
    filename: string = "ledes_data.txt"
  ): void {
    const content = this.formatForDownload(data);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  static async loadFromFile(file: File): Promise<LedesData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = this.parseFile(content);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  }

  static createEmptyRow(headers: string[]): Record<string, string> {
    const row: Record<string, string> = {};
    headers.forEach((header) => {
      row[header] = "";
    });
    return row;
  }

  static validateFileFormat(content: string): {
    isValid: boolean;
    error?: string;
  } {
    try {
      const lines = content.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        return { isValid: false, error: "File is empty" };
      }

      // Check if first line looks like headers or data
      const firstLine = lines[0];
      if (!firstLine.includes("|")) {
        return {
          isValid: false,
          error: "File does not appear to be pipe-delimited",
        };
      }

      // Try to parse and ensure we get actual data (not just headers)
      const parsed = this.parseFile(content);
      if (parsed.rows.length === 0) {
        return {
          isValid: false,
          error: "No data rows found in file (only headers detected)",
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
