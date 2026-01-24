import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  SkipForward,
  Loader2,
  Sparkles,
  XCircle,
  Zap,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { searchReceiverNames } from '../../utils/api';

/* ============================================================================
 * FIELD DEFINITIONS
 * ========================================================================== */
const FIELD_DEFINITIONS = {
  transaction_id: {
    label: 'رقم العملية',
    dir: 'ltr',
    align: 'left',
    icon: '🔢',
    compact: true,
    critical: true,
    showConfidence: true
  },
  datetime: {
    label: 'التاريخ',
    dir: 'ltr',
    align: 'left',
    icon: '📅',
    compact: true,
    critical: false,
    showConfidence: true,
    isDate: true
  },
  from_account: {
    label: 'من حساب',
    dir: 'ltr',
    align: 'left',
    icon: '🏦',
    critical: true,
    showConfidence: true
  },
  to_account: {
    label: 'إلى حساب',
    dir: 'ltr',
    align: 'left',
    icon: '🏦',
    critical: true,
    showConfidence: true
  },
  receiver_name: {
    label: 'اسم المرسل إليه',
    dir: 'rtl',
    align: 'right',
    autocomplete: true,
    icon: '👤',
    critical: false,
    showConfidence: false
  },
  comment: {
    label: 'التعليق',
    dir: 'ltr',
    align: 'right',
    icon: '💬',
    critical: false,
    showConfidence: false
  },
  amount: {
    label: 'المبلغ',
    dir: 'ltr',
    align: 'left',
    icon: '💰',
    critical: true,
    showConfidence: true
  }
};

/* ============================================================================
 * CONFIDENCE BADGE
 * ========================================================================== */
const ConfidenceBadge = ({ confidence }) => {
  if (confidence === undefined) return null;
  const pct = Math.round(confidence * 100);

  const style =
    confidence >= 0.9
      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
      : confidence >= 0.75
      ? 'bg-amber-50 text-amber-800 border-amber-300'
      : 'bg-rose-50 text-rose-800 border-rose-300';

  return (
    <div className={`px-2.5 py-1 text-xs font-bold rounded-full border ${style}`}>
      {pct}%
    </div>
  );
};

/* ============================================================================
 * DATE CONVERSION INDICATOR
 * ========================================================================== */
const DateConversionIndicator = ({ show }) => {
  if (!show) return null;
  return (
    <div className="flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-800 border border-indigo-300">
      <Clock className="w-3 h-3" />
      تم التحويل تلقائياً
    </div>
  );
};

/* ============================================================================
 * RECEIVER NAME AUTOCOMPLETE
 * ========================================================================== */
