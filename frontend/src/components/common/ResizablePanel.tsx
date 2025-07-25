import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  direction: 'horizontal' | 'vertical';
  initialSizes?: number[];
  minSizes?: number[];
  maxSizes?: number[];
  className?: string;
}

interface ResizerProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
  className?: string;
}

const Resizer: React.FC<ResizerProps> = ({ direction, onResize, className = '' }) => {
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    
    // 添加全局样式防止选择文本和改善拖拽体验
    document.body.style.userSelect = 'none';
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.pointerEvents = 'none';
    
    // 为当前元素保持指针事件
    const currentElement = e.currentTarget as HTMLElement;
    currentElement.style.pointerEvents = 'auto';
  }, [direction]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const delta = direction === 'horizontal' 
      ? e.clientX - startPos.current.x 
      : e.clientY - startPos.current.y;
    
    onResize(delta);
    startPos.current = { x: e.clientX, y: e.clientY };
  }, [isResizing, direction, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    document.body.style.pointerEvents = '';
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const baseClasses = direction === 'horizontal'
    ? 'w-0.5 cursor-col-resize transition-all duration-150 relative'
    : 'h-0.5 cursor-row-resize transition-all duration-150 relative';

  const activeClasses = isResizing 
    ? 'bg-blue-500 shadow-lg' 
    : 'bg-gray-200 hover:bg-gray-300';

  return (
    <div
      className={`${baseClasses} ${activeClasses} ${className} group flex items-center justify-center`}
      onMouseDown={handleMouseDown}
    >
      {/* 扩大点击区域 */}
      <div className={`absolute ${
        direction === 'horizontal' 
          ? 'inset-y-0 -left-1 -right-1' 
          : 'inset-x-0 -top-1 -bottom-1'
      } z-10`} />
      
      {/* 拖拽指示器 */}
      <div className={`absolute ${
        direction === 'horizontal'
          ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-6'
          : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-0.5'
      } bg-white rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-200 pointer-events-none`} />
      
      {/* 拖拽时的高亮效果 */}
      {isResizing && (
        <div className={`absolute ${
          direction === 'horizontal'
            ? 'inset-y-0 -left-0.5 -right-0.5'
            : 'inset-x-0 -top-0.5 -bottom-0.5'
        } bg-blue-500 opacity-20 rounded-sm pointer-events-none`} />
      )}
    </div>
  );
};

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  direction,
  initialSizes = [50, 50],
  minSizes = [20, 20],
  maxSizes = [80, 80],
  className = ''
}) => {
  const [sizes, setSizes] = useState<number[]>(initialSizes);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback((index: number, delta: number) => {
    if (!containerRef.current) return;

    const containerSize = direction === 'horizontal' 
      ? containerRef.current.offsetWidth 
      : containerRef.current.offsetHeight;

    const deltaPercent = (delta / containerSize) * 100;
    
    setSizes(prevSizes => {
      const newSizes = [...prevSizes];
      
      // 调整当前面板和下一个面板的大小
      const currentSize = newSizes[index];
      const nextSize = newSizes[index + 1];
      
      const newCurrentSize = Math.max(
        minSizes[index], 
        Math.min(maxSizes[index], currentSize + deltaPercent)
      );
      
      const actualDelta = newCurrentSize - currentSize;
      const newNextSize = Math.max(
        minSizes[index + 1],
        Math.min(maxSizes[index + 1], nextSize - actualDelta)
      );
      
      newSizes[index] = newCurrentSize;
      newSizes[index + 1] = newNextSize;
      
      return newSizes;
    });
  }, [direction, minSizes, maxSizes]);

  const childrenArray = React.Children.toArray(children);

  return (
    <div 
      ref={containerRef}
      className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} w-full h-full ${className}`}
    >
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          <div 
            style={{
              [direction === 'horizontal' ? 'width' : 'height']: `${sizes[index]}%`,
              flexShrink: 0
            }}
            className="overflow-hidden h-full"
          >
            {child}
          </div>
          
          {/* 添加分隔条，除了最后一个元素 */}
          {index < childrenArray.length - 1 && (
            <Resizer
              direction={direction}
              onResize={(delta) => handleResize(index, delta)}
              className="flex-shrink-0"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ResizablePanel;