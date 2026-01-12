import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, SkipForward, AlertTriangle, Loader2, Info } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const FIELD_DEFINITIONS = {
  transaction_id: { 
    label: 'رقم العملية', 
    nameEn: 'Transaction ID', 
    type: 'text', 
    dir: 'ltr',
    align: 'left'
  },
  datetime: { 
    label: 'التاريخ والوقت', 
    nameEn: 'Date & Time', 
    type: 'text', 
    dir: 'ltr',
    align: 'left'
  },
  from_account: { 
    label: 'من حساب', 
    nameEn: 'From Account', 
    type: 'text', 
    dir: 'ltr',
    align: 'left'
  },
  to_account: { 
    label: 'إلى حساب', 
    nameEn: 'To Account', 
    type: 'text', 
    dir: 'ltr',
    align: 'left'
  },
  receiver_name: { 
    label: 'اسم المرسل إليه', 
    nameEn: 'Receiver Name', 
    type: 'text', 
    dir: 'rtl',
    align: 'right',
    autocomplete: true  // ONLY THIS FIELD HAS AUTOCOMPLETE
  },
  comment: { 
    label: 'التعليق', 
    nameEn: 'Comment', 
    type: 'text', 
    dir: 'rtl',
    align: 'right'
  },
  amount: { 
    label: 'المبلغ', 
    nameEn: 'Amount', 
    type: 'text', 
    dir: 'ltr',
    align: 'left'
  }
};

