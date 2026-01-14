import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, SkipForward, Loader2, Sparkles, XCircle, Zap } from 'lucide-react';
import { searchReceiverNames } from '../../utils/api';

const FIELD_DEFINITIONS = {
  transaction_id: {
    label: 'رقم العملية',
    type: 'text',
    dir: 'ltr',
    align: 'left',
    icon: '🔢',
    compact: true
  },
  datetime: {
    label: 'التاريخ',
    type: 'text',
    dir: 'ltr',
    align: 'left',
    icon: '📅',
    compact: true
  },
  from_account: {
    label: 'من حساب',
    type: 'text',
    dir: 'ltr',
    align: 'left',
    icon: '🏦'
  },
  to_account: {
    label: 'إلى حساب',
    type: 'text',
    dir: 'ltr',
    align: 'left',
    icon: '🏦'
  },
  receiver_name: {
    label: 'اسم المرسل إليه',
    type: 'text',
    dir: 'rtl',
    align: 'right',
    autocomplete: true,
    icon: '👤'
  },
  comment: {
    label: 'التعليق',
    type: 'text',
    dir: 'ltr',
    align: 'right',
    icon: '💬'
  },
  amount: {
    label: 'المبلغ',
    type: 'text',
    dir: 'ltr',
    align: 'left',
    icon: '💰'
  }
};

// ============================================================================
// CONFIDENCE BADGE COMPONENT
// ============================================================================
const ConfidenceBadge = ({ confidence }) => {
  if (confidence === undefined) return null;

  const percentage = (confidence * 100).toFixed(0);

  const getStyle = () => {
    if (confidence >= 0.90) return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      icon: '✓'
    };
    if (confidence >= 0.75) return {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: '⚠'
    };
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      icon: '✗'
    };
  };

  const style = getStyle();

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
      <span>{style.icon}</span>
      <span>{percentage}%</span>
    </div>
  );
};

