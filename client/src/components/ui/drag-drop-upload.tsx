import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from './button';

interface DragDropUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
  className?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export function DragDropUpload({
  onFileSelect,
  selectedFile,
  accept = "application/pdf",
  className,
  maxSize = 10,
  disabled = false
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File) => {
    setError(null);
    
    // Check file type
    if (accept && !file.type.match(accept.replace('application/', ''))) {
      setError(`Please select a ${accept.replace('application/', '').toUpperCase()} file`);
      return false;
    }
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }
    
    return true;
  }, [accept, maxSize]);

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    } else {
      onFileSelect(null);
    }
  }, [validateFile, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [disabled, handleFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleRemoveFile = useCallback(() => {
    onFileSelect(null);
    setError(null);
  }, [onFileSelect]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          isDragOver 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive bg-destructive/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={disabled}
          data-testid="drag-drop-input"
        />
        
        {selectedFile ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveFile}
              className="text-destructive hover:text-destructive"
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-2" />
              Remove file
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "p-4 rounded-full transition-colors",
              isDragOver ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              <Upload className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragOver ? "Drop your file here" : "Drag & drop your PDF file"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse (max {maxSize}MB)
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive flex items-center gap-2">
          <X className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
