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

export function AIInsights({ insights }: AIInsightsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="w-5 h-5 text-foreground" />
        <h2 className="text-xl font-bold text-foreground">Insights</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="bg-accent border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ChartIcon className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground text-sm">Overview</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{insights.overview}</p>
        </div>
        <div className="bg-accent border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <LightbulbIcon className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground text-sm">Key Insight</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{insights.insight}</p>
        </div>
        <div className="bg-accent border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TargetIcon className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground text-sm">Recommendation</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{insights.recommendation}</p>
        </div>
      </div>
    </motion.div>
  );
}