// ============================================================================
// SIMPLIFIED Autocomplete - ONLY for receiver_name
// ============================================================================
const ReceiverNameAutocomplete = ({ 
  value, 
  onChange, 
  confidence,
  error,
  toAccountValue  // Used to filter/prioritize suggestions
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch receiver names from database
  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      // Import the API function at the top of the file or inline
      // For now, using direct fetch (you should import searchReceiverNames from utils/api.js)
      const response = await fetch(
        `${API_BASE_URL}/api/receivers/search?q=${encodeURIComponent(query)}` +
        (toAccountValue ? `&to_account=${encodeURIComponent(toAccountValue)}` : '')
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const results = await response.json();
      
      setSuggestions(results.slice(0, 10));  // Max 10 suggestions
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value && value.trim()) {
        fetchSuggestions(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, toAccountValue]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select suggestion
  const selectSuggestion = (suggestion) => {
    onChange({ target: { value: suggestion.value } });
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      case 'Tab':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getConfidenceColor = () => {
    if (!confidence) return 'bg-gray-100';
    if (confidence >= 0.90) return 'bg-green-100 text-green-800';
    if (confidence >= 0.75) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceIcon = () => {
    if (!confidence) return null;
    if (confidence >= 0.90) return '✓';
    if (confidence >= 0.75) return '⚠';
    return '✗';
  };

  return (
    <div ref={containerRef} className="space-y-1.5 relative">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          اسم المرسل إليه
          {confidence !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getConfidenceColor()}`}>
              {getConfidenceIcon()} {(confidence * 100).toFixed(0)}%
            </span>
          )}
        </label>
      </div>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          dir="rtl"
          className={`
            w-full px-3 py-2.5 rounded-lg border-2 transition-all text-right
            ${error 
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
            }
            text-gray-900 font-medium
          `}
          style={{ fontFamily: 'Cairo, sans-serif' }}
        />
        
        {loading && (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
        )}

        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            className="absolute z-50 w-full mt-1 bg-white border-2 border-teal-300 rounded-lg shadow-xl max-h-60 overflow-auto"
          >
            {suggestions.map((suggestion, idx) => {
              // Check if this name is linked to current to_account
              const isLinked = toAccountValue && suggestion.display_name && 
                suggestion.display_name.replace(/\s/g, '') === toAccountValue.replace(/\s/g, '');
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className={`
                    w-full px-4 py-3 text-right flex items-center justify-between 
                    border-b border-gray-100 last:border-0 transition-all duration-150
                    ${selectedIndex === idx 
                      ? 'bg-teal-100 border-l-4 border-l-teal-500 shadow-sm' 
                      : isLinked 
                        ? 'bg-teal-50/50 hover:bg-teal-50' 
                        : 'bg-white hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {isLinked && (
                      <span className="px-2.5 py-1 bg-teal-500 text-white text-xs rounded-full font-bold shadow-sm">
                        ✓ مرتبط
                      </span>
                    )}
                    {suggestion.verified && (
                      <span className="px-2.5 py-1 bg-green-500 text-white text-xs rounded-full font-bold shadow-sm">
                        موثق
                      </span>
                    )}
                    <span className="text-xs text-gray-600 font-medium">
                      {suggestion.frequency} مرة
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800 text-base mb-0.5" style={{ fontFamily: 'Cairo, sans-serif' }}>
                      {suggestion.value}
                    </div>
                    {suggestion.display_name && (
                      <div className="text-sm text-teal-600 font-mono font-medium">
                        {suggestion.display_name}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// Regular Input Component (for ALL other fields)
// ============================================================================
const Input = ({ label, value, onChange, confidence, dir, align, error }) => {
  const getConfidenceColor = () => {
    if (!confidence) return 'bg-gray-100';
    if (confidence >= 0.90) return 'bg-green-100 text-green-800';
    if (confidence >= 0.75) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceIcon = () => {
    if (!confidence) return null;
    if (confidence >= 0.90) return '✓';
    if (confidence >= 0.75) return '⚠';
    return '✗';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {label}
          {confidence !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getConfidenceColor()}`}>
              {getConfidenceIcon()} {(confidence * 100).toFixed(0)}%
            </span>
          )}
        </label>
      </div>
      
      <input
        type="text"
        value={value}
        onChange={onChange}
        dir={dir}
        className={`
          w-full px-3 py-2.5 rounded-lg border-2 transition-all
          ${error 
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
            : 'border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
          }
          text-gray-900 font-medium
          ${align === 'right' ? 'text-right' : 'text-left'}
        `}
        style={{ fontFamily: dir === 'rtl' ? 'Cairo, sans-serif' : 'inherit' }}
      />
      
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// Main ExtractionForm Component
// ============================================================================
const ExtractionForm = ({ 
  data, 
  onFieldChange, 
  onConfirm, 
  onSkip,
  saving = false,
  needsReview = false,
  issues = []
}) => {
  const getOverallConfidence = () => {
    const confidences = Object.values(data).filter(f => f?.confidence !== undefined);
    if (confidences.length === 0) return 0;
    const avg = confidences.reduce((sum, f) => sum + f.confidence, 0) / confidences.length;
    return (avg * 100).toFixed(0);
  };

  const getCriticalIssues = () => {
    return issues.filter(i => i.severity === 'error');
  };

  const getWarnings = () => {
    return issues.filter(i => i.severity === 'warning');
  };

  // Get to_account value for linking with receiver_name
  const toAccountValue = data.to_account?.value || '';

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 h-full flex flex-col">
      {/* Header with status */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">البيانات المستخرجة</h3>
          <div className={`
            px-3 py-1 rounded-full text-xs font-semibold
            ${getOverallConfidence() >= 90 ? 'bg-green-100 text-green-800' : 
              getOverallConfidence() >= 75 ? 'bg-amber-100 text-amber-800' : 
              'bg-red-100 text-red-800'}
          `}>
            دقة: {getOverallConfidence()}%
          </div>
        </div>
        {needsReview && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">يحتاج للمراجعة</span>
          </div>
        )}
      </div>

      {/* Critical Issues */}
      {getCriticalIssues().length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 text-sm mb-2 text-right">أخطاء حرجة:</h4>
              <ul className="space-y-1.5">
                {getCriticalIssues().map((issue, i) => (
                  <li key={i} className="text-sm text-red-800 text-right">
                    • <span className="font-semibold">{issue.field}:</span> {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {getWarnings().length > 0 && getCriticalIssues().length === 0 && (
        <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-amber-900 text-sm mb-2 text-right">ملاحظات:</h4>
              <ul className="space-y-1.5">
                {getWarnings().map((issue, i) => (
                  <li key={i} className="text-sm text-amber-800 text-right">
                    • <span className="font-semibold">{issue.field}:</span> {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Form Fields */}
      <div className="flex-1 space-y-3.5 overflow-auto mb-6 pr-1">
        {Object.keys(FIELD_DEFINITIONS).map(key => {
          const field = FIELD_DEFINITIONS[key];
          const fieldData = data[key] || {};
          
          // ONLY receiver_name gets autocomplete
          if (key === 'receiver_name') {
            return (
              <ReceiverNameAutocomplete
                key={key}
                value={fieldData.value || ''}
                onChange={(e) => onFieldChange(key, e.target.value)}
                confidence={fieldData.confidence}
                error={fieldData.needs_review ? 'يحتاج للمراجعة' : null}
                toAccountValue={toAccountValue}
              />
            );
          }
          
          // All other fields use regular input
          return (
            <Input
              key={key}
              label={field.label}
              value={fieldData.value || ''}
              onChange={(e) => onFieldChange(key, e.target.value)}
              confidence={fieldData.confidence}
              dir={field.dir}
              align={field.align}
              error={fieldData.needs_review ? 'يحتاج للمراجعة' : null}
            />
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-gray-200 flex gap-3">
        <button
          onClick={onSkip}
          disabled={saving}
          className="px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          <SkipForward className="w-4 h-4" />
          تخطي
        </button>
        <button
          onClick={onConfirm}
          disabled={saving}
          className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>تأكيد وحفظ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExtractionForm;