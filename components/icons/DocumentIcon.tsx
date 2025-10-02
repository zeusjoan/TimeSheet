
import React from 'react';

const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.5h-8.021a1.125 1.125 0 01-1.125-1.125V6.108A2.625 2.625 0 017.231 3.5h2.625a1.125 1.125 0 011.125 1.125v6.625a.375.375 0 00.625.25V1.875a.375.375 0 01.375-.375h2.25A3.375 3.375 0 0119.5 4.5v.75m-6.912 8.16l-3.32-3.319a.75.75 0 00-1.06 1.06l3.32 3.319a.75.75 0 001.06 0l3.32-3.319a.75.75 0 00-1.06-1.06l-3.32 3.319z" />
    </svg>
);

export default DocumentIcon;