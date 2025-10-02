
import React, { useState, useCallback, useRef } from 'react';
import UploadIcon from '../icons/UploadIcon';

interface DropzoneProps {
  onFileDrop: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileDrop, accept, maxSizeMB, disabled = false }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onFileDrop, accept, maxSizeMB, disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    e.target.value = ''; // Reset file input to allow re-uploading the same file
  };

  const processFile = (file: File) => {
    if (accept) {
        const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
        const fileType = file.type.toLowerCase();
        if (!acceptedTypes.includes(fileType)) {
            alert(`Nieprawidłowy typ pliku. Proszę wybrać plik typu: ${accept}`);
            return;
        }
    }
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        alert(`Plik jest za duży. Maksymalny rozmiar to ${maxSizeMB} MB.`);
        return;
    }
    onFileDrop(file);
  };
  
  const openFileDialog = () => {
    if (!disabled) {
        inputRef.current?.click();
    }
  }

  return (
    <div
      className={`relative w-full p-6 border-2 border-dashed rounded-lg text-center transition-colors duration-200 ease-in-out
        ${disabled 
            ? 'bg-gray-200 dark:bg-gray-800 cursor-not-allowed opacity-50' 
            : 'cursor-pointer'}
        ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={openFileDialog}
      role="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept={accept}
        disabled={disabled}
      />
      <div className="flex flex-col items-center justify-center space-y-2 text-gray-500 dark:text-gray-400 pointer-events-none">
        <UploadIcon className="w-10 h-10" />
        <p className="font-semibold">
          {isDragActive ? 'Upuść plik tutaj' : 'Przeciągnij i upuść plik lub kliknij, aby wybrać'}
        </p>
        <p className="text-xs">
          {accept && `Akceptowane typy: ${accept.split('/')[1].toUpperCase()}`}
          {accept && maxSizeMB && ' | '}
          {maxSizeMB && `Maks. rozmiar: ${maxSizeMB}MB`}
        </p>
      </div>
    </div>
  );
};

export default Dropzone;