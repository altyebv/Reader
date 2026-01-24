import React from 'react';
import { FileText, X, Trash2, CheckCircle, AlertTriangle, Clock, Copy, Loader2 } from 'lucide-react';

/**
 * Polished Processing Queue Component
 * Compact, clean file list with enhanced visual hierarchy
 */
const ProcessingQueue = ({ files, currentIndex, onSelectFile, onRemove }) => {
  const getStatusIcon = (file) => {
    if (file.saved) return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
    if (file.isDuplicate) return <Copy className="w-3.5 h-3.5 text-rose-600" />;
    if (file.processed && file.needsReview) return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
    if (file.processed) return <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />;
    if (file.processing) return <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />;
    return <Clock className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getStatusText = (file) => {
    if (file.saved) return 'محفوظ';
    if (file.isDuplicate) return 'مكرر';
    if (file.processed && file.needsReview) return 'مراجعة';
    if (file.processed) return 'جاهز';
    if (file.processing) return 'معالجة';
    return 'انتظار';
  };

  const getStatusColor = (file) => {
    if (file.saved) return 'bg-emerald-100/80 text-emerald-700 border-emerald-300';
    if (file.isDuplicate) return 'bg-rose-100/80 text-rose-700 border-rose-300';
    if (file.processed && file.needsReview) return 'bg-amber-100/80 text-amber-700 border-amber-300';
    if (file.processed) return 'bg-indigo-100/80 text-indigo-700 border-indigo-300';
    if (file.processing) return 'bg-indigo-100/80 text-indigo-700 border-indigo-300 animate-pulse';
    return 'bg-slate-100/80 text-slate-600 border-slate-300';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 h-full flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 bg-gradient-to-br from-slate-50 to-white px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => onRemove('all')}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all font-bold"
            title="حذف الكل"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {/* <span>حذف الكل</span> */}
          </button>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <span className="text-sm">قائمة الانتظار</span>
            <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-full text-xs font-bold shadow-sm">
              {files.length}
            </span>
          </h3>
        </div>
      </div>
      
      {/* Scrollable File List - More Compact */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {files.map((file, index) => (
          <div
            key={index}
            onClick={() => onSelectFile(index)}
            className={`
              relative group flex flex-col p-3 rounded-xl cursor-pointer transition-all border
              ${index === currentIndex
                ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-400 shadow-lg ring-2 ring-indigo-200'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md'
              }
            `}
          >
            {/* Remove Button - Better positioned */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-100 transition-all z-10"
              title="حذف"
            >
              <X className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
            </button>

            {/* File Icon and Name - More Compact */}
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                ${index === currentIndex 
                  ? 'bg-indigo-600 shadow-md shadow-indigo-500/30' 
                  : 'bg-slate-100 group-hover:bg-slate-200'}
              `}>
                <FileText className={`w-4 h-4 ${index === currentIndex ? 'text-white' : 'text-slate-600'}`} />
              </div>
              <div className="flex-1 min-w-0 pr-5">
                <p className="text-xs font-bold text-slate-900 truncate text-right leading-tight" title={file.name}>
                  {file.name}
                </p>
              </div>
            </div>

            {/* Status Badge - More Compact */}
            <div className={`
              flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-bold
              ${getStatusColor(file)}
            `}>
              <span className="truncate">{getStatusText(file)}</span>
              {getStatusIcon(file)}
            </div>

            {/* Confidence Bar - More Compact (if processed) */}
            {file.processed && file.confidence !== undefined && (
              <div className="mt-2 pt-2 border-t border-slate-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold ${
                    file.confidence >= 0.9 ? 'text-emerald-600' :
                    file.confidence >= 0.7 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {(file.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-slate-500 font-medium">الدقة</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      file.confidence >= 0.9 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                      file.confidence >= 0.7 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 
                      'bg-gradient-to-r from-rose-500 to-rose-600'
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