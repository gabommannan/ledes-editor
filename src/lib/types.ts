// LEDES98BI Type Definitions

export interface LedesRow {
  [key: string]: string;
}

export interface ValidationError {
  field: string;
  column: number;
  value: string;
  error: string;
  row?: number;
}

export interface DatasetValidationError {
  type: string;
  invoice_identifier: string;
  error: string;
  affected_rows: number[];
}

export interface ValidationResult {
  row_errors: ValidationError[];
  dataset_errors: DatasetValidationError[];
}

export interface LedesData {
  headers: string[];
  rows: LedesRow[];
}

// LEDES98BI Field Headers (52 fields)
export const LEDES_HEADERS = [
  "INVOICE_DATE",
  "INVOICE_NUMBER",
  "CLIENT_MATTER_ID",
  "INVOICE_TOTAL",
  "INVOICE_DESCRIPTION",
  "LAW_FIRM_MATTER_ID",
  "BILLING_START_DATE",
  "BILLING_END_DATE",
  "INVOICE_TAX_TOTAL",
  "INVOICE_NET_TOTAL",
  "INVOICE_CURRENCY",
  "INVOICE_TAX_CURRENCY",
  "INVOICE_REPORTED_TAX_TOTAL",
  "LINE_ITEM_NUMBER",
  "LINE_ITEM_NUMBER_OF_UNITS",
  "LINE_ITEM_DATE",
  "LINE_ITEM_UNIT_COST",
  "LINE_ITEM_ADJUSTMENT_AMOUNT",
  "LINE_ITEM_TOTAL",
  "LINE_ITEM_TAX_TOTAL",
  "LINE_ITEM_TAX_RATE",
  "LINE_ITEM_DESCRIPTION",
  "LINE_ITEM_TYPE",
  "LINE_ITEM_EXPENSE_TYPE",
  "LINE_ITEM_TASK_CODE",
  "LINE_ITEM_ACTIVITY_CODE",
  "LINE_ITEM_LAWYER_ID",
  "LINE_ITEM_EXP_DESCRIPTION",
  "LAW_FIRM_NAME",
  "LAW_FIRM_ADDRESS_1",
  "LAW_FIRM_ADDRESS_2",
  "LAW_FIRM_CITY",
  "LAW_FIRM_STATEorREGION",
  "LAW_FIRM_POSTCODE",
  "LAW_FIRM_COUNTRY",
  "LAW_FIRM_PHONE",
  "LAW_FIRM_FAX",
  "LAW_FIRM_EMAIL",
  "LAW_FIRM_REGISTRATION_ID",
  "CLIENT_NAME",
  "CLIENT_ADDRESS_1",
  "CLIENT_ADDRESS_2",
  "CLIENT_CITY",
  "CLIENT_STATEorREGION",
  "CLIENT_POSTCODE",
  "CLIENT_COUNTRY",
  "CLIENT_PHONE",
  "CLIENT_FAX",
  "CLIENT_EMAIL",
  "CLIENT_REGISTRATION_ID",
  "RESERVED1",
  "RESERVED2",
  "RESERVED3",
] as const;

export type LedesHeaderType = (typeof LEDES_HEADERS)[number];
