import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, File as FileIcon } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxSize?: number; // in MB
  accept?: string;
  multiple?: boolean;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  maxSize = 10, // Default 10MB
  accept = '*',
  multiple = true,
  label = 'Dateien hierher ziehen oder klicken zum Auswählen'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const processFiles = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    Array.from(files).forEach(file => {
      if (file.size > maxSize * 1024 * 1024) {
        invalidFiles.push(`${file.name} (Datei zu groß)`);
        return;
      }
      
      if (accept !== '*') {
        const acceptTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type;
        
        const isAccepted = acceptTypes.some(type => {
          if (type.endsWith('/*')) {
            const generalType = type.split('/')[0];
            return fileType.startsWith(generalType);
          }
          return type === fileType;
        });
        
        if (!isAccepted) {
          invalidFiles.push(`${file.name} (Dateityp nicht erlaubt)`);
          return;
        }
      }
      
      validFiles.push(file);
    });
    
    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Einige Dateien konnten nicht hochgeladen werden",
        description: invalidFiles.join(', '),
        variant: "destructive"
      });
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    } else if (mimeType.startsWith('text/')) {
      return <FileText className="w-5 h-5" />;
    } else {
      return <FileIcon className="w-5 h-5" />;
    }
  };
  
  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Max. Dateigröße: {maxSize}MB
        </p>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileInputChange}
          accept={accept}
          multiple={multiple}
        />
      </div>
    </div>
  );
};

export interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const [preview, setPreview] = useState<string | null>(null);
  
  React.useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [file]);
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };
  
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    } else if (mimeType.startsWith('text/')) {
      return <FileText className="w-5 h-5" />;
    } else {
      return <FileIcon className="w-5 h-5" />;
    }
  };
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-md mb-2">
      <div className="flex items-center space-x-3">
        {preview ? (
          <img src={preview} alt={file.name} className="w-10 h-10 object-cover rounded" />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
            {getFileIcon(file.type)}
          </div>
        )}
        <div className="text-sm">
          <p className="font-medium truncate max-w-[200px]">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
