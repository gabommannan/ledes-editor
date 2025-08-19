import { Calendar, FileText, Info, Users } from "lucide-react";
import { LedesData } from "../lib/types";

interface InfoPanelProps {
  data: LedesData;
}

export default function InfoPanel({ data }: InfoPanelProps) {
  const rowCount = data.rows.length;
  const columnCount = data.headers.length;

  // Get some basic statistics
  const stats = {
    totalFields: rowCount * columnCount,
    emptyFields: data.rows.reduce((count, row) => {
      return (
        count +
        data.headers.filter(
          (header) => !row[header] || row[header].trim() === ""
        ).length
      );
    }, 0),
    uniqueInvoices: new Set(
      data.rows
        .map((row) =>
          [
            row["INVOICE_NUMBER"],
            row["LAW_FIRM_NAME"],
            row["CLIENT_NAME"],
          ].join("|")
        )
        .filter((key) => key !== "||")
    ).size,
    dateRange: getDateRange(data),
  };

  const completeness =
    stats.totalFields > 0
      ? (
          ((stats.totalFields - stats.emptyFields) / stats.totalFields) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Info className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-900">
          Dataset Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{rowCount}</p>
              <p className="text-sm text-blue-600">Rows</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-700">{columnCount}</p>
              <p className="text-sm text-green-600">Columns</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-purple-700">
                {stats.uniqueInvoices}
              </p>
              <p className="text-sm text-purple-600">Invoices</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">%</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">
                {completeness}%
              </p>
              <p className="text-sm text-orange-600">Complete</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900">Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total fields:</span>
              <span className="font-medium">
                {stats.totalFields.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Filled fields:</span>
              <span className="font-medium">
                {(stats.totalFields - stats.emptyFields).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Empty fields:</span>
              <span className="font-medium">
                {stats.emptyFields.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Date range:</span>
              <span className="font-medium">{stats.dateRange}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Format:</span>
              <span className="font-medium">LEDES98BI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delimiter:</span>
              <span className="font-medium">Pipe (|)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-md font-medium text-gray-900 mb-3">
          Field Summary
        </h3>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {getFieldSummary(data).map((field, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-600 truncate mr-2" title={field.name}>
                {field.name}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${field.fillPercentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">
                  {field.fillPercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getDateRange(data: LedesData): string {
  const dates: Date[] = [];

  data.rows.forEach((row) => {
    [
      "INVOICE_DATE",
      "BILLING_START_DATE",
      "BILLING_END_DATE",
      "LINE_ITEM_DATE",
    ].forEach((field) => {
      const dateStr = row[field];
      if (dateStr && dateStr.length === 8) {
        try {
          const year = parseInt(dateStr.substring(0, 4));
          const month = parseInt(dateStr.substring(4, 6));
          const day = parseInt(dateStr.substring(6, 8));
          dates.push(new Date(year, month - 1, day));
        } catch {
          // Invalid date, skip
        }
      }
    });
  });

  if (dates.length === 0) {
    return "No dates found";
  }

  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  if (minDate.getTime() === maxDate.getTime()) {
    return minDate.toLocaleDateString();
  }

  return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
}

function getFieldSummary(data: LedesData) {
  return data.headers
    .map((header) => {
      const filledCount = data.rows.filter(
        (row) => row[header] && row[header].trim() !== ""
      ).length;
      const fillPercentage =
        data.rows.length > 0
          ? Math.round((filledCount / data.rows.length) * 100)
          : 0;

      return {
        name: header,
        fillPercentage,
        filledCount,
      };
    })
    .sort((a, b) => b.fillPercentage - a.fillPercentage);
}
