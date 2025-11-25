import React, { useState, useRef } from 'react';
import { UploadIcon, FileIcon, XIcon, ImageIcon, FileTextIcon } from 'lucide-react';
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label: string;
  selectedFile?: File | null;
  onClear?: () => void;
}
export function FileUpload({
  onFileSelect,
  accept,
  label,
  selectedFile,
  onClear
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };
  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase();
    if (ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png') || ext.endsWith('.gif')) {
      return <ImageIcon className="w-8 h-8 text-cyan-400" />;
    }
    if (ext.endsWith('.pdf')) {
      return <FileTextIcon className="w-8 h-8 text-red-400" />;
    }
    return <FileIcon className="w-8 h-8 text-cyan-400" />;
  };
  return <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>

      {selectedFile ? <div className="glass p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon(selectedFile.name)}
            <div>
              <div className="text-white font-medium">{selectedFile.name}</div>
              <div className="text-sm text-gray-400">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </div>
            </div>
          </div>
          {onClear && <button onClick={onClear} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
              <XIcon className="w-5 h-5 text-red-400" />
            </button>}
        </div> : <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`glass p-8 rounded-lg border-2 border-dashed cursor-pointer transition-all ${isDragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-600 hover:border-cyan-500/50'}`}>
          <div className="flex flex-col items-center space-y-3">
            <UploadIcon className={`w-12 h-12 ${isDragging ? 'text-cyan-400' : 'text-gray-400'}`} />
            <div className="text-center">
              <p className="text-white font-medium">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {accept ? `Accepted formats: ${accept}` : 'All file types accepted'}
              </p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
        </div>}
    </div>;
}