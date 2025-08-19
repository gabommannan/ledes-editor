import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { ValidationResult } from "../lib/types";
import { cn } from "../lib/utils";

interface ValidationPanelProps {
  validationResult: ValidationResult;
  isValidating: boolean;
  onValidate: () => void;
}

export default function ValidationPanel({
  validationResult,
  isValidating,
  onValidate,
}: ValidationPanelProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    rowErrors: true,
    datasetErrors: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const totalErrors =
    validationResult.row_errors.length + validationResult.dataset_errors.length;
  const hasErrors = totalErrors > 0;

  const groupedRowErrors = validationResult.row_errors.reduce((acc, error) => {
    const key = error.row || 0;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(error);
    return acc;
  }, {} as Record<number, typeof validationResult.row_errors>);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Data Validation</h2>
        <button
          onClick={onValidate}
          disabled={isValidating}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isValidating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Validating...
            </>
          ) : (
            "Validate Data"
          )}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={cn(
            "p-4 rounded-lg border",
            hasErrors
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          )}
        >
          <div className="flex items-center">
            {hasErrors ? (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                hasErrors ? "text-red-800" : "text-green-800"
              )}
            >
              {hasErrors
                ? `${totalErrors} Error${totalErrors !== 1 ? "s" : ""}`
                : "All Valid"}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-blue-800">
              {validationResult.row_errors.length} Field Error
              {validationResult.row_errors.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-orange-50 border-orange-200">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-orange-800">
              {validationResult.dataset_errors.length} Dataset Error
              {validationResult.dataset_errors.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Row Errors */}
      {validationResult.row_errors.length > 0 && (
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection("rowErrors")}
            className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
          >
            <span className="font-medium text-gray-900">
              Field Validation Errors ({validationResult.row_errors.length})
            </span>
            {expandedSections.rowErrors ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {expandedSections.rowErrors && (
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(groupedRowErrors).map(([rowNum, errors]) => (
                <div key={rowNum} className="border-l-4 border-red-400 pl-4">
                  <h4 className="font-medium text-red-800 mb-2">
                    Row {rowNum} ({errors.length} error
                    {errors.length !== 1 ? "s" : ""})
                  </h4>
                  <div className="space-y-2">
                    {errors.map((error, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-gray-900">
                          {error.field}
                        </span>
                        <span className="text-gray-600">
                          {" "}
                          (Column {error.column}):{" "}
                        </span>
                        <span className="text-red-600">{error.error}</span>
                        {error.value && (
                          <div className="text-xs text-gray-500 mt-1">
                            Value: "{error.value}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dataset Errors */}
      {validationResult.dataset_errors.length > 0 && (
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection("datasetErrors")}
            className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
          >
            <span className="font-medium text-gray-900">
              Dataset Validation Errors (
              {validationResult.dataset_errors.length})
            </span>
            {expandedSections.datasetErrors ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {expandedSections.datasetErrors && (
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {validationResult.dataset_errors.map((error, index) => (
                <div key={index} className="border-l-4 border-orange-400 pl-4">
                  <h4 className="font-medium text-orange-800 mb-2">
                    {error.type === "invoice_consistency"
                      ? "Invoice Consistency Error"
                      : error.type}
                  </h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium text-gray-900">
                        Invoice:{" "}
                      </span>
                      <span className="text-gray-600">
                        {error.invoice_identifier}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Error: </span>
                      <span className="text-orange-600">{error.error}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">
                        Affected Rows:{" "}
                      </span>
                      <span className="text-gray-600">
                        {error.affected_rows.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Errors */}
      {!hasErrors && !isValidating && (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            All Data is Valid!
          </h3>
          <p className="text-gray-600">
            No validation errors found in the current dataset.
          </p>
        </div>
      )}
    </div>
  );
}
