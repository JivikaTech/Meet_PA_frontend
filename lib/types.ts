export interface UploadResponse {
  meetingId: string;
  s3Path: string;
  s3Uri: string;
}

export interface TranscribeResponse {
  transcript: string;
  meetingId: string;
}

export interface SummaryResponse {
  tldr: string;
  key_points: string[];
  decisions: string[];
  action_items: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type ProcessingStep = 'idle' | 'uploading' | 'transcribing' | 'summarizing' | 'complete' | 'error';
