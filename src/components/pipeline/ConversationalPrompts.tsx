import { motion, AnimatePresence } from 'framer-motion';
import type { PipelineConversation } from '@/types/pipeline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ConversationalPromptsProps {
  conversation: PipelineConversation | null;
  onChoice: (choiceId: string, action: string) => void;
}

export function ConversationalPrompts({ conversation, onChoice }: ConversationalPromptsProps) {
  if (!conversation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-8 mb-6"
    >
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          {/* Zigma Message */}
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-background text-sm font-semibold">Z</span>
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-foreground text-sm leading-relaxed">
                  {conversation.message}
                </p>
              </div>
            </div>
          </div>

          {/* Choices */}
          {conversation.choices && conversation.choices.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
              {conversation.choices.map((choice, index) => (
                <Button
                  key={choice.id}
                  variant={index === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChoice(choice.id, choice.action)}
                  className={`
                    h-8 px-4 text-xs font-medium
                    ${index === 0
                      ? 'bg-primary hover:bg-primary/90'
                      : 'hover:bg-primary/5 hover:border-primary/30'
                    }
                  `}
                >
                  {choice.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

