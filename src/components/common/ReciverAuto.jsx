import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { searchReceiverNames } from '../../utils/api';
import ConfidenceBadge from './confidenceIndicator';

const FIELD_DEFINITIONS = {
    receiver_name: { critical: false, showConfidence: false }
};

const ReceiverNameAutocomplete = ({
    value,
    onChange,
    confidence,
    needsReview,
    toAccountValue,
    icon,
    fieldName,
    compact = false
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

    const fieldDef = FIELD_DEFINITIONS[fieldName];
    const isCritical = fieldDef?.critical;
    const shouldHighlight = isCritical && needsReview && confidence < 0.9;

    return (
        <div ref={containerRef} className="relative">
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                    {fieldDef?.showConfidence && <ConfidenceBadge confidence={confidence} />}
                    {autoReplaced && !userEdited && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-800 border border-indigo-300 shadow-sm">
                            <Zap className="w-3 h-3" />
                            <span>محفوظ</span>
                        </div>
                    )}
                </div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>اسم المرسل إليه</span>
                    <span className="text-sm">{icon}</span>
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
            w-full px-3 ${compact ? 'py-2' : 'py-2.5'} text-sm rounded-lg border-2 transition-all text-right font-medium text-slate-900 shadow-sm
            ${shouldHighlight
                            ? 'border-amber-400 bg-amber-50 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'
                            : autoReplaced && !userEdited
                                ? 'border-indigo-400 bg-indigo-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                                : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                        }
          `}
                    style={{ fontFamily: 'Cairo, sans-serif' }}
                    placeholder="ابحث أو أدخل اسم المستلم..."
                />

                {loading && (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-500" />
                )}

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border-2 border-indigo-300 rounded-lg shadow-2xl max-h-48 overflow-auto">
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
                    w-full px-3 py-2 text-right flex items-center justify-between 
                    border-b border-slate-200 last:border-0 transition-all
                    ${selectedIndex === idx
                                            ? 'bg-indigo-100 border-r-4 border-r-indigo-600'
                                            : isLinked
                                                ? 'bg-indigo-50 hover:bg-indigo-100'
                                                : 'bg-white hover:bg-slate-100'
                                        }
                  `}
                                >
                                    <div className="flex items-center gap-2">
                                        {isLinked && (
                                            <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full font-bold">
                                                ✓
                                            </span>
                                        )}
                                        {suggestion.verified && !isLinked && (
                                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-bold">
                                                ✓
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded-full">
                                            {suggestion.frequency}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-900 text-sm" style={{ fontFamily: 'Cairo, sans-serif' }}>
                                            {suggestion.value}
                                        </div>
                                        {suggestion.display_name && (
                                            <div className="text-xs text-slate-600 font-semibold mt-0.5 font-mono">
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

export default ReceiverNameAutocomplete;
