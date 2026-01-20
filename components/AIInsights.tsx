'use client';

import { motion } from 'framer-motion';
import { SparklesIcon, ChartIcon, LightbulbIcon, TargetIcon } from './Icons';

interface AIInsightsProps {
  insights: {
    overview: string;
    insight: string;
    recommendation: string;
  };
}

const insightCards = [
  {
    key: 'overview',
    title: 'Overview',
    icon: ChartIcon,
    gradient: 'from-blue-500/10 to-purple-500/10',
    borderColor: 'border-blue-500/20',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    key: 'insight',
    title: 'Key Insight',
    icon: LightbulbIcon,
    gradient: 'from-amber-500/10 to-orange-500/10',
    borderColor: 'border-amber-500/20',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
  {
    key: 'recommendation',
    title: 'Recommendation',
    icon: TargetIcon,
    gradient: 'from-emerald-500/10 to-teal-500/10',
    borderColor: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
] as const;

export function AIInsights({ insights }: AIInsightsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="mb-12"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gold-muted flex items-center justify-center">
          <SparklesIcon className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-foreground">AI Insights</h2>
          <p className="text-sm text-muted-foreground">Powered by Claude</p>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {insightCards.map((card, index) => {
          const Icon = card.icon;
          const content = insights[card.key];

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              className={`relative overflow-hidden bg-card border ${card.borderColor} rounded-2xl p-5 stat-glow`}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`} />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${card.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{card.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{content}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
