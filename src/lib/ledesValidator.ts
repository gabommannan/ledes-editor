import {
  DatasetValidationError,
  ValidationError,
  ValidationResult,
} from "./types";

export class LedesValidator {
  private validStateCodes = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
    "DC",
  ];

  private fieldValidators: Record<
    string,
    (value: string) => [boolean, string]
  > = {
    INVOICE_DATE: this.validateDate.bind(this),
    BILLING_START_DATE: this.validateDate.bind(this),
    BILLING_END_DATE: this.validateDate.bind(this),
    LINE_ITEM_DATE: this.validateDate.bind(this),
    LINE_ITEM_TAX_RATE: this.validateDecimal.bind(this),
    LINE_ITEM_NUMBER_OF_UNITS: this.validateDecimal.bind(this),
    LINE_ITEM_NUMBER: this.validateInteger.bind(this),
    LAW_FIRM_POSTCODE: this.validatePostcode.bind(this),
    CLIENT_POSTCODE: this.validatePostcode.bind(this),
    LAW_FIRM_STATEorREGION: this.validateStateOrRegion.bind(this),
    CLIENT_STATEorREGION: this.validateStateOrRegion.bind(this),
  };

  validateField(fieldName: string, value: string): [boolean, string] {
    // Empty values are generally allowed (optional fields)
    if (!value || value.trim() === "") {
      return [true, ""];
    }

    // Check if field has specific validation rules
    if (fieldName in this.fieldValidators) {
      return this.fieldValidators[fieldName](value);
    } else {
      // Generic text validation (no pipes allowed, reasonable length)
      return this.validateText(value);
    }
  }

  private validateDate(value: string): [boolean, string] {
    if (!/^\d{8}$/.test(value)) {
      return [false, "Date must be in YYYYMMDD format"];
    }

    try {
      const year = parseInt(value.substring(0, 4));
      const month = parseInt(value.substring(4, 6));
      const day = parseInt(value.substring(6, 8));

      const date = new Date(year, month - 1, day);

      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        return [false, "Invalid date"];
      }

      return [true, ""];
    } catch {
      return [false, "Invalid date"];
    }
  }

  private validateDecimal(value: string): [boolean, string] {
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return [false, "Invalid decimal number"];
      }
      return [true, ""];
    } catch {
      return [false, "Invalid decimal number"];
    }
  }

  private validateInteger(value: string): [boolean, string] {
    try {
      const intValue = parseInt(value);
      if (isNaN(intValue) || intValue.toString() !== value) {
        return [false, "Must be a whole number"];
      }
      return [true, ""];
    } catch {
      return [false, "Must be a whole number"];
    }
  }

  private validatePostcode(value: string): [boolean, string] {
    // Allow various postcode formats (US ZIP, UK, Canadian, etc.)
    if (/^[A-Z0-9\-\s]{3,10}$/i.test(value)) {
      return [true, ""];
    } else {
      return [false, "Invalid postcode format"];
    }
  }

  private validateStateOrRegion(value: string): [boolean, string] {
    // Allow US state codes or any reasonable region name
    if (this.validStateCodes.includes(value.toUpperCase())) {
      return [true, ""];
    } else if (/^[A-Z\s]{2,50}$/i.test(value)) {
      return [true, ""];
    } else {
      return [false, "Invalid state or region format"];
    }
  }

  private validateText(value: string): [boolean, string] {
    // Check for pipe characters (not allowed in LEDES format)
    if (value.includes("|")) {
      return [false, "Pipe character (|) not allowed"];
    }

    // Check reasonable length (adjust as needed)
    if (value.length > 1000) {
      return [false, "Text too long (maximum 1000 characters)"];
    }

    return [true, ""];
  }

  validateRow(rowData: string[], headers: string[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (let i = 0; i < headers.length && i < rowData.length; i++) {
      const fieldName = headers[i];
      const value = rowData[i];
      const [isValid, errorMessage] = this.validateField(fieldName, value);

      if (!isValid) {
        errors.push({
          field: fieldName,
          column: i + 1,
          value: value,
          error: errorMessage,
        });
      }
    }

    return errors;
  }

  validateCrossFieldRow(
    rowData: string[],
    headers: string[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const rowDict: Record<string, string> = {};

    // Create dictionary for easier field access
    headers.forEach((header, index) => {
      rowDict[header] = rowData[index] || "";
    });

    // Validate billing date range
    const billingStart = rowDict["BILLING_START_DATE"] || "";
    const billingEnd = rowDict["BILLING_END_DATE"] || "";

    if (billingStart && billingEnd) {
      const [startValid] = this.validateDate(billingStart);
      const [endValid] = this.validateDate(billingEnd);

      if (startValid && endValid) {
        try {
          const startDate = this.parseDate(billingStart);
          const endDate = this.parseDate(billingEnd);

          if (endDate < startDate) {
            // Add error to both related fields to highlight the relationship
            errors.push({
              field: "BILLING_START_DATE",
              column: headers.indexOf("BILLING_START_DATE") + 1,
              value: billingStart,
              error: "Billing start date must be on or before billing end date",
            });
            errors.push({
              field: "BILLING_END_DATE",
              column: headers.indexOf("BILLING_END_DATE") + 1,
              value: billingEnd,
              error: "Billing end date must be on or after billing start date",
            });
          }
        } catch {
          // Date validation errors will be caught by individual field validation
        }
      }
    }

    // Validate line item total calculation
    const units = rowDict["LINE_ITEM_NUMBER_OF_UNITS"] || "";
    const unitCost = rowDict["LINE_ITEM_UNIT_COST"] || "";
    const adjustment = rowDict["LINE_ITEM_ADJUSTMENT_AMOUNT"] || "";
    const tax = rowDict["LINE_ITEM_TAX_TOTAL"] || "";
    const lineTotal = rowDict["LINE_ITEM_TOTAL"] || "";

    if (units && unitCost && lineTotal) {
      try {
        const unitsDecimal = parseFloat(units) || 0;
        const unitCostDecimal =
          parseFloat(unitCost.replace(/[^\d.-]/g, "")) || 0;
        const adjustmentDecimal =
          parseFloat(adjustment.replace(/[^\d.-]/g, "")) || 0;
        const taxDecimal = parseFloat(tax.replace(/[^\d.-]/g, "")) || 0;
        const lineTotalDecimal =
          parseFloat(lineTotal.replace(/[^\d.-]/g, "")) || 0;

        const calculatedTotal =
          unitsDecimal * unitCostDecimal + adjustmentDecimal + taxDecimal;

        // Allow for small rounding differences (within 0.01)
        if (Math.abs(calculatedTotal - lineTotalDecimal) > 0.01) {
          const errorMessage = `Line item calculation error: ${unitsDecimal} × ${unitCostDecimal} + ${adjustmentDecimal} + ${taxDecimal} should equal ${calculatedTotal.toFixed(
            2
          )}, but total shows ${lineTotalDecimal}`;

          // Add errors to all fields involved in the calculation
          errors.push({
            field: "LINE_ITEM_NUMBER_OF_UNITS",
            column: headers.indexOf("LINE_ITEM_NUMBER_OF_UNITS") + 1,
            value: units,
            error: errorMessage,
          });
          errors.push({
            field: "LINE_ITEM_UNIT_COST",
            column: headers.indexOf("LINE_ITEM_UNIT_COST") + 1,
            value: unitCost,
            error: errorMessage,
          });
          if (adjustment) {
            errors.push({
              field: "LINE_ITEM_ADJUSTMENT_AMOUNT",
              column: headers.indexOf("LINE_ITEM_ADJUSTMENT_AMOUNT") + 1,
              value: adjustment,
              error: errorMessage,
            });
          }
          if (tax) {
            errors.push({
              field: "LINE_ITEM_TAX_TOTAL",
              column: headers.indexOf("LINE_ITEM_TAX_TOTAL") + 1,
              value: tax,
              error: errorMessage,
            });
          }
          errors.push({
            field: "LINE_ITEM_TOTAL",
            column: headers.indexOf("LINE_ITEM_TOTAL") + 1,
            value: lineTotal,
            error: errorMessage,
          });
        }
      } catch {
        // Numeric validation errors will be caught by individual field validation
      }
    }

    return errors;
  }

  validateDataset(dataset: string[][], headers: string[]): ValidationResult {
    const rowErrors: ValidationError[] = [];
    const datasetErrors: DatasetValidationError[] = [];

    // Validate each row individually and collect cross-field errors
    dataset.forEach((rowData, rowIndex) => {
      // Individual field validation
      const fieldErrors = this.validateRow(rowData, headers);
      fieldErrors.forEach((error) => {
        error.row = rowIndex + 1;
        rowErrors.push(error);
      });

      // Cross-field validation within the row
      const crossFieldErrors = this.validateCrossFieldRow(rowData, headers);
      crossFieldErrors.forEach((error) => {
        error.row = rowIndex + 1;
        rowErrors.push(error);
      });
    });

    // Cross-row validation (invoice total consistency)
    datasetErrors.push(
      ...this.validateInvoiceTotalsConsistency(dataset, headers)
    );

    return { row_errors: rowErrors, dataset_errors: datasetErrors };
  }

  private validateInvoiceTotalsConsistency(
    dataset: string[][],
    headers: string[]
  ): DatasetValidationError[] {
    const errors: DatasetValidationError[] = [];

    // Check if we have the required fields
    if (!headers.includes("INVOICE_TOTAL")) {
      return errors;
    }

    // Group by invoice identifier
    const invoiceIdentifierFields = [
      "INVOICE_DATE",
      "LAW_FIRM_NAME",
      "CLIENT_NAME",
      "INVOICE_NUMBER",
    ];

    const availableIdentifiers = invoiceIdentifierFields.filter((field) =>
      headers.includes(field)
    );

    if (availableIdentifiers.length === 0) {
      return errors;
    }

    // Group rows by invoice
    const invoices: Record<
      string,
      Array<{ rowIndex: number; invoiceTotal: string }>
    > = {};

    dataset.forEach((rowData, rowIndex) => {
      const rowDict: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowDict[header] = rowData[index] || "";
      });

      // Create invoice key from available identifier fields
      const invoiceKey = availableIdentifiers
        .map((field) => rowDict[field] || "")
        .join("|");

      if (!invoices[invoiceKey]) {
        invoices[invoiceKey] = [];
      }

      invoices[invoiceKey].push({
        rowIndex,
        invoiceTotal: rowDict["INVOICE_TOTAL"] || "",
      });
    });

    // Check consistency within each invoice
    Object.entries(invoices).forEach(([invoiceKey, invoiceRows]) => {
      if (invoiceRows.length <= 1) {
        return; // Single row invoices are automatically consistent
      }

      // Get all unique invoice totals for this invoice
      const invoiceTotals = new Set<number>();
      invoiceRows.forEach(({ invoiceTotal }) => {
        if (invoiceTotal) {
          try {
            const normalizedTotal = parseFloat(
              invoiceTotal.replace(/[^\d.-]/g, "")
            );
            if (!isNaN(normalizedTotal)) {
              invoiceTotals.add(normalizedTotal);
            }
          } catch {
            // Invalid totals will be caught by individual field validation
          }
        }
      });

      // If we have more than one unique total, that's an error
      if (invoiceTotals.size > 1) {
        const identifierParts = invoiceKey.split("|");
        const identifierStr = availableIdentifiers
          .map((field, i) => `${field}=${identifierParts[i]}`)
          .filter((part) => !part.endsWith("="))
          .join(", ");

        errors.push({
          type: "invoice_consistency",
          invoice_identifier: identifierStr,
          error: `Invoice has inconsistent totals: ${Array.from(invoiceTotals)
            .sort()
            .join(", ")}`,
          affected_rows: invoiceRows.map((row) => row.rowIndex + 1),
        });
      }
    });

    return errors;
  }

  private parseDate(dateStr: string): Date {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6));
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month - 1, day);
  }
}
