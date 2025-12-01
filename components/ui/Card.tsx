
import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-3">{title}</h3>
      {children}
    </div>
  );
};

export default Card;
