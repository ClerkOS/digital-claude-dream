import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

export type PipelineStep = 'understanding' | 'detecting' | 'applying' | 'complete';

interface PipelineStepData {
  label: string;
  status: 'pending' | 'active' | 'complete';
  count?: number;
  countLabel?: string;
}

interface DataPipelineProgressProps {
  currentStep: PipelineStep;
  sheetsCount?: number;
  patternsCount?: number;
  rulesCount?: number;
}

export function DataPipelineProgress({ 
  currentStep, 
  sheetsCount, 
  patternsCount, 
  rulesCount 
}: DataPipelineProgressProps) {
  const steps: PipelineStepData[] = [
    {
      label: 'Understanding sheets',
      status: currentStep === 'understanding' ? 'active' : 
              currentStep === 'detecting' || currentStep === 'applying' || currentStep === 'complete' ? 'complete' : 'pending',
      count: sheetsCount,
      countLabel: sheetsCount !== undefined ? `${sheetsCount} sheet${sheetsCount !== 1 ? 's' : ''} detected` : undefined
    },
    {
      label: 'Detect patterns',
      status: currentStep === 'detecting' ? 'active' : 
              currentStep === 'applying' || currentStep === 'complete' ? 'complete' : 'pending',
      count: patternsCount,
      countLabel: patternsCount !== undefined ? `${patternsCount} pattern${patternsCount !== 1 ? 's' : ''} detected` : undefined
    },
    {
      label: 'Applying rules',
      status: currentStep === 'applying' ? 'active' : 
              currentStep === 'complete' ? 'complete' : 'pending',
      count: rulesCount,
      countLabel: rulesCount !== undefined ? `${rulesCount} rule${rulesCount !== 1 ? 's' : ''} applied` : undefined
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div className="w-full max-w-md space-y-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4"
          >
            {/* Step indicator */}
            <div className="flex-shrink-0 mt-1">
              {step.status === 'complete' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </motion.div>
              )}
              {step.status === 'active' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <Loader2 className="w-5 h-5 text-primary" />
                </motion.div>
              )}
              {step.status === 'pending' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Circle className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0">
              <motion.div
                className={`text-sm font-medium mb-1 ${
                  step.status === 'active' ? 'text-foreground' : 
                  step.status === 'complete' ? 'text-foreground' : 
                  'text-muted-foreground'
                }`}
              >
                {step.label}
              </motion.div>
              
              <AnimatePresence mode="wait">
                {step.countLabel && (
                  <motion.div
                    key={step.countLabel}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs text-muted-foreground"
                  >
                    {step.countLabel}
                  </motion.div>
                )}
                {!step.countLabel && step.status === 'active' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground"
                  >
                    Processing...
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress bar for active step */}
              {step.status === 'active' && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="mt-2 h-0.5 bg-primary/20 rounded-full overflow-hidden"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-full bg-primary"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

