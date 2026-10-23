import React from "react";
import { Search, X } from "lucide-react";

export function SearchBar({ value, onChange, onClear, placeholder }) {
  return (
    <div className="search-bar-wrapper">
      <div className="search-input-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            placeholder ||
            "Search by member name, family head, village, maternal surname, occupation..."
          }
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={onClear}
            title="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
