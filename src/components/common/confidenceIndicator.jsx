import React from 'react';

const ConfidenceBadge = ({ confidence }) => {
  if (confidence === undefined) return null;

  const percentage = (confidence * 100).toFixed(0);

  const getStyle = () => {
    if (confidence >= 0.90) return {
      bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      icon: '✓'
    };
    if (confidence >= 0.75) return {
      bg: 'bg-gradient-to-r from-amber-50 to-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: '⚠'
    };
    return {
      bg: 'bg-gradient-to-r from-rose-50 to-rose-100',
      text: 'text-rose-800',
      border: 'border-rose-300',
      icon: '✗'
    };
  };

  const style = getStyle();

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border shadow-sm ${style.bg} ${style.text} ${style.border}`}>
      <span>{style.icon}</span>
      <span>{percentage}%</span>
    </div>
  );
};

export default ConfidenceBadge;