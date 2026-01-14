import React, { useState, useRef } from 'react';
import { Upload, FileImage, Plus, CheckCircle, AlertCircle, Zap } from 'lucide-react';

/**
 * Enhanced upload zone component with instructions and feature highlights
 * Supports drag & drop and file selection
 * Changes to compact "Add More" button when files exist
 */
const UploadZone = ({ onFilesSelected, hasExistingFiles = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Compact button mode when files already exist
  if (hasExistingFiles) {
    return (
      <button
        onClick={handleButtonClick}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <Plus className="w-5 h-5" />
        <span>إضافة المزيد</span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </button>
    );
  }

  // Full upload zone for initial upload
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        {/* Main Upload Area */}
        <div
          className={`
            relative overflow-hidden
            border-2 border-dashed rounded-2xl
            transition-all duration-300 ease-out
            ${dragActive 
              ? 'border-teal-500 bg-teal-50 scale-[1.02] shadow-xl' 
              : 'border-gray-300 bg-white hover:border-teal-400 hover:bg-teal-50/30'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314b8a6' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative z-10 px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Side - Upload Action */}
              <div className="text-center lg:text-right">
                {/* Icon with animated ring */}
                <div className="relative mb-6 inline-block">
                  <div className={`
                    absolute inset-0 rounded-full
                    ${dragActive ? 'animate-ping bg-teal-400' : ''}
                  `} />
                  <div className={`
                    relative w-20 h-20 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${dragActive 
                      ? 'bg-teal-500 scale-110 shadow-xl' 
                      : 'bg-teal-100'
                    }
                  `}>
                    <Upload className={`
                      w-10 h-10 transition-all duration-300
                      ${dragActive 
                        ? 'text-white scale-110' 
                        : 'text-teal-600'
                      }
                    `} />
                  </div>
                </div>

                {/* Main Text */}
                <h2 className={`
                  text-3xl font-bold mb-3 transition-colors duration-300
                  ${dragActive ? 'text-teal-700' : 'text-gray-900'}
                `}>
                  {dragActive ? 'أفلت الملفات هنا!' : 'ارفع إشعارات الدفع'}
                </h2>
                
                <p className="text-gray-600 mb-6 text-base leading-relaxed">
                  اسحب الصور وأفلتها، أو اختر من جهازك
                </p>

                {/* Upload Button */}
                <button
                  onClick={handleButtonClick}
                  className="
                    group inline-flex items-center gap-3
                    px-8 py-4 
                    bg-teal-500 hover:bg-teal-600 
                    text-white font-bold text-lg rounded-xl
                    transition-all duration-300
                    shadow-lg hover:shadow-xl hover:scale-105
                  "
                >
                  <Upload className="w-5 h-5 transition-transform group-hover:translate-y-[-2px]" />
                  <span>اختر الملفات</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </button>

                {/* Supported Formats */}
                <div className="mt-4 flex items-center justify-center lg:justify-end gap-2 text-sm text-gray-500">
                  <FileImage className="w-4 h-4" />
                  <span>JPG, PNG</span>
                </div>
              </div>

              {/* Right Side - Features Grid */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-teal-50 to-white rounded-xl border-2 border-teal-100">
                  <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">معالجة فورية</h4>
                    <p className="text-sm text-gray-600"> OCR استخراج تلقائي بتقنية </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border-2 border-green-100">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">دقة عالية</h4>
                    <p className="text-sm text-gray-600">نسبة صحة عالية للأرقام</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-amber-50 to-white rounded-xl border-2 border-amber-100">
                  <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">مراجعة آمنة</h4>
                    <p className="text-sm text-gray-600">تأكيد بشري قبل الحفظ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tip - Compact */}
        <div className="mt-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div className="text-right flex-1">
              <p className="font-semibold mb-1">نصيحة سريعة</p>
              <p className="text-sm text-teal-50">تأكد من وضوح الصور • يمكن رفع عدة ملفات معاً • الإضاءة الجيدة تحسن النتائج</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;