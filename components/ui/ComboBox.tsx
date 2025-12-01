import React, { useState, useRef, useEffect, useMemo } from 'react';

interface ComboBoxOption {
  value: string;
  label: string;
}

interface ComboBoxProps {
  options: ComboBoxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
}

const ComboBox: React.FC<ComboBoxProps> = ({ options, value, onChange, placeholder = "Select...", id, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const selectedOption = options.find(option => option.value === value);
    setInputValue(selectedOption ? selectedOption.label : '');
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    if (!inputValue) {
      return options;
    }
    // If the input value exactly matches the label of the selected value, show all options.
    const selectedOption = options.find(option => option.value === value);
    if (selectedOption && selectedOption.label === inputValue) {
        return options;
    }
    return options.filter(option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [options, inputValue, value]);

  const handleSelectOption = (option: ComboBoxOption) => {
    onChange(option.value);
    setInputValue(option.label);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // If user clears the input, call onChange with an empty string
    if (e.target.value === '') {
        onChange('');
    }
    setIsOpen(true);
    setHighlightedIndex(-1); // Reset highlight on text change
  };
  
  const handleInputFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelectOption(filteredOptions[highlightedIndex]);
      } else if (filteredOptions.length > 0) {
        handleSelectOption(filteredOptions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="p-1 border border-gray-400 rounded-sm w-full text-sm font-bold bg-white"
        autoComplete="off"
      />
      {isOpen && (
        <ul
          className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg"
          role="listbox"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                onClick={() => handleSelectOption(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-3 py-2 cursor-pointer text-sm ${
                  index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                role="option"
                aria-selected={value === option.value}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500">No options found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default ComboBox;
