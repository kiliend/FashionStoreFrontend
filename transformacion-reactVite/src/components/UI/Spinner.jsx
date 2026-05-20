// src/components/UI/Spinner.jsx
import React from 'react';

const Spinner = ({ size = 'md', color = '#d9467a' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4 border-t-transparent`}
        style={{ borderColor: `${color}`, borderTopColor: 'transparent' }}
      />
    </div>
  );
};

export default Spinner;
