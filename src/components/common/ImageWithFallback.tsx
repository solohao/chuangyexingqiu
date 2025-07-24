import React, { useState } from 'react';
import { User } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackComponent?: React.ReactNode;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fallbackComponent,
  ...props
}) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    console.log('图片加载失败:', src);
    setError(true);
  };

  if (error) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    // 默认回退为带有用户图标的圆形容器
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <User className="w-1/2 h-1/2 text-gray-500" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback; 