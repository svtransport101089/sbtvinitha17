
import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-2 font-medium text-sm text-gray-700">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 read-only:bg-gray-100"
      />
    </div>
  );
};

export default Input;
