export interface RedFlag {
  title: string;
  quote: string;
  explanation: string;
  severity: 'High' | 'Medium' | 'Low';
  legalPrinciple?: string;
}

export interface AnalysisResult {
  summary: string;
  redFlags: RedFlag[];
  overallRiskScore: number; // 0 to 100
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  GENERATING_LETTER = 'GENERATING_LETTER',
  LETTER_READY = 'LETTER_READY',
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}
