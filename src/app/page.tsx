"use client";

import { BarChart3, Download, FileText, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import FileUpload from "../components/FileUpload";
import InfoPanel from "../components/InfoPanel";
import LedesTable from "../components/LedesTable";
import ValidationPanel from "../components/ValidationPanel";
import { useLedesData } from "../hooks/useLedesData";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"editor" | "validation" | "info">(
    "editor"
  );
  const [showUpload, setShowUpload] = useState(true);

  const {
    data,
    validationResult,
    validationSummary,
    isValidating,
    isLoading,
    error,
    loadFile,
    saveFile,
    updateCell,
    addRow,
    deleteRow,
    clearData,
    createEmptyDataset,
    validateData,
    getCellValidation,
    setError,
  } = useLedesData();

  // Auto-validate after data changes (debounced)
  useEffect(() => {
    if (data.rows.length > 0) {
      const timer = setTimeout(() => {
        console.log("Running validation from useEffect");
        validateData();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [data, validateData]);

  const handleFileLoad = async (file: File) => {
    setShowUpload(false);
    await loadFile(file);
  };

  const handleCreateNew = () => {
    createEmptyDataset(10);
    setShowUpload(false);
  };

  const hasData = data.rows.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  LEDES98BI Editor
                </h1>
                <p className="text-sm text-gray-600">
                  Web-based legal invoice editor
                </p>
              </div>
            </div>

            {hasData && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={addRow}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row
                </button>

                <button
                  onClick={() => saveFile()}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>

                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all data?")) {
                      clearData();
                      setShowUpload(true);
                    }
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showUpload && !hasData ? (
          <div className="max-w-2xl mx-auto">
            <FileUpload
              onFileLoad={handleFileLoad}
              isLoading={isLoading}
              error={error}
            />

            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Or</span>
                </div>
              </div>

              <button
                onClick={handleCreateNew}
                className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Dataset
              </button>
            </div>
          </div>
        ) : hasData ? (
          <div className="space-y-6">
            {/* Status Bar */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span>{data.rows.length} rows</span>
                  <span>{data.headers.length} columns</span>
                  {validationSummary.hasErrors && (
                    <span className="text-red-600 font-medium">
                      {validationSummary.totalErrors} validation error
                      {validationSummary.totalErrors !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setActiveTab("editor")}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "editor"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    onClick={() => setActiveTab("validation")}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "validation"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Validation
                    {validationSummary.hasErrors && (
                      <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {validationSummary.totalErrors}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("info")}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "info"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 mr-1 inline" />
                    Info
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {activeTab === "editor" && (
              <LedesTable
                data={data.rows}
                headers={data.headers}
                onCellUpdate={updateCell}
                getCellValidation={getCellValidation}
                isLoading={isLoading}
              />
            )}

            {activeTab === "validation" && (
              <ValidationPanel
                validationResult={validationResult}
                isValidating={isValidating}
                onValidate={validateData}
              />
            )}

            {activeTab === "info" && <InfoPanel data={data} />}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Trash2 className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={() => setError(null)}
                      className="text-red-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
