'use client';

import { useState } from 'react';
import { 
  ProcessingStep, 
  TranscribeResponse, 
  SummaryResponse, 
  EnhancedSummaryResponse,
  MeetingType 
} from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface ProcessingOptions {
  useEnhanced?: boolean;
  meetingMetadata?: {
    participants?: string[];
    duration?: string;
    type?: MeetingType;
    date?: string;
  };
}

export function useAudioProcessing() {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [enhancedSummary, setEnhancedSummary] = useState<EnhancedSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string>('');
  const [processingInfo, setProcessingInfo] = useState<{
    strategy?: string;
    estimatedSeconds?: number;
  }>({});

  const processAudio = async (file: File, options: ProcessingOptions = { useEnhanced: true }) => {
    try {
      setError(null);
      setSummary(null);
      setEnhancedSummary(null);
      setCurrentStep('uploading');

      // Step 1: Upload audio
      toast.loading('Uploading audio file...', { id: 'upload' });
      const uploadResponse = await apiClient.uploadAudio(file);
      setMeetingId(uploadResponse.meetingId);
      toast.success('Audio uploaded successfully!', { id: 'upload' });

      // Step 2: Transcribe
      setCurrentStep('transcribing');
      toast.loading('Transcribing audio... This may take 2-3 minutes', { id: 'transcribe' });
      const transcribeResponse: TranscribeResponse = await apiClient.transcribeAudio(
        uploadResponse.meetingId,
        uploadResponse.s3Path
      );
      setTranscript(transcribeResponse.transcript);
      toast.success('Transcription complete!', { id: 'transcribe' });

      // Step 3: Generate summary
      setCurrentStep('summarizing');
      
      if (options.useEnhanced) {
        // Get processing estimate first
        try {
          const estimate = await apiClient.estimateProcessingTime(transcribeResponse.transcript);
          setProcessingInfo({
            strategy: estimate.strategy,
            estimatedSeconds: estimate.estimatedSeconds,
          });
          toast.loading(
            `Generating AI summary (${estimate.estimatedDuration})...`, 
            { id: 'summarize' }
          );
        } catch {
          toast.loading('Generating AI summary...', { id: 'summarize' });
        }

        // Generate enhanced hierarchical summary
        const enhancedResponse = await apiClient.generateEnhancedSummary(
          transcribeResponse.transcript,
          {
            ...options.meetingMetadata,
            date: new Date().toLocaleDateString(),
          }
        );
        setEnhancedSummary(enhancedResponse);
        
        // Also set legacy summary for backwards compatibility
        if (enhancedResponse.structure.legacy) {
          setSummary(enhancedResponse.structure.legacy);
        }
        
        toast.success(
          `Summary generated! (${enhancedResponse.structure.metadata.totalSections} sections)`, 
          { id: 'summarize' }
        );
      } else {
        // Use legacy flat summary
        toast.loading('Generating AI summary...', { id: 'summarize' });
        const summaryResponse = await apiClient.generateSummary(transcribeResponse.transcript);
        setSummary(summaryResponse);
        toast.success('Summary generated!', { id: 'summarize' });
      }

      // Complete
      setCurrentStep('complete');
      toast.success('All done! Your meeting notes are ready.', { id: 'complete' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setCurrentStep('error');
      toast.error(`Error: ${errorMessage}`, { id: 'error' });
      console.error('Error processing audio:', err);
    }
  };

  const processTranscript = async (
    transcriptText: string, 
    options: ProcessingOptions = { useEnhanced: true }
  ) => {
    try {
      setError(null);
      setSummary(null);
      setEnhancedSummary(null);
      setTranscript(transcriptText);
      setCurrentStep('summarizing');

      if (options.useEnhanced) {
        // Get processing estimate
        try {
          const estimate = await apiClient.estimateProcessingTime(transcriptText);
          setProcessingInfo({
            strategy: estimate.strategy,
            estimatedSeconds: estimate.estimatedSeconds,
          });
          toast.loading(
            `Generating AI summary (${estimate.estimatedDuration})...`, 
            { id: 'summarize' }
          );
        } catch {
          toast.loading('Generating AI summary...', { id: 'summarize' });
        }

        // Generate enhanced summary
        const enhancedResponse = await apiClient.generateEnhancedSummary(
          transcriptText,
          {
            ...options.meetingMetadata,
            date: new Date().toLocaleDateString(),
          }
        );
        setEnhancedSummary(enhancedResponse);
        
        if (enhancedResponse.structure.legacy) {
          setSummary(enhancedResponse.structure.legacy);
        }
        
        toast.success(
          `Summary generated! (${enhancedResponse.structure.metadata.totalSections} sections)`, 
          { id: 'summarize' }
        );
      } else {
        toast.loading('Generating AI summary...', { id: 'summarize' });
        const summaryResponse = await apiClient.generateSummary(transcriptText);
        setSummary(summaryResponse);
        toast.success('Summary generated!', { id: 'summarize' });
      }

      setCurrentStep('complete');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setCurrentStep('error');
      toast.error(`Error: ${errorMessage}`, { id: 'error' });
    }
  };

  const reset = () => {
    setCurrentStep('idle');
    setTranscript('');
    setSummary(null);
    setEnhancedSummary(null);
    setError(null);
    setMeetingId('');
    setProcessingInfo({});
  };

  return {
    currentStep,
    transcript,
    summary,
    enhancedSummary,
    error,
    meetingId,
    processingInfo,
    processAudio,
    processTranscript,
    reset,
    isProcessing: ['uploading', 'transcribing', 'summarizing'].includes(currentStep),
  };
}