const ReceiverNameAutocomplete = ({
  value,
  onChange,
  confidence,
  needsReview,
  toAccountValue,
  icon
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoReplaced, setAutoReplaced] = useState(false);
  const [userEdited, setUserEdited] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchReceiverNames(value, toAccountValue);
        setSuggestions(res.slice(0, 10));
        setOpen(res.length > 0);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [value, toAccountValue]);

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex justify-between mb-2">
        <div className="flex gap-2">
          <ConfidenceBadge confidence={confidence} />
          {autoReplaced && !userEdited && (
            <div className="px-2 py-1 text-xs font-bold bg-indigo-50 border border-indigo-300 rounded-full flex gap-1">
              <Zap className="w-3 h-3" /> اسم محفوظ
            </div>
          )}
        </div>
        <label className="font-bold text-black text-sm flex gap-2">
          {FIELD_DEFINITIONS.receiver_name.label}
          <span>{icon}</span>
        </label>
      </div>

      <input
        value={value}
        dir="rtl"
        onChange={e => {
          onChange(e);
          setUserEdited(true);
          setAutoReplaced(false);
        }}
        className={`
          w-full px-3 py-2 text-slate-900 font-semibold rounded-xl border-2 text-right
          ${needsReview && confidence < 0.9
            ? 'border-amber-400 bg-amber-50'
            : 'border-slate-300 bg-white'}
        `}
        placeholder="ابحث أو أدخل الاسم..."
      />

      {loading && (
        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-500" />
      )}

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-indigo-300 rounded-xl shadow-xl">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => {
                onChange({ target: { value: s.value } });
                setOpen(false);
              }}
              className="w-full px-4 py-3 text-right hover:bg-indigo-50 border-b last:border-0"
            >
              <div className="font-bold">{s.value}</div>
              {s.display_name && (
                <div className="text-xs text-slate-600">{s.display_name}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * GENERIC INPUT
 * ========================================================================== */
const Input = ({
  fieldName,
  label,
  value,
  onChange,
  confidence,
  dir,
  align,
  needsReview,
  icon
}) => {
  const def = FIELD_DEFINITIONS[fieldName];
  const highlight = def.critical && needsReview && confidence < 0.9;

  return (
    <div>
      <div className="flex justify-between mb-2">
        <div className="flex gap-2">
          {def.showConfidence && <ConfidenceBadge confidence={confidence} />}
          {def.isDate && value?.includes('/') && (
            <DateConversionIndicator show />
          )}
        </div>
        <label className="font-bold text-black text-sm flex gap-2">
          {label}
          <span>{icon}</span>
        </label>
      </div>

      <input
        value={value}
        onChange={onChange}
        dir={dir}
        className={`
          w-full px-3 py-2 text-slate-900 font-semibold rounded-xl border-2
          ${highlight
            ? 'border-amber-400 bg-amber-50'
            : 'border-slate-300 bg-white'}
          ${align === 'right' ? 'text-right' : 'text-left'}
        `}
      />
    </div>
  );
};

/* ============================================================================
 * MAIN EXTRACTION FORM (DROP-IN REPLACEMENT)
 * ========================================================================== */
const ExtractionForm = ({
  data,
  onFieldChange,
  onConfirm,
  onSkip,
  saving = false,
  issues = [],
  isDuplicate = false,
  overallConfidence
}) => {
  const criticalIssues = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const toAccountValue = data.to_account?.value || '';

  const compactFields = Object.keys(FIELD_DEFINITIONS).filter(
    k => FIELD_DEFINITIONS[k].compact
  );
  const regularFields = Object.keys(FIELD_DEFINITIONS).filter(
    k => !FIELD_DEFINITIONS[k].compact
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border h-full flex flex-col">
      /* Header */
        <div className="px-3 py-1 border-b flex justify-between">
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Sparkles className="text-white" />
            </div>
            <div>
          <h3 className="font-bold text-black">البيانات المستخرجة</h3>
          <p className="text-sm text-slate-600">
            {Object.values(data).filter(f => f?.needs_review).length
              ? 'يحتاج مراجعة'
              : 'جاهز للحفظ'}
          </p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-2xl bg-emerald-300/80 text-black font-bold">
            {overallConfidence.toFixed(1)}%
          </div>
        </div>

        {/* Issues */}
      {criticalIssues.length > 0 && (
        <div className="m-5 p-4 bg-rose-50 border border-rose-300 rounded-xl">
          {criticalIssues.map((i, idx) => (
            <div key={idx} className="text-sm text-rose-800">
              • {i.message}
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && criticalIssues.length === 0 && (
        <div className="m-5 p-4 bg-amber-50 border border-amber-300 rounded-xl">
          {warnings.map((i, idx) => (
            <div key={idx} className="text-sm text-amber-800">
              • {i.message}
            </div>
          ))}
        </div>
      )}

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        <div className="grid grid-cols-2 gap-4">
          {compactFields.map(k => (
            <Input
              key={k}
              fieldName={k}
              {...FIELD_DEFINITIONS[k]}
              value={data[k]?.value || ''}
              confidence={data[k]?.confidence}
              needsReview={data[k]?.needs_review}
              onChange={e => onFieldChange(k, e.target.value)}
            />
          ))}
        </div>

        {regularFields.map(k =>
          k === 'receiver_name' ? (
            <ReceiverNameAutocomplete
              key={k}
              value={data[k]?.value || ''}
              confidence={data[k]?.confidence}
              needsReview={data[k]?.needs_review}
              toAccountValue={toAccountValue}
              icon={FIELD_DEFINITIONS[k].icon}
              onChange={e => onFieldChange(k, e.target.value)}
            />
          ) : (
            <Input
              key={k}
              fieldName={k}
              {...FIELD_DEFINITIONS[k]}
              value={data[k]?.value || ''}
              confidence={data[k]?.confidence}
              needsReview={data[k]?.needs_review}
              onChange={e => onFieldChange(k, e.target.value)}
            />
          )
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t flex gap-3">
        <button onClick={onSkip} className="px-5 py-3 border rounded-xl">
          <SkipForward className="w-4 h-4 inline" /> تخطي
        </button>

        <button
          onClick={onConfirm}
          disabled={saving || isDuplicate || criticalIssues.length > 0}
          className="flex-1 px-5 py-3 bg-indigo-600 text-white rounded-xl"
        >
          {saving ? 'جاري الحفظ...' : 'تأكيد وحفظ'}
        </button>
      </div>
    </div>
  );
};

export default ExtractionForm;
