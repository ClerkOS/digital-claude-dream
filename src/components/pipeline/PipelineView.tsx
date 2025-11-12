import { motion } from 'framer-motion';
import type { PipelineStep } from '@/types/pipeline';
import { PipelineStepCard } from './PipelineStepCard';
import { PIPELINE_STEP_CONFIG } from '@/constants/pipeline';

interface PipelineViewProps {
  steps: PipelineStep[];
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
}

export function PipelineView({ steps, currentStepIndex, onStepClick }: PipelineViewProps) {
  return (
    <div className="w-full bg-background">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Data Pipeline
          </h2>
          <p className="text-sm text-muted-foreground">
            Processing your files step by step
          </p>
        </motion.div>

        <div className="overflow-x-auto pb-6 -mx-2 px-2">
          <div className="flex items-start gap-4 min-w-max">
            {steps.map((step, index) => {
              const config = PIPELINE_STEP_CONFIG[step.id as keyof typeof PIPELINE_STEP_CONFIG];
              const isActive = index === currentStepIndex;
              const isLast = index === steps.length - 1;
              const IconComponent = config?.icon || step.icon;

              return (
                <PipelineStepCard
                  key={step.id}
                  title={config?.title || step.title}
                  description={step.description || config?.description || ''}
                  status={step.status}
                  details={step.details}
                  icon={IconComponent}
                  isActive={isActive}
                  onClick={() => onStepClick?.(index)}
                  isLast={isLast}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

