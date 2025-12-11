import React from 'react';
import { UploadedFile } from '../types';

interface DocumentPreviewProps {
  file: UploadedFile;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ file }) => {
  const isPdf = file.mimeType === 'application/pdf';

  return (
    <div className="w-full h-full bg-slate-50 rounded-lg overflow-hidden flex flex-col relative">
      <div className="bg-slate-800 text-white text-xs px-4 py-2 flex justify-between items-center shadow-md z-10 shrink-0 h-10">
        <span className="font-semibold tracking-wide uppercase flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Original Document
        </span>
        {isPdf && (
            <a 
                href={file.previewUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-slate-300 hover:text-white underline text-[10px] transition-colors"
            >
                OPEN IN NEW TAB ↗
            </a>
        )}
      </div>
      <div className="flex-1 relative w-full h-full bg-slate-200/50 overflow-hidden">
          {isPdf ? (
            <object
              data={file.previewUrl}
              type="application/pdf"
              className="w-full h-full block"
            >
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
                    <p className="mb-4 font-medium">Preview not available in this browser view.</p>
                    <a 
                        href={file.previewUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        Open PDF in New Tab
                    </a>
                </div>
            </object>
          ) : (
            <div className="w-full h-full overflow-auto flex items-center justify-center p-4 bg-slate-100/50">
                <img
                    src={file.previewUrl}
                    alt="Uploaded Document"
                    className="max-w-full shadow-lg border border-slate-200 rounded"
                    style={{ maxHeight: 'none' }} 
                />
            </div>
          )}
      </div>
    </div>
  );
};