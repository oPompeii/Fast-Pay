import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
  circle?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  count = 1,
  circle = false 
}) => {
  const baseClass = `animate-pulse bg-gray-200 dark:bg-gray-700 ${circle ? 'rounded-full' : 'rounded'}`;
  const elements = Array(count).fill(0);

  return (
    <>
      {elements.map((_, index) => (
        <div
          key={index}
          className={`${baseClass} ${className}`}
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </>
  );
};

export default Skeleton;