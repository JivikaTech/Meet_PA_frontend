'use client';

import { ProcessingStep } from '@/lib/types';
import { Loader2, Upload, FileText, Sparkles, CheckCircle } from 'lucide-react';

interface LoadingStatesProps {
  step: ProcessingStep;
}

export default function LoadingStates({ step }: LoadingStatesProps) {
  const steps = [
    { id: 'uploading', label: 'Uploading audio...', icon: Upload },
    { id: 'transcribing', label: 'Transcribing (this may take 2-3 min)...', icon: FileText },
    { id: 'summarizing', label: 'Generating AI summary...', icon: Sparkles },
    { id: 'complete', label: 'Complete!', icon: CheckCircle },
  ];

  const getCurrentStepIndex = () => {
    const stepMap: { [key in ProcessingStep]: number } = {
      idle: -1,
      uploading: 0,
      transcribing: 1,
      summarizing: 2,
      complete: 3,
      error: -1,
    };
    return stepMap[step];
  };

  const currentIndex = getCurrentStepIndex();

  if (step === 'idle' || step === 'error') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon;
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div key={stepItem.id} className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? 'bg-green-500'
                      : isActive
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}
                >
                  {isActive ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Icon
                      className={`w-6 h-6 ${
                        isCompleted || isActive ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={`text-lg font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {stepItem.label}
                  </p>
                  {isActive && index === 1 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Please be patient while we process your audio...
                    </p>
                  )}
                </div>

                {isCompleted && (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
              <div
                style={{
                  width: `${((currentIndex + 1) / steps.length) * 100}%`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
