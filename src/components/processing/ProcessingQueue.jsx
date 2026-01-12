import React from 'react';
import { FileText, X, Trash2, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const ProcessingQueue = ({ files, currentIndex, onSelectFile, onRemove }) => {
  const getStatusIcon = (file) => {
    if (file.saved) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (file.processed && file.needsReview) return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    if (file.processed) return <CheckCircle className="w-4 h-4 text-teal-600" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = (file) => {
    if (file.saved) return 'محفوظ';
    if (file.processed && file.needsReview) return 'يحتاج مراجعة';
    if (file.processed) return 'معالج';
    return 'قيد الانتظار';
  };

  const getStatusColor = (file) => {
    if (file.saved) return 'bg-green-50 text-green-700 border-green-200';
    if (file.processed && file.needsReview) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (file.processed) return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <button
          onClick={() => onRemove('all')}
          className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
          title="حذف الكل"
        >
          <span className="font-medium">حذف الكل</span>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <h3 className="font-bold text-gray-900 text-sm">
          قائمة الانتظار ({files.length})
        </h3>
      </div>
      
      <div className="space-y-2 flex-1 overflow-auto pr-1">
        {files.map((file, index) => (
          <div
            key={index}
            onClick={() => onSelectFile(index)}
            className={`relative flex flex-col p-3 rounded-lg cursor-pointer transition-all border-2 ${
              index === currentIndex
                ? 'bg-teal-50 border-teal-500 shadow-sm'
                : 'bg-gray-50 hover:bg-gray-100 border-transparent hover:border-gray-300'
            }`}
          >
            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="absolute top-2 left-2 text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
              title="حذف"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* File Info */}
            <div className="flex items-start gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-gray-900 truncate flex-1 text-right pr-6">
                {file.name}
              </p>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center justify-end gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${getStatusColor(file)}`}>
              <span>{getStatusText(file)}</span>
              {getStatusIcon(file)}
            </div>

            {/* Confidence Bar (if processed) */}
            {file.processed && file.confidence !== undefined && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-600">
                    {(file.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-gray-500">الدقة</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      file.confidence >= 0.9 ? 'bg-green-500' :
                      file.confidence >= 0.7 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${file.confidence * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingQueue;