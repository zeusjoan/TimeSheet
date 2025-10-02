
import React from 'react';

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className || ''}`}>
            {children}
        </table>
    </div>
);

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <thead className={`bg-gray-50 dark:bg-gray-800 ${className || ''}`}>
        {children}
    </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <tbody className={`bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 ${className || ''}`}>
        {children}
    </tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <tr className={`${className || ''}`}>
        {children}
    </tr>
);

// Fix: Updated TableHead to accept all standard `th` attributes to allow for props like `colSpan`.
export const TableHead: React.FC<React.ComponentProps<'th'>> = ({ children, className, scope = "col", ...props }) => (
    <th scope={scope} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${className || ''}`} {...props}>
        {children}
    </th>
);

// Fix: Updated TableCell to accept all standard `td` attributes to fix an error where `colSpan` was being passed.
export const TableCell: React.FC<React.ComponentProps<'td'>> = ({ children, className, ...props }) => (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${className || ''}`} {...props}>
        {children}
    </td>
);