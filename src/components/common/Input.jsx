import React from 'react';
import ConfidenceBadge from './ConfidenceBadge';
import DateConversionIndicator from './DateConversionIndicator';

const FIELD_DEFINITIONS = {
  transaction_id: { critical: true, showConfidence: true },
  datetime: { critical: false, showConfidence: true, isDate: true },
  from_account: { critical: true, showConfidence: true },
  to_account: { critical: true, showConfidence: true },
  receiver_name: { critical: false, showConfidence: false },
  comment: { critical: false, showConfidence: false },
  amount: { critical: true, showConfidence: true }
};

const Input = ({ 
  label, 
  value, 
  onChange, 
  confidence, 
  dir, 
  align, 
  needsReview, 
  icon, 
  fieldName, 
  dateConverted,
  compact = false 
}) => {
  const fieldDef = FIELD_DEFINITIONS[fieldName];
  const isCritical = fieldDef?.critical;
  const isDate = fieldDef?.isDate;
  
  const shouldHighlight = isCritical && needsReview && confidence < 0.9;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {fieldDef?.showConfidence && <ConfidenceBadge confidence={confidence} />}
          {isDate && dateConverted && <DateConversionIndicator converted={true} />}
        </div>
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-sm">{icon}</span>
        </label>
      </div>

      <input
        type="text"
        value={value}
        onChange={onChange}
        dir={dir}
        className={`
          w-full px-3 ${compact ? 'py-2' : 'py-2.5'} text-sm rounded-lg border-2 transition-all font-medium text-slate-900 shadow-sm
          ${shouldHighlight
            ? 'border-amber-400 bg-amber-50 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'
            : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
          }
          ${align === 'right' ? 'text-right' : 'text-left'}
        `}
        style={{ fontFamily: dir === 'rtl' ? 'Cairo, sans-serif' : 'inherit' }}
        placeholder={`أدخل ${label}...`}
      />
    </div>
  );
};

export default Input;