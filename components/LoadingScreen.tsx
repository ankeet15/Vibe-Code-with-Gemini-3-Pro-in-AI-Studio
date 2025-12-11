import React, { useEffect, useState } from 'react';

const messages = [
  "Scanning document structure...",
  "Identifying liability clauses...",
  "Cross-referencing consumer protection laws...",
  "Detecting logical fallacies...",
  "Formulating legal arguments...",
];

export const LoadingScreen = ({ type = 'scan' }: { type: 'scan' | 'letter' }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 animate-fade-in">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-legal-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-legal-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            {type === 'scan' ? (
                <svg className="w-10 h-10 text-legal-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
            ) : (
                 <svg className="w-10 h-10 text-legal-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            )}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-serif font-bold text-legal-800">
          {type === 'scan' ? 'Deep Scan in Progress' : 'Drafting Formal Letter'}
        </h3>
        <p className="text-legal-500 mt-2 text-sm uppercase tracking-wide">
          {type === 'scan' ? messages[msgIndex] : "Reviewing findings and drafting citations..."}
        </p>
      </div>
    </div>
  );
};
