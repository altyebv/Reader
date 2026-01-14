import React from 'react';
import { FileText, X, Trash2, CheckCircle, AlertTriangle, Clock, Copy } from 'lucide-react';

/**
 * Enhanced processing queue component
 * Displays file list with status, confidence, and actions
 */
const ProcessingQueue = ({ files, currentIndex, onSelectFile, onRemove }) => {
  const getStatusIcon = (file) => {
    if (file.saved) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (file.isDuplicate) return <Copy className="w-4 h-4 text-red-600" />;
    if (file.processed && file.needsReview) return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    if (file.processed) return <CheckCircle className="w-4 h-4 text-teal-600" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = (file) => {
    if (file.saved) return 'محفوظ';
    if (file.isDuplicate) return 'مكرر';
    if (file.processed && file.needsReview) return 'مراجعة';
    if (file.processed) return 'معالج';
    return 'انتظار';
  };

  const getStatusColor = (file) => {
    if (file.saved) return 'bg-green-50 text-green-700 border-green-300';
    if (file.isDuplicate) return 'bg-red-50 text-red-700 border-red-300';
    if (file.processed && file.needsReview) return 'bg-amber-50 text-amber-700 border-amber-300';
    if (file.processed) return 'bg-teal-50 text-teal-700 border-teal-300';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-br from-gray-50 to-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onRemove('all')}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all font-semibold hover:scale-105"
            title="حذف الكل"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف الكل</span>
          </button>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <span>قائمة الانتظار</span>
            <span className="px-2.5 py-1 bg-teal-500 text-white rounded-full text-sm font-bold shadow-md">
              {files.length}
            </span>
          </h3>
        </div>
      </div>
      
      {/* Scrollable File List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {files.map((file, index) => (
          <div
            key={index}
            onClick={() => onSelectFile(index)}
            className={`
              relative group flex flex-col p-3 rounded-xl cursor-pointer transition-all border-2
              ${index === currentIndex
                ? 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-500 shadow-lg scale-[1.02]'
                : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-100 transition-all z-10"
              title="حذف"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
            </button>

            {/* File Icon and Name */}
            <div className="flex items-start gap-3 mb-2">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${index === currentIndex ? 'bg-teal-500 shadow-md' : 'bg-gray-100 group-hover:bg-gray-200'}
              `}>
                <FileText className={`w-5 h-5 ${index === currentIndex ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-sm font-bold text-gray-900 truncate text-right">
                  {file.name}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`
              flex items-center justify-end gap-2 px-3 py-1.5 rounded-lg border-2 text-sm font-bold
              ${getStatusColor(file)}
            `}>
              <span>{getStatusText(file)}</span>
              {getStatusIcon(file)}
            </div>

            {/* Confidence Bar (if processed) */}
            {file.processed && file.confidence !== undefined && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-sm font-bold ${
                    file.confidence >= 0.9 ? 'text-green-600' :
                    file.confidence >= 0.7 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {(file.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="text-sm text-gray-500 font-medium">الدقة</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
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