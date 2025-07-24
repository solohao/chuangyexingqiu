import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        // In a real app, you would upload the file to a server
        // and get a URL back. For now, we'll just use the base64 data URL.
        onUpload(result);
      };
      reader.readAsDataURL(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
  });

  const removePreview = () => {
    setPreview(null);
    onUpload(''); // Notify parent that the image has been removed
  };

  if (preview) {
    return (
      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        <button
          onClick={removePreview}
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 hover:bg-opacity-75 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors
      ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}
    >
      <input {...getInputProps()} />
      <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
      <p className="text-sm text-gray-600">
        拖拽图片到这里, 或 <span className="font-semibold text-primary-500">点击上传</span>
      </p>
      <p className="text-xs text-gray-400 mt-1">支持 PNG, JPG, GIF, WEBP</p>
    </div>
  );
};

export default ImageUpload;
