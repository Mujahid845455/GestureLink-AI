import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'text-deafcomm-blue',
    white: 'text-white',
    gray: 'text-gray-500',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <FaSpinner 
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
      />
    </div>
  );
};

export default LoadingSpinner;