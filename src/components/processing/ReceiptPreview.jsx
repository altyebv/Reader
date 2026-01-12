import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCw, Move } from 'lucide-react';

const ReceiptPreview = ({ imageUrl, zoom, onZoomIn, onZoomOut }) => {
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    // Reset zoom to 100%
    if (zoom > 100) {
      const times = Math.ceil((zoom - 100) / 25);
      for (let i = 0; i < times; i++) onZoomOut();
    } else if (zoom < 100) {
      const times = Math.ceil((100 - zoom) / 25);
      for (let i = 0; i < times; i++) onZoomIn();
    }
  };

  const handleMouseDown = (e) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      onZoomIn();
    } else {
      onZoomOut();
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Reset position when zoom changes to 100 or less
  useEffect(() => {
    if (zoom <= 100) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoom]);

  return (
    <div className="h-full bg-slate-900 rounded-lg overflow-hidden flex flex-col shadow-lg border border-gray-700">
      {/* Toolbar */}
      <div className="bg-slate-800 p-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={onZoomOut}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
            title="تصغير"
          >
            <ZoomOut className="w-5 h-5 text-gray-300 group-hover:text-white" />
          </button>
          <button
            onClick={onZoomIn}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
            title="تكبير"
          >
            <ZoomIn className="w-5 h-5 text-gray-300 group-hover:text-white" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
            title="تدوير"
          >
            <RotateCw className="w-5 h-5 text-gray-300 group-hover:text-white" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
            title="إعادة تعيين"
          >
            <Maximize2 className="w-5 h-5 text-gray-300 group-hover:text-white" />
          </button>
          {zoom > 100 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-700 rounded-lg">
              <span className="text-xs text-gray-300">اسحب للتنقل</span>
              <Move className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-300 px-3 py-1 bg-slate-700 rounded-lg">
            {zoom}%
          </span>
        </div>
      </div>
      
      {/* Image Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden p-4 flex items-center justify-center bg-slate-900"
        onWheel={handleWheel}
        style={{ cursor: zoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {imageUrl ? (
          <div
            className="relative"
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`
            }}
          >
            <img
              src={imageUrl}
              alt="Receipt preview"
              style={{ 
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                maxWidth: '100%',
                maxHeight: '100%',
                userSelect: 'none'
              }}
              className="transition-transform duration-200 origin-center shadow-2xl rounded-lg"
              onMouseDown={handleMouseDown}
              draggable={false}
            />
          </div>
        ) : (
          <div className="text-gray-500 text-center">
            <p className="text-lg mb-2">لا توجد صورة</p>
            <p className="text-sm">قم برفع إشعار للمعاينة</p>
          </div>
        )}
      </div>

      {/* Zoom Info */}
      <div className="bg-slate-800 px-4 py-2 border-t border-slate-700">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>استخدم عجلة الماوس للتكبير • اسحب للتحريك عند التكبير</span>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreview;