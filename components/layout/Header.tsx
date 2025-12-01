
import React from 'react';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-white shadow-md p-4 z-10">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
    </header>
  );
};

export default Header;
