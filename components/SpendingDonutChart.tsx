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

// Premium grayscale palette that works in both modes
const CHART_COLORS = [
  '#1a1a1a', // near black
  '#374151', // gray-700
  '#4b5563', // gray-600
  '#6b7280', // gray-500
  '#9ca3af', // gray-400
  '#d1d5db', // gray-300
  '#e5e7eb', // gray-200
  '#f3f4f6', // gray-100
];

const DARK_CHART_COLORS = [
  '#fafafa', // near white
  '#d1d5db', // gray-300
  '#9ca3af', // gray-400
  '#6b7280', // gray-500
  '#4b5563', // gray-600
  '#374151', // gray-700
  '#1f2937', // gray-800
  '#111827', // gray-900
];

export function SpendingDonutChart({ categories, totalSpent }: SpendingDonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const activeIndex = hoveredIndex ?? selectedIndex;
  const activeCategory = activeIndex !== null ? categories[activeIndex] : null;

  // Check if dark mode (we'll use CSS to handle this)
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const colors = isDark ? DARK_CHART_COLORS : CHART_COLORS;

  // SVG parameters
  const size = 220;
  const strokeWidth = 40;
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
      color: colors[index % colors.length],
      dashArray,
      dashOffset,
    };
  });

  return (
    <div className="flex flex-col items-center">
      {/* Chart */}
      <div className="relative">
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
                strokeWidth: activeIndex === index ? strokeWidth + 10 : strokeWidth,
                opacity: activeIndex !== null && activeIndex !== index ? 0.3 : 1,
              }}
              transition={{
                strokeDasharray: { duration: 1.2, delay: index * 0.08, ease: 'easeOut' },
                strokeWidth: { duration: 0.2 },
                opacity: { duration: 0.2 },
              }}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
              style={{ transformOrigin: 'center' }}
            />
          ))}
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeCategory ? (
              <motion.div
                key={activeCategory.category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="text-center px-4"
              >
                <p className="text-xs text-muted-foreground mb-1 truncate max-w-[120px]">
                  {activeCategory.category}
                </p>
                <p className="font-mono text-xl font-bold text-foreground">
                  {formatCurrency(activeCategory.total)}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
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
                <p className="font-mono text-xl font-bold text-foreground">
                  {formatCurrency(totalSpent)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 max-w-md">
        {arcs.slice(0, 6).map((arc) => (
          <button
            key={arc.category}
            className={cn(
              'flex items-center gap-2.5 text-left transition-all duration-200 group',
              activeIndex !== null && activeIndex !== arc.index ? 'opacity-30' : 'opacity-100'
            )}
            onMouseEnter={() => setHoveredIndex(arc.index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => setSelectedIndex(selectedIndex === arc.index ? null : arc.index)}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
              style={{ backgroundColor: arc.color }}
            />
            <span className="text-sm text-muted-foreground truncate group-hover:text-foreground transition-colors">
              {arc.category}
            </span>
          </button>
        ))}
      </div>

      {/* Show more indicator */}
      {categories.length > 6 && (
        <p className="mt-4 text-xs text-muted-foreground">
          +{categories.length - 6} more categories
        </p>
      )}
    </div>
  );
}
