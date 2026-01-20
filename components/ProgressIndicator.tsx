'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type AnalysisStep = 'idle' | 'uploading' | 'parsing' | 'analyzing' | 'complete';

interface ProgressIndicatorProps {
  currentStep: AnalysisStep;
}

const steps: { id: AnalysisStep; label: string; activeLabel: string }[] = [
  { id: 'uploading', label: 'Upload', activeLabel: 'Uploading...' },
  { id: 'parsing', label: 'Parse', activeLabel: 'Parsing statement...' },
  { id: 'analyzing', label: 'Analyze', activeLabel: 'Analyzing spending...' },
  { id: 'complete', label: 'Complete', activeLabel: 'Done!' },
];

const stepOrder: AnalysisStep[] = ['idle', 'uploading', 'parsing', 'analyzing', 'complete'];

function getStepIndex(step: AnalysisStep): number {
  return stepOrder.indexOf(step);
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const currentIndex = getStepIndex(currentStep);
  const progress = currentStep === 'idle' ? 0 : ((currentIndex - 1) / (steps.length - 1)) * 100;

  const activeStep = steps.find((s) => s.id === currentStep);
  const statusMessage = activeStep?.activeLabel || 'Starting...';

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Step indicators */}
      <div className="relative flex justify-between mb-6">
        {/* Background track */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border rounded-full" />

        {/* Animated progress bar */}
        <motion.div
          className="absolute top-4 left-0 h-0.5 bg-positive rounded-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ width: '100%' }}
        />

        {/* Step circles */}
        {steps.map((step) => {
          const stepIndex = getStepIndex(step.id);
          const isActive = currentIndex >= stepIndex;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isActive
                    ? 'bg-positive border-positive'
                    : 'bg-card border-border'
                )}
                animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.6, repeat: isCurrent ? Infinity : 0, repeatDelay: 0.4 }}
              >
                {isActive ? (
                  <CheckIcon className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    {stepOrder.indexOf(step.id)}
                  </span>
                )}
              </motion.div>
              <span
                className={cn(
                  'mt-2.5 text-xs font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status message */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-sm text-muted-foreground font-medium">{statusMessage}</p>
      </motion.div>

      {/* Animated loading dots */}
      {currentStep !== 'idle' && currentStep !== 'complete' && (
        <div className="flex justify-center gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-positive"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
