import { useCallback, useMemo, useState } from "react";
import { LedesFileHandler } from "../lib/ledesFileHandler";
import { LedesValidator } from "../lib/ledesValidator";
import { LEDES_HEADERS, LedesData, ValidationResult } from "../lib/types";

export function useLedesData() {
  const [data, setData] = useState<LedesData>({
    headers: [...LEDES_HEADERS],
    rows: [],
  });
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    row_errors: [],
    dataset_errors: [],
  });
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validator = useMemo(() => new LedesValidator(), []);

  const validateData = useCallback(async () => {
    setIsValidating(true);
    try {
      // Convert rows to array format for validation (excluding headers)
      const rowArrays = data.rows.map((row) =>
        data.headers.map((header) => row[header] || "")
      );

      const result = validator.validateDataset(rowArrays, data.headers);
      setValidationResult(result);
    } catch (err) {
      console.error("Validation error:", err);
      setError("Failed to validate data");
    } finally {
      setIsValidating(false);
    }
  }, [data, validator]);

  const loadFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const ledesData = await LedesFileHandler.loadFromFile(file);
        setData(ledesData);

        // Validate immediately after loading
        setTimeout(() => {
          validateData();
        }, 100);
      } catch (err) {
        console.error("Error loading file:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load file";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [validateData]
  );

  const saveFile = useCallback(
    (filename?: string) => {
      try {
        LedesFileHandler.downloadFile(data, filename);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to save file";
        setError(errorMessage);
      }
    },
    [data]
  );

  const updateCell = useCallback(
    (rowIndex: number, columnId: string, value: string) => {
      setData((prevData) => {
        const newRows = [...prevData.rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          [columnId]: value,
        };

        const newData = {
          ...prevData,
          rows: newRows,
        };

        // Validate immediately with the new data
        setTimeout(() => {
          const rowArrays = newData.rows.map((row) =>
            newData.headers.map((header) => row[header] || "")
          );
          console.log("Validating data after cell update:", {
            rowIndex,
            columnId,
            value,
          });
          console.log("Row data being validated:", rowArrays[rowIndex]);
          const result = validator.validateDataset(rowArrays, newData.headers);
          console.log("Validation result:", result);
          console.log("Row errors count:", result.row_errors.length);
          console.log("Dataset errors count:", result.dataset_errors.length);
          setValidationResult(result);
        }, 50);

        return newData;
      });
    },
    [validator]
  );

  const addRow = useCallback(() => {
    const newRow = LedesFileHandler.createEmptyRow(data.headers);
    setData((prevData) => ({
      ...prevData,
      rows: [...prevData.rows, newRow],
    }));
  }, [data.headers]);

  const deleteRow = useCallback((rowIndex: number) => {
    setData((prevData) => ({
      ...prevData,
      rows: prevData.rows.filter((_, index) => index !== rowIndex),
    }));
  }, []);

  const insertRow = useCallback(
    (atIndex: number) => {
      const newRow = LedesFileHandler.createEmptyRow(data.headers);
      setData((prevData) => {
        const newRows = [...prevData.rows];
        newRows.splice(atIndex, 0, newRow);
        return {
          ...prevData,
          rows: newRows,
        };
      });
    },
    [data.headers]
  );

  const clearData = useCallback(() => {
    setData({
      headers: [...LEDES_HEADERS],
      rows: [],
    });
    setValidationResult({
      row_errors: [],
      dataset_errors: [],
    });
    setError(null);
  }, []);

  const createEmptyDataset = useCallback((rowCount: number = 10) => {
    const rows = Array.from({ length: rowCount }, () =>
      LedesFileHandler.createEmptyRow([...LEDES_HEADERS])
    );

    setData({
      headers: [...LEDES_HEADERS],
      rows,
    });
  }, []);

  // Get validation errors for a specific cell
  const getCellValidation = useCallback(
    (rowIndex: number, columnId: string) => {
      // Check for row-level field errors first
      const rowError = validationResult.row_errors.find(
        (error) => error.row === rowIndex + 1 && error.field === columnId
      );

      if (rowError) return rowError;

      // Check for dataset errors that affect this cell
      const datasetError = validationResult.dataset_errors.find((error) =>
        error.affected_rows.includes(rowIndex + 1)
      );

      if (
        datasetError &&
        (columnId === "INVOICE_TOTAL" ||
          columnId === "INVOICE_NUMBER" ||
          columnId === "INVOICE_DATE")
      ) {
        // Return a pseudo row error for dataset errors that affect invoice fields
        return {
          field: columnId,
          column: -1, // Special marker for dataset errors
          value: "",
          error: datasetError.error,
          row: rowIndex + 1,
        };
      }

      return undefined;
    },
    [validationResult]
  );

  // Get validation summary
  const validationSummary = useMemo(() => {
    const totalErrors =
      validationResult.row_errors.length +
      validationResult.dataset_errors.length;
    const fieldsWithErrors = new Set(
      validationResult.row_errors.map((e) => e.field)
    ).size;
    const rowsWithErrors = new Set(
      validationResult.row_errors.map((e) => e.row)
    ).size;

    return {
      totalErrors,
      fieldsWithErrors,
      rowsWithErrors,
      hasErrors: totalErrors > 0,
    };
  }, [validationResult]);

  return {
    // Data
    data,
    validationResult,
    validationSummary,
    isValidating,
    isLoading,
    error,

    // Actions
    loadFile,
    saveFile,
    updateCell,
    addRow,
    deleteRow,
    insertRow,
    clearData,
    createEmptyDataset,
    validateData,
    getCellValidation,

    // Utilities
    setError,
  };
}
