
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={`pb-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className }) => (
  <h3 className={`text-lg font-semibold text-primary dark:text-white ${className}`}>
    {children}
  </h3>
);

export const CardDescription: React.FC<CardProps> = ({ children, className }) => (
    <p className={`text-sm text-muted-foreground dark:text-gray-400 ${className}`}>{children}</p>
);

export const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={`pt-4 ${className}`}>{children}</div>
);

export default Card;