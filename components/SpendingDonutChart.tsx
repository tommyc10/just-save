'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/parsers';
import { CategorySpending } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SpendingDonutChartProps {
  categories: CategorySpending[];
  totalSpent: number;
}

// Colors that work in both light and dark mode
const CHART_COLORS = [
  '#171717', // gray-900
  '#404040', // gray-700
  '#525252', // gray-600
  '#737373', // gray-500
  '#a3a3a3', // gray-400
  '#d4d4d4', // gray-300
  '#e5e5e5', // gray-200
  '#f5f5f5', // gray-100
];

export function SpendingDonutChart({ categories, totalSpent }: SpendingDonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const activeIndex = hoveredIndex ?? selectedIndex;
  const activeCategory = activeIndex !== null ? categories[activeIndex] : null;

  // Calculate SVG arc paths
  const size = 200;
  const strokeWidth = 35;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativePercent = 0;
  const arcs = categories.map((cat, index) => {
    const percent = cat.percentage / 100;
    const dashArray = `${percent * circumference} ${circumference}`;
    const dashOffset = -cumulativePercent * circumference;
    cumulativePercent += percent;

    return {
      ...cat,
      index,
      color: CHART_COLORS[index % CHART_COLORS.length],
      dashArray,
      dashOffset,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* SVG Donut Chart */}
        <svg width={size} height={size} className="transform -rotate-90">
          {arcs.map((arc, index) => (
            <motion.circle
              key={arc.category}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
              strokeLinecap="butt"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{
                strokeDasharray: arc.dashArray,
                strokeWidth: activeIndex === index ? strokeWidth + 8 : strokeWidth,
                opacity: activeIndex !== null && activeIndex !== index ? 0.4 : 1,
              }}
              transition={{
                strokeDasharray: { duration: 1, delay: index * 0.1, ease: 'easeOut' },
                strokeWidth: { duration: 0.2 },
                opacity: { duration: 0.2 },
              }}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
              style={{ transformOrigin: 'center' }}
            />
          ))}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeCategory ? (
              <motion.div
                key={activeCategory.category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <p className="text-xs text-muted-foreground mb-1 truncate max-w-[100px]">
                  {activeCategory.category}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(activeCategory.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeCategory.percentage.toFixed(1)}%
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="total"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(totalSpent)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 max-w-xs">
        {arcs.slice(0, 6).map((arc) => (
          <button
            key={arc.category}
            className={cn(
              'flex items-center gap-2 text-left transition-opacity',
              activeIndex !== null && activeIndex !== arc.index ? 'opacity-40' : 'opacity-100'
            )}
            onMouseEnter={() => setHoveredIndex(arc.index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => setSelectedIndex(selectedIndex === arc.index ? null : arc.index)}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: arc.color }}
            />
            <span className="text-xs text-muted-foreground truncate">
              {arc.category}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
