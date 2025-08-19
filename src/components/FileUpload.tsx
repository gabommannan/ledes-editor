import { AlertCircle, FileText, Upload } from "lucide-react";
import React, { useCallback, useState } from "react";
import { cn } from "../lib/utils";

interface FileUploadProps {
  onFileLoad: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function FileUpload({
  onFileLoad,
  isLoading = false,
  error,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type === "text/plain" || file.name.endsWith(".txt")) {
          onFileLoad(file);
        } else {
          alert("Please upload a .txt file");
        }
        e.dataTransfer.clearData();
      }
    },
    [onFileLoad]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        onFileLoad(file);
      }
    },
    [onFileLoad]
  );

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          isLoading && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              {isLoading ? "Loading file..." : "Upload LEDES98BI File"}
            </h3>
            <p className="text-gray-600">
              Drag and drop your .txt file here, or click to browse
            </p>
          </div>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
            <span className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              <FileText className="h-4 w-4 mr-2" />
              Choose File
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <h4 className="font-medium mb-2">File Format Requirements:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>File must be in .txt format</li>
          <li>Data should be pipe-delimited (|)</li>
          <li>First line can be headers (optional)</li>
          <li>Supports all 52 LEDES98BI fields</li>
        </ul>
      </div>
    </div>
  );
}
