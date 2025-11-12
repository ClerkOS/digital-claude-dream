import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';
import type { PipelineStepStatus } from '@/types/pipeline';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface PipelineStepCardProps {
  title: string;
  description: string;
  status: PipelineStepStatus;
  details?: string;
  icon?: LucideIcon | string;
  isActive: boolean;
  onClick?: () => void;
  isLast?: boolean;
}

export function PipelineStepCard({
  title,
  description,
  status,
  details,
  icon: IconComponent,
  isActive,
  onClick,
  isLast = false,
}: PipelineStepCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        );
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground/40" />;
    }
  };

  const isComplete = status === 'complete';
  const isPending = status === 'pending';

  return (
    <div className="flex items-start">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col min-w-[220px]"
      >
        <Card
          className={`
            border-0 shadow-sm cursor-pointer transition-all duration-200
            ${isActive && status === 'in_progress'
              ? 'shadow-md ring-1 ring-primary/20'
              : isComplete
              ? 'bg-muted/30'
              : isPending
              ? 'opacity-60'
              : ''
            }
            hover:shadow-md
          `}
          onClick={onClick}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`
                p-2 rounded-lg
                ${isActive && status === 'in_progress'
                  ? 'bg-primary/10'
                  : isComplete
                  ? 'bg-green-50'
                  : 'bg-muted/50'
                }
              `}>
                {typeof IconComponent === 'function' ? (
                  <IconComponent className={`
                    w-4 h-4
                    ${isActive && status === 'in_progress'
                      ? 'text-primary'
                      : isComplete
                      ? 'text-green-600'
                      : 'text-muted-foreground'
                    }
                  `} />
                ) : (
                  <div className="w-4 h-4" />
                )}
              </div>
              {getStatusIcon()}
            </div>

            <h3 className={`
              font-semibold text-sm mb-1.5
              ${isPending ? 'text-muted-foreground' : 'text-foreground'}
            `}>
              {title}
            </h3>

            <p className={`
              text-xs mb-2
              ${isPending ? 'text-muted-foreground/70' : 'text-muted-foreground'}
            `}>
              {description}
            </p>

            {details && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
                className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50"
              >
                {details}
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Connector Line */}
      {!isLast && (
        <div className="flex items-center px-3 pt-5">
          <div className="relative w-12 h-px">
            <div className="absolute inset-0 bg-border" />
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: isComplete ? '100%' : '0%',
              }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="absolute left-0 top-0 h-full bg-primary/60"
            />
            {isComplete && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -right-1 -top-1 w-2 h-2 bg-primary rounded-full"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

