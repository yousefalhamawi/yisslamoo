
import React, { useState, useRef } from 'react';
import { ImagePlus, Upload, Trash2, X, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  onFilesChange?: (files: File[]) => void;
  onFileSelect?: (file: File | File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'circular' | 'square';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onFilesChange,
  onFileSelect,
  multiple = false,
  maxFiles = 5,
  label = 'صورة المنتج',
  description = 'PNG, JPG حتى 5 ميجابايت',
  className,
  variant = 'default'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previews = Array.isArray(value) ? value : value ? [value] : [];

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const fileList = Array.from(files);
    const validFiles = fileList.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/avif'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      
      if (!isValidType) toast.error(`الملف ${file.name} ليس صورة مدعومة`);
      if (!isValidSize) toast.error(`الملف ${file.name} يتجاوز 5 ميجابايت`);
      
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    if (!multiple) {
      const file = validFiles[0];
      if (onFileSelect) onFileSelect(file);
      if (onFilesChange) onFilesChange([file]);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      const newPreviews = [...previews];
      const newLocalFiles = [...localFiles];
      let filesProcessed = 0;
      const filesToProcess = validFiles.slice(0, maxFiles - previews.length);

      if (filesToProcess.length === 0) {
        toast.error(`تم الوصول للحد الأقصى من الصور (${maxFiles})`);
        return;
      }

      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          newLocalFiles.push(file);
          filesProcessed++;
          
          if (filesProcessed === filesToProcess.length) {
            onChange(newPreviews);
            setLocalFiles(newLocalFiles);
            if (onFilesChange) onFilesChange(newLocalFiles);
            if (onFileSelect) onFileSelect(filesToProcess);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    if (!multiple) {
      onChange('');
      setLocalFiles([]);
      if (onFilesChange) onFilesChange([]);
    } else {
      const newValue = [...previews];
      const removedPreview = newValue.splice(index, 1)[0];
      onChange(newValue);

      // If it was a local file (base64)
      if (removedPreview.startsWith('data:')) {
        // We need to find which local file this was. 
        // This is still slightly heuristic but better.
        // Actually, we can keep track of local file indices.
        // For simplicity, let's just assume local files are at the end 
        // or check their index relative to other base64s.
        const base64Index = previews.slice(0, index).filter(p => p.startsWith('data:')).length;
        const updatedLocalFiles = [...localFiles];
        updatedLocalFiles.splice(base64Index, 1);
        setLocalFiles(updatedLocalFiles);
        if (onFilesChange) onFilesChange(updatedLocalFiles);
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  if (variant === 'circular' || variant === 'square') {
    return (
      <div className={cn("relative group", variant === 'circular' ? "mx-auto" : "", className)}>
        <div 
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "overflow-hidden border-2 transition-all duration-300 cursor-pointer relative",
            variant === 'circular' ? "w-32 h-32 rounded-full border-4" : "w-24 h-24 rounded-3xl border-dashed border-slate-200 bg-slate-50",
            isDragging ? "border-indigo-600 scale-105" : "border-white shadow-xl hover:border-indigo-200"
          )}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {previews[0] ? (
            <img src={previews[0]} alt="Preview" className={cn("w-full h-full object-cover", variant === 'square' && "p-4 object-contain")} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Upload className="w-6 h-6" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] font-black text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity">
            تغيير
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} dir="rtl">
      {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">{label}</label>}
      
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-[2rem] p-8 transition-all duration-300 cursor-pointer text-center",
          isDragging 
            ? "border-indigo-600 bg-indigo-50/50 scale-[0.99] shadow-inner" 
            : "border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-white",
          previews.length > 0 && !multiple && "p-0 overflow-hidden border-solid"
        )}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple={multiple}
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {previews.length > 0 && !multiple ? (
          <div className="relative group aspect-video sm:aspect-square md:aspect-video">
            <img src={previews[0]} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="bg-white text-indigo-600 p-3 rounded-xl font-black text-xs hover:scale-110 active:scale-95 transition-all"
              >
                تغيير الصورة
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(0);
                }}
                className="bg-white text-red-500 p-3 rounded-xl font-black text-xs hover:scale-110 active:scale-95 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
              isDragging ? "bg-indigo-600 text-white" : "bg-white text-slate-400 shadow-sm"
            )}>
              <ImagePlus className="w-6 h-6" />
            </div>
            <p className="text-sm font-black text-slate-600">اسحب الصور وأفلتها هنا</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">{description}</p>
            <button 
              type="button"
              className="mt-4 bg-indigo-600/10 text-indigo-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
            >
              أو تصفح الملفات
            </button>
          </div>
        )}
      </div>

      {multiple && previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {previews.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100">
              <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
              >
                <X className="w-3 h-3" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-0 inset-x-0 bg-indigo-600 text-white text-[8px] font-black text-center py-1 uppercase tracking-tighter">
                  الصورة الأساسية
                </div>
              )}
            </div>
          ))}
          {previews.length < maxFiles && (
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-400 hover:bg-slate-50 transition-all"
            >
              <Plus className="w-5 h-5 mb-1" />
              <span className="text-[8px] font-black uppercase">إضافة</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface PlusProps {
  className?: string;
}
const Plus: React.FC<PlusProps> = ({ className }) => <Upload className={className} />;
