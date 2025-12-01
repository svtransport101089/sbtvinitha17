
import React, { ReactNode } from 'react';

interface PageWrapperProps {
    children: ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div className="container mx-auto px-6 py-8">
      {children}
    </div>
  );
};

export default PageWrapper;
