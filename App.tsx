import React, { useState, useRef, useEffect } from 'react';
import { IconUpload, IconShield, IconArrowRight, IconAlert, IconCheck, IconDocument } from './components/Icons';
import { LoadingScreen } from './components/LoadingScreen';
import { DocumentPreview } from './components/DocumentPreview';
import { analyzeDocument, generateDisputeLetter } from './services/geminiService';
import { AppStep, UploadedFile, AnalysisResult } from './types';

function App() {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [userContext, setUserContext] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Mobile Responsive State
  const [activeMobileTab, setActiveMobileTab] = useState<'document' | 'analysis'>('analysis');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when results appear
  useEffect(() => {
    if (step === AppStep.RESULTS || step === AppStep.LETTER_READY) {
      const scrollContainer = resultsContainerRef.current;
      
      const handleScroll = () => {
        if (scrollContainer) {
          scrollContainer.scrollTop = 0;
        }
        // Also scroll window for mobile layouts
        window.scrollTo(0, 0);
      };

      // Attempt 1: Immediate
      handleScroll();

      // Attempt 2: Next Animation Frame (after paint)
      const rafId = requestAnimationFrame(handleScroll);

      // Attempt 3: Small delay for any layout shifts/animations
      const timeoutId = setTimeout(handleScroll, 150);
      
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timeoutId);
      };
    }
  }, [step, analysisResult]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError('Only images and PDF files are supported.');
        return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1]; 
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const previewUrl = URL.createObjectURL(file);

      setUploadedFile({
        file,
        previewUrl,
        base64,
        mimeType: file.type,
      });
      setError(null);
    } catch (e) {
      setError("Failed to process file.");
    }
  };

  const startDeepScan = async () => {
    if (!uploadedFile) return;
    setStep(AppStep.ANALYZING);
    try {
      const result = await analyzeDocument(uploadedFile.base64, uploadedFile.mimeType, userContext);
      setAnalysisResult(result);
      // Reset mobile tab to analysis so user sees results first
      setActiveMobileTab('analysis');
      setStep(AppStep.RESULTS);
    } catch (e) {
      setError("Analysis failed. Please try again.");
      setStep(AppStep.UPLOAD);
    }
  };

  const handleGenerateLetter = async () => {
    if (!analysisResult) return;
    setStep(AppStep.GENERATING_LETTER);
    try {
      const letter = await generateDisputeLetter(analysisResult, userContext);
      setGeneratedLetter(letter);
      // Ensure we are viewing the analysis/letter tab
      setActiveMobileTab('analysis');
      setStep(AppStep.LETTER_READY);
    } catch (e) {
        setError("Failed to generate letter.");
        setStep(AppStep.RESULTS);
    }
  };

  const reset = () => {
    setStep(AppStep.UPLOAD);
    setUploadedFile(null);
    setUserContext('');
    setAnalysisResult(null);
    setGeneratedLetter('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Dynamic Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-4 md:px-6">
          <div className="group flex items-center gap-3 cursor-pointer" onClick={reset}>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-2.5 rounded-xl text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <IconShield className="w-6 h-6" />
              </div>
            </div>
            <div className="flex flex-col">
               <span className="text-lg md:text-xl font-serif font-bold text-slate-900 tracking-tight leading-none group-hover:text-blue-900 transition-colors">
                  Fine Print Defender
               </span>
               <span className="h-0.5 w-0 bg-blue-600 mt-1 transition-all duration-500 group-hover:w-full"></span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Gemini 3 Pro Active
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col pt-20 relative overflow-hidden">
        
        {/* Error Toast */}
        {error && (
            <div className="absolute top-24 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-slide-up">
                <IconAlert className="w-5 h-5 text-red-500 shrink-0" />
                <span className="font-medium text-sm md:text-base">{error}</span>
                <button onClick={() => setError(null)} className="ml-auto md:ml-4 text-red-400 hover:text-red-700">✕</button>
            </div>
        )}

        {/* STEP: Upload & Context */}
        {step === AppStep.UPLOAD && (
          <div className="flex-1 overflow-y-auto w-full">
            <div className="max-w-5xl mx-auto py-8 md:py-16 px-4 md:px-6">
              
              {/* Hero Text */}
              <div className="text-center mb-10 md:mb-16 animate-slide-up" style={{ animationDelay: '0ms' }}>
                <h1 className="text-3xl md:text-6xl font-serif font-bold text-slate-900 mb-4 md:mb-6 leading-tight">
                  Justice, <span className="text-blue-600 relative inline-block">
                    Simplified
                    <svg className="absolute w-full h-2 md:h-3 -bottom-1 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                    </svg>
                  </span>.
                </h1>
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed px-2">
                  Upload any contract, lease, or bill. Our AI finds the predatory clauses and writes the dispute letter for you.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch animate-slide-up" style={{ animationDelay: '100ms' }}>
                
                {/* Upload Zone */}
                <div 
                    className={`
                        relative group rounded-2xl border-2 border-dashed p-6 md:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[250px]
                        ${uploadedFile 
                            ? 'border-green-500 bg-green-50/30' 
                            : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1'
                        }
                    `}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                    />
                    
                    <div className="bg-white p-4 rounded-full shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                        {uploadedFile ? (
                            <IconCheck className="w-8 h-8 text-green-500" />
                        ) : (
                            <IconUpload className="w-8 h-8 text-blue-600" />
                        )}
                    </div>

                    {uploadedFile ? (
                        <div className="animate-fade-in w-full overflow-hidden">
                             <p className="font-bold text-slate-900 text-lg mb-1 truncate px-4">{uploadedFile.file.name}</p>
                             <p className="text-sm text-slate-500">{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB • Ready to scan</p>
                             <div className="mt-4 inline-flex items-center text-xs font-bold text-blue-600 uppercase tracking-wide hover:underline">
                                Replace File
                             </div>
                        </div>
                    ) : (
                        <>
                            <h3 className="font-bold text-slate-900 text-lg mb-2">Tap to Upload</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                PDF, JPG, PNG supported.
                            </p>
                        </>
                    )}
                </div>

                {/* Context Input */}
                <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Context & Situation
                    </h2>
                  </div>
                  <div className="flex-1 p-0 relative">
                      <textarea 
                        className="w-full h-full min-h-[200px] p-6 text-slate-700 focus:outline-none focus:bg-blue-50/10 resize-none transition-colors text-base leading-relaxed placeholder:text-slate-300"
                        placeholder="Tell us what's happening. E.g., 'My landlord is keeping my deposit...'"
                        value={userContext}
                        onChange={(e) => setUserContext(e.target.value)}
                      />
                      
                      <div className="absolute bottom-4 right-4 text-xs font-bold text-slate-300 pointer-events-none group-focus-within:text-blue-400 transition-colors">
                        AI CONTEXT
                      </div>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-8 md:mt-12 flex justify-center animate-slide-up pb-10" style={{ animationDelay: '200ms' }}>
                <button 
                    onClick={startDeepScan}
                    disabled={!uploadedFile || !userContext.trim()}
                    className={`
                        relative overflow-hidden group w-full md:w-auto min-w-0 md:min-w-[300px] px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all duration-300
                        ${(!uploadedFile || !userContext.trim()) 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed transform-none shadow-none' 
                            : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-500 hover:to-blue-700 hover:shadow-blue-500/40 hover:-translate-y-1'}
                    `}
                >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        Initiate Deep Scan
                        {(!(!uploadedFile || !userContext.trim())) && <IconArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                    </span>
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shiny" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP: Processing */}
        {(step === AppStep.ANALYZING || step === AppStep.GENERATING_LETTER) && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
                <LoadingScreen type={step === AppStep.ANALYZING ? 'scan' : 'letter'} />
            </div>
        )}

        {/* STEP: Results Dashboard */}
        {(step === AppStep.RESULTS || step === AppStep.LETTER_READY) && analysisResult && uploadedFile && (
          <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden animate-fade-in relative">
            
            {/* Split Screen - Left: Document */}
            <div className={`
                bg-slate-100 p-4 md:p-8 border-r border-slate-200 flex-col relative
                lg:flex lg:w-1/2 
                ${activeMobileTab === 'document' ? 'flex w-full h-full' : 'hidden'}
            `}>
                <div className="absolute top-4 left-4 md:left-8 z-10">
                     <button onClick={() => setStep(AppStep.UPLOAD)} className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors bg-white/50 p-1.5 rounded backdrop-blur">
                        ← UPLOAD NEW
                     </button>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden border border-slate-300 bg-white shadow-2xl shadow-slate-300/50 mt-8 md:mt-0">
                    <DocumentPreview file={uploadedFile} />
                </div>
            </div>

            {/* Split Screen - Right: Reasoning & Action */}
            <div className={`
                flex-col bg-white overflow-hidden relative
                lg:flex lg:w-1/2 w-full
                ${activeMobileTab === 'analysis' ? 'flex h-full' : 'hidden'}
            `}>
                
                {/* Results Header */}
                <div className="px-4 md:px-8 py-4 md:py-6 border-b border-slate-100 bg-white/95 backdrop-blur z-20 sticky top-0 flex justify-between items-end">
                    <div>
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900">Analysis Report</h2>
                        <div className="flex items-center gap-4 mt-2">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase">Risk Score</span>
                                <span className={`text-lg md:text-xl font-bold ${analysisResult.overallRiskScore > 70 ? 'text-red-600' : analysisResult.overallRiskScore > 40 ? 'text-orange-500' : 'text-green-600'}`}>
                                    {analysisResult.overallRiskScore}
                                </span>
                             </div>
                             <div className="h-1.5 md:h-2 w-24 md:w-32 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ease-out ${analysisResult.overallRiskScore > 70 ? 'bg-red-500' : analysisResult.overallRiskScore > 40 ? 'bg-orange-400' : 'bg-green-500'}`} 
                                    style={{width: `${analysisResult.overallRiskScore}%`}}
                                ></div>
                             </div>
                        </div>
                    </div>
                    
                    {/* Header Action Button (Visible on all screens) */}
                    {step === AppStep.RESULTS && (
                        <button 
                            onClick={handleGenerateLetter}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs md:text-sm font-bold px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <IconDocument className="w-4 h-4" />
                            <span className="hidden md:inline">Draft Letter</span>
                            <span className="md:hidden">Draft</span>
                        </button>
                    )}
                </div>

                {/* Content Container */}
                <div 
                    ref={resultsContainerRef} 
                    className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 pb-32"
                >
                    
                    {step === AppStep.RESULTS ? (
                        <div className="animate-slide-up">
                             {/* Executive Summary */}
                            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
                                <h3 className="text-xs md:text-sm font-bold text-blue-900 uppercase tracking-wider mb-2 md:mb-3">Executive Summary</h3>
                                <p className="text-sm md:text-base text-slate-700 leading-relaxed">{analysisResult.summary}</p>
                            </div>

                            <h3 className="text-base md:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                Identified Issues <span className="bg-slate-100 text-slate-600 text-xs py-0.5 px-2 rounded-full">{analysisResult.redFlags.length}</span>
                            </h3>

                            {/* Cards */}
                            <div className="space-y-4 md:space-y-5">
                                {analysisResult.redFlags.map((flag, idx) => (
                                    <div key={idx} className="group border border-slate-200 rounded-xl p-4 md:p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 bg-white">
                                        <div className="flex flex-col md:flex-row justify-between items-start mb-3 md:mb-4 gap-2 md:gap-0">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg shrink-0 ${flag.severity === 'High' ? 'bg-red-50 text-red-500' : flag.severity === 'Medium' ? 'bg-orange-50 text-orange-500' : 'bg-yellow-50 text-yellow-500'}`}>
                                                    <IconAlert className="w-5 h-5" />
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-base md:text-lg leading-tight mt-1 md:mt-0">{flag.title}</h4>
                                            </div>
                                            <span className={`self-start md:self-auto text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 rounded-full uppercase tracking-wide ml-11 md:ml-0 ${
                                                flag.severity === 'High' ? 'bg-red-100 text-red-700' : 
                                                flag.severity === 'Medium' ? 'bg-orange-100 text-orange-700' : 
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {flag.severity}
                                            </span>
                                        </div>
                                        
                                        <div className="relative pl-4 mb-3 md:mb-4">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 rounded-full group-hover:bg-blue-400 transition-colors"></div>
                                            <p className="text-slate-600 italic font-serif text-xs md:text-sm bg-slate-50 p-2 md:p-3 rounded-r-lg">
                                                "{flag.quote}"
                                            </p>
                                        </div>

                                        <p className="text-slate-700 text-sm leading-relaxed mb-3">
                                            {flag.explanation}
                                        </p>
                                        
                                        {flag.legalPrinciple && (
                                             <div className="flex items-center gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-100">
                                                <IconDocument className="w-4 h-4 text-slate-400" />
                                                <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Principle:</span> 
                                                <span className="text-[10px] md:text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">{flag.legalPrinciple}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in max-w-2xl mx-auto">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h3 className="text-lg md:text-xl font-serif font-bold text-slate-900">Formal Dispute Draft</h3>
                                <button onClick={() => setStep(AppStep.RESULTS)} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                                    Close Preview
                                </button>
                            </div>
                            <div className="bg-white border border-slate-200 shadow-xl rounded-none p-6 md:p-10 min-h-[400px] md:min-h-[600px] font-serif text-slate-900 leading-relaxed whitespace-pre-wrap text-sm md:text-base relative">
                                {/* Paper texture overlay simulation */}
                                <div className="absolute inset-0 bg-orange-50/5 pointer-events-none mix-blend-multiply"></div>
                                {generatedLetter}
                            </div>
                        </div>
                    )}
                </div>

                {/* Floating Action Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-30">
                     <div className="pointer-events-auto flex justify-center">
                        {step === AppStep.RESULTS ? (
                            <button 
                                onClick={handleGenerateLetter}
                                className="group bg-slate-900 hover:bg-blue-900 text-white text-base md:text-lg font-bold py-3 px-6 md:py-4 md:px-8 rounded-full shadow-2xl hover:shadow-blue-900/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 w-full md:w-auto justify-center"
                            >
                                <IconDocument className="w-5 h-5 text-blue-300" />
                                <span className="hidden md:inline">Generate Formal Dispute Letter</span>
                                <span className="md:hidden">Generate Dispute Letter</span>
                                <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <div className="flex gap-4 w-full max-w-lg pb-14 lg:pb-0"> 
                                {/* Added pb-14 on mobile to avoid overlap with tab switcher if present, though tab switcher is usually only for view switching */}
                                <button 
                                    className="flex-1 bg-blue-600 text-white py-3 md:py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30 text-sm md:text-base"
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedLetter);
                                        alert("Letter copied to clipboard!");
                                    }}
                                >
                                    Copy to Clipboard
                                </button>
                            </div>
                        )}
                     </div>
                </div>

            </div>

            {/* Mobile Tab Switcher */}
            <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-slate-900/90 backdrop-blur p-1 rounded-full shadow-2xl border border-slate-700/50">
                <button
                    onClick={() => setActiveMobileTab('analysis')}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeMobileTab === 'analysis' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    <IconShield className="w-4 h-4" />
                    Analysis
                </button>
                <button
                    onClick={() => setActiveMobileTab('document')}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeMobileTab === 'document' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    <IconDocument className="w-4 h-4" />
                    Doc
                </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default App;