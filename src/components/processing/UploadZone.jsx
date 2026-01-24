import React, { useState, useRef } from 'react';
import { Upload, FileImage, Plus, CheckCircle, AlertCircle, Zap } from 'lucide-react';

/**
 * Professional Upload Zone Component
 * Premium first impression with enhanced visual hierarchy
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

  // Compact "Add More" button when files already exist
  if (hasExistingFiles) {
    return (
      <button
        onClick={handleButtonClick}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
      >
        <Plus className="w-4 h-4" />
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

  // Full premium upload zone for initial upload
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* Main Upload Card */}
        <div
          className={`
            relative overflow-hidden
            border-2 border-dashed rounded-3xl
            transition-all duration-300 ease-out
            ${dragActive 
              ? 'border-indigo-500 bg-indigo-50 shadow-2xl shadow-indigo-500/20 scale-[1.01]' 
              : 'border-slate-300 bg-white/80 backdrop-blur-sm hover:border-indigo-400 hover:shadow-xl'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Subtle Pattern Background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />

          <div className="relative z-10 px-12 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              {/* Left Side - Upload Action (3 cols) */}
              <div className="lg:col-span-3 text-center lg:text-right">
                {/* Icon with Animation */}
                <div className="relative mb-8 inline-block">
                  {dragActive && (
                    <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75" />
                  )}
                  <div className={`
                    relative w-24 h-24 rounded-2xl flex items-center justify-center
                    transition-all duration-300
                    ${dragActive 
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 scale-110 shadow-2xl shadow-indigo-500/50' 
                      : 'bg-gradient-to-br from-indigo-100 to-indigo-200 shadow-lg'
                    }
                  `}>
                    <Upload className={`
                      w-12 h-12 transition-all duration-300
                      ${dragActive ? 'text-white' : 'text-indigo-600'}
                    `} />
                  </div>
                </div>

                {/* Main Heading */}
                <h1 className={`
                  text-4xl lg:text-5xl font-bold mb-4 transition-colors duration-300
                  ${dragActive ? 'text-indigo-700' : 'text-slate-900'}
                `}>
                  {dragActive ? 'أفلت الملفات هنا' : 'معالجة الإشعارات'}
                </h1>
                
                <p className="text-slate-600 text-lg mb-8 leading-relaxed max-w-md mx-auto lg:mx-0 lg:mr-auto">
                  استخراج تلقائي للبيانات من إشعارات الدفع البنكية باستخدام تقنية OCR
                </p>

                {/* CTA Button */}
                <button
                  onClick={handleButtonClick}
                  className="
                    group inline-flex items-center gap-3
                    px-10 py-5
                    bg-gradient-to-r from-indigo-600 to-indigo-700
                    hover:from-indigo-700 hover:to-indigo-800
                    text-white font-bold text-lg rounded-xl
                    transition-all duration-300
                    shadow-xl hover:shadow-2xl hover:shadow-indigo-500/30
                    hover:scale-[1.02]
                  "
                >
                  <Upload className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" />
                  <span>اختيار الملفات</span>
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
                <div className="mt-6 flex items-center justify-center lg:justify-end gap-2.5 text-sm text-slate-500">
                  <FileImage className="w-4 h-4" />
                  <span className="font-medium">يدعم: JPG, PNG, JPEG</span>
                </div>
              </div>

              {/* Right Side - Feature Highlights (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                {/* Feature 1 - AI Processing */}
                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right flex-1">
                    <h4 className="font-bold text-slate-900 mb-1.5 text-base">معالجة فورية</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">استخراج تلقائي بتقنية OCR المتقدمة</p>
                  </div>
                </div>

                {/* Feature 2 - Accuracy */}
                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right flex-1">
                    <h4 className="font-bold text-slate-900 mb-1.5 text-base">دقة عالية</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">نسبة صحة عالية مع مؤشرات الثقة</p>
                  </div>
                </div>

                {/* Feature 3 - Safe Review */}
                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right flex-1">
                    <h4 className="font-bold text-slate-900 mb-1.5 text-base">مراجعة آمنة</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">تأكيد بشري قبل الحفظ النهائي</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips Card */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div className="text-right flex-1">
              <h3 className="font-bold text-lg mb-2">نصائح للحصول على أفضل النتائج</h3>
              <ul className="text-sm text-indigo-100 space-y-1.5 leading-relaxed">
                <li>• تأكد من وضوح الصور وجودة الإضاءة</li>
                <li>• يمكنك رفع عدة ملفات معاً للمعالجة الدُفعية</li>
                <li>• الصور الواضحة تحسن دقة الاستخراج بشكل كبير</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;