// ============================================================================
// AUTOCOMPLETE COMPONENT - Receiver Name with auto-replacement
// ============================================================================
const ReceiverNameAutocomplete = ({
  value,
  onChange,
  confidence,
  needsReview,
  toAccountValue,
  icon
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [autoReplaced, setAutoReplaced] = useState(false);
  const [userEdited, setUserEdited] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const results = await searchReceiverNames(query, toAccountValue);
      setSuggestions(results.slice(0, 10));
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-replace on load if we find a linked name
  useEffect(() => {
    const checkForLinkedName = async () => {
      if (!toAccountValue || !value || userEdited || autoReplaced) return;

      try {
        const results = await searchReceiverNames(value, toAccountValue);
        const linked = results.find(r =>
          r.display_name &&
          r.display_name.replace(/\s/g, '') === toAccountValue.replace(/\s/g, '')
        );

        if (linked && linked.value !== value) {
          onChange({ target: { value: linked.value } });
          setAutoReplaced(true);
        }
      } catch (err) {
        console.error('Auto-replace check failed:', err);
      }
    };

    const timer = setTimeout(checkForLinkedName, 500);
    return () => clearTimeout(timer);
  }, [toAccountValue, value, userEdited, autoReplaced]);

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

  // Close dropdown when clicking outside
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

  const selectSuggestion = (suggestion) => {
    onChange({ target: { value: suggestion.value } });
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setUserEdited(true);
    inputRef.current?.focus();
  };

  const handleChange = (e) => {
    onChange(e);
    setUserEdited(true);
    setAutoReplaced(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) selectSuggestion(suggestions[selectedIndex]);
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

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ConfidenceBadge confidence={confidence} />
          {autoReplaced && !userEdited && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300 animate-in fade-in duration-300">
              <Zap className="w-3 h-3" />
              <span>اسم محفوظ</span>
            </div>
          )}
        </div>
        <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
          <span>{FIELD_DEFINITIONS.receiver_name.label}</span>
          <span className="text-base">{icon}</span>
        </label>
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={handleBlur}
          dir="rtl"
          className={`
            w-full px-4 py-2.5 text-sm rounded-xl border-2 transition-all text-right font-medium text-gray-900 shadow-sm
            ${needsReview && confidence < 0.9
              ? 'border-amber-400 bg-amber-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-100'
              : autoReplaced && !userEdited
                ? 'border-teal-400 bg-teal-50 focus:border-teal-500 focus:ring-4 focus:ring-teal-100'
                : 'border-gray-300 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100'
            }
          `}
          style={{ fontFamily: 'Cairo, sans-serif' }}
        />

        {loading && (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-teal-500" />
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-xl max-h-60 overflow-auto">
            {suggestions.map((suggestion, idx) => {
              const isLinked = toAccountValue && suggestion.display_name &&
                suggestion.display_name.replace(/\s/g, '') === toAccountValue.replace(/\s/g, '');

              return (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(suggestion);
                  }}
                  className={`
                    w-full px-3 py-2.5 text-right flex items-center justify-between 
                    border-b border-gray-100 last:border-0 transition-all
                    ${selectedIndex === idx
                      ? 'bg-teal-50 border-r-4 border-r-teal-500'
                      : isLinked
                        ? 'bg-gray-50 hover:bg-gray-100'
                        : 'bg-white hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {isLinked && (
                      <span className="px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full font-bold">
                        ✓
                      </span>
                    )}
                    <span className="text-xs text-gray-500 font-semibold">
                      {suggestion.frequency}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Cairo, sans-serif' }}>
                      {suggestion.value}
                    </div>
                    {suggestion.display_name && (
                      <div className="text-xs text-gray-600 font-mono">
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
    </div>
  );
};

// ============================================================================
// REGULAR INPUT COMPONENT
// ============================================================================
const Input = ({ label, value, onChange, confidence, dir, align, needsReview, icon }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <ConfidenceBadge confidence={confidence} />
        <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-base">{icon}</span>
        </label>
      </div>

      <input
        type="text"
        value={value}
        onChange={onChange}
        dir={dir}
        className={`
          w-full px-4 py-2.5 text-sm rounded-xl border-2 transition-all font-medium text-gray-900 shadow-sm
          ${needsReview && confidence < 0.9
            ? 'border-amber-400 bg-amber-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-100'
            : 'border-gray-300 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100'
          }
          ${align === 'right' ? 'text-right' : 'text-left'}
        `}
        style={{ fontFamily: dir === 'rtl' ? 'Cairo, sans-serif' : 'inherit' }}
      />
    </div>
  );
};

// ============================================================================
// MAIN EXTRACTION FORM COMPONENT
// ============================================================================
const ExtractionForm = ({
  data,
  onFieldChange,
  onConfirm,
  onSkip,
  saving = false,
  needsReview = false,
  issues = [],
  isDuplicate = false
}) => {
  const getOverallConfidence = () => {
    const confidences = Object.values(data).filter(f => f?.confidence !== undefined);
    if (confidences.length === 0) return 0;
    const avg = confidences.reduce((sum, f) => sum + f.confidence, 0) / confidences.length;
    return (avg * 100).toFixed(0);
  };

  const getCriticalIssues = () => issues.filter(i => i.severity === 'error');
  const toAccountValue = data.to_account?.value || '';

  const overallConfidence = getOverallConfidence();
  const confidenceColor = overallConfidence >= 90 ? 'teal' : overallConfidence >= 75 ? 'amber' : 'red';

  const compactFields = Object.keys(FIELD_DEFINITIONS).filter(k => FIELD_DEFINITIONS[k].compact);
  const regularFields = Object.keys(FIELD_DEFINITIONS).filter(k => !FIELD_DEFINITIONS[k].compact);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-br from-gray-50 to-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
              confidenceColor === 'teal' ? 'from-teal-400 to-teal-600' : 
              confidenceColor === 'amber' ? 'from-amber-400 to-amber-600' : 
              'from-red-400 to-red-600'
            } flex items-center justify-center shadow-lg`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-900">البيانات المستخرجة</h3>
          </div>
          <div className={`px-4 py-2 rounded-xl font-bold border-2 shadow-sm ${
            overallConfidence >= 90 ? 'bg-green-50 text-green-700 border-green-300' :
            overallConfidence >= 75 ? 'bg-amber-50 text-amber-700 border-amber-300' :
            'bg-red-50 text-red-700 border-red-300'
          }`}>
            {overallConfidence}%
          </div>
        </div>
      </div>

      {/* Critical Issues */}
      {getCriticalIssues().length > 0 && (
        <div className="flex-shrink-0 mx-4 mt-3 p-3 bg-red-50 border-2 border-red-300 rounded-xl">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 text-sm mb-1 text-right">أخطاء:</h4>
              <ul className="space-y-1">
                {getCriticalIssues().map((issue, i) => (
                  <li key={i} className="text-xs text-red-800 text-right">
                    • {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <div className="space-y-3 pb-2">
          {/* Compact Row */}
          <div className="grid grid-cols-2 gap-3">
            {compactFields.map(key => {
              const field = FIELD_DEFINITIONS[key];
              const fieldData = data[key] || {};

              return (
                <Input
                  key={key}
                  label={field.label}
                  value={fieldData.value || ''}
                  onChange={(e) => onFieldChange(key, e.target.value)}
                  confidence={fieldData.confidence}
                  dir={field.dir}
                  align={field.align}
                  needsReview={fieldData.needs_review}
                  icon={field.icon}
                />
              );
            })}
          </div>

          {/* Regular Fields - with autocomplete for receiver_name */}
          {regularFields.map(key => {
            const field = FIELD_DEFINITIONS[key];
            const fieldData = data[key] || {};

            if (key === 'receiver_name') {
              return (
                <ReceiverNameAutocomplete
                  key={key}
                  value={fieldData.value || ''}
                  onChange={(e) => onFieldChange(key, e.target.value)}
                  confidence={fieldData.confidence}
                  needsReview={fieldData.needs_review}
                  toAccountValue={toAccountValue}
                  icon={field.icon}
                />
              );
            }

            return (
              <Input
                key={key}
                label={field.label}
                value={fieldData.value || ''}
                onChange={(e) => onFieldChange(key, e.target.value)}
                confidence={fieldData.confidence}
                dir={field.dir}
                align={field.align}
                needsReview={fieldData.needs_review}
                icon={field.icon}
              />
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            disabled={saving}
            className="
              px-4 py-3 rounded-xl font-bold transition-all text-sm
              disabled:opacity-50 disabled:cursor-not-allowed 
              bg-gray-200 hover:bg-gray-300 text-gray-700
              flex items-center justify-center gap-2
              border-2 border-gray-300 hover:border-gray-400
              hover:scale-105
            "
          >
            <SkipForward className="w-4 h-4" />
            <span>تخطي</span>
          </button>
          <button
            onClick={onConfirm}
            disabled={saving || isDuplicate}
            className="
              flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm
              disabled:opacity-50 disabled:cursor-not-allowed 
              bg-gradient-to-r from-teal-500 to-teal-600 
              hover:from-teal-600 hover:to-teal-700
              text-white shadow-lg hover:shadow-xl
              flex items-center justify-center gap-2
              hover:scale-105
            "
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : isDuplicate ? (
              <>
                <XCircle className="w-4 h-4" />
                <span>مكرر - لا يمكن الحفظ</span>
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
    </div>
  );
};

export default ExtractionForm;