import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { SummaryCard as SummaryCardType } from '@/types/dashboard';

interface SummaryCardsProps {
  cards: SummaryCardType[];
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div className="px-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {card.title}
                      </p>
                      <p className="text-2xl font-semibold text-foreground">
                        {card.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-muted/50 ${card.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                  </div>
                  
                  {card.change !== 0 && (
                    <div className="flex items-center mt-4">
                      {card.changeType === 'positive' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(card.change)}%
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">vs last month</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

