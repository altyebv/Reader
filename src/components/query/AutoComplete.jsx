import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const AutocompleteInput = ({ label, value, onChange, onSearch, placeholder, dir = 'ltr' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = async (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (newValue.length >= 2) {
      setLoading(true);
      try {
        const results = await onSearch(newValue);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    onChange(suggestion.value);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          dir={dir}
          className="w-full px-3 py-1.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium transition-all"
        />
        {loading && (
          <Loader2 className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-teal-500" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-teal-300 rounded-lg shadow-xl max-h-48 overflow-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(suggestion);
              }}
              className="w-full px-3 py-2 text-right hover:bg-teal-50 flex items-center justify-between border-b border-gray-100 last:border-0 transition-all"
            >
              <div className="flex items-center gap-1.5">
                {suggestion.verified && (
                  <span className="px-1.5 py-0.5 bg-green-500 text-white text-xs rounded-full font-bold">✓</span>
                )}
                <span className="text-xs text-gray-500 font-semibold">{suggestion.frequency}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900 text-xs">{suggestion.display_name || suggestion.value}</div>
                <div className="text-xs text-gray-600 font-mono">{suggestion.value}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;