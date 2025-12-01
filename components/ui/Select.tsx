
import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string | number; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, options, ...props }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-2 font-medium text-sm text-gray-700">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow duration-200"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
