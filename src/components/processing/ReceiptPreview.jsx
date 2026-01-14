import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCw, FileText } from 'lucide-react';

/**
 * Enhanced receipt preview component with zoom, rotate, and pan
 */
const ReceiptPreview = ({ imageUrl, zoom, onZoomChange }) => {
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => onZoomChange(Math.min(200, zoom + 25));
  const handleZoomOut = () => onZoomChange(Math.max(50, zoom - 25));
  
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };
  
  const handleReset = () => {
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    onZoomChange(100);
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
      handleZoomIn();
    } else {
      handleZoomOut();
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
    <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-slate-700">
      {/* Toolbar */}
      <div className="bg-slate-800/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleZoomOut} 
            className="p-2 hover:bg-slate-700 rounded-lg transition-all hover:scale-110" 
            title="تصغير"
            disabled={zoom <= 50}
          >
            <ZoomOut className="w-5 h-5 text-gray-300" />
          </button>
          <button 
            onClick={handleZoomIn} 
            className="p-2 hover:bg-slate-700 rounded-lg transition-all hover:scale-110" 
            title="تكبير"
            disabled={zoom >= 200}
          >
            <ZoomIn className="w-5 h-5 text-gray-300" />
          </button>
          <button 
            onClick={handleRotate} 
            className="p-2 hover:bg-slate-700 rounded-lg transition-all hover:scale-110" 
            title="تدوير"
          >
            <RotateCw className="w-5 h-5 text-gray-300" />
          </button>
          <button 
            onClick={handleReset} 
            className="p-2 hover:bg-slate-700 rounded-lg transition-all hover:scale-110" 
            title="إعادة تعيين"
          >
            <Maximize2 className="w-5 h-5 text-gray-300" />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white px-3 py-1.5 bg-slate-700 rounded-lg shadow-inner">
            {zoom}%
          </span>
          {zoom > 100 && (
            <span className="text-xs text-gray-400 bg-slate-700/50 px-3 py-1.5 rounded-lg">
              اسحب للتنقل
            </span>
          )}
        </div>
      </div>
      
      {/* Image Container */}
      <div 
        className="flex-1 overflow-hidden p-4 flex items-center justify-center"
        onWheel={handleWheel}
        style={{ cursor: zoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {imageUrl ? (
          <div
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
              className="transition-transform duration-200 shadow-2xl rounded-lg"
              onMouseDown={handleMouseDown}
              draggable={false}
            />
          </div>
        ) : (
          <div className="text-gray-400 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
              <FileText className="w-12 h-12 text-slate-600" />
            </div>
            <p className="text-lg font-semibold mb-2">لا توجد صورة</p>
            <p className="text-sm text-gray-500">قم برفع إشعار للمعاينة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptPreview;