import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
}

export default function FileUploadZone({ onFileSelect, accept }: FileUploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      onFileSelect(dropped);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      onFileSelect(selected);
    }
  };

  return (
    <motion.div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors ${
        isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-glass-border hover:border-primary/50'
      }`}
    >
      {file ? (
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm font-medium text-text-primary">{file.name}</p>
            <p className="text-xs text-text-secondary">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setFile(null); }}
            className="rounded-full p-1 text-text-secondary hover:text-error hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <Upload className="mb-3 h-8 w-8 text-text-secondary" />
          <p className="text-sm font-medium text-text-primary">
            Drop a file here or click to browse
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Supports TXT, MD, PDF, DOC
          </p>
        </>
      )}
      <input
        type="file"
        className="absolute inset-0 cursor-pointer opacity-0"
        accept={accept || '.txt,.md,.pdf,.doc,.docx'}
        onChange={handleChange}
      />
    </motion.div>
  );
}
