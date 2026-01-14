'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { parseCSV, parsePDF, formatCurrency } from '@/lib/parsers';
import { analyzeTransactions, Analysis } from '@/lib/analyzer';

// Minimalist Icon Components
const ChartIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const FolderIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

const ReceiptIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const SparklesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const LockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const LightbulbIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

const TargetIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Animated counter component
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [count, value, duration]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => setDisplayValue(latest));
    return unsubscribe;
  }, [rounded]);

  return <span>{formatCurrency(displayValue)}</span>;
}

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{overview: string; insight: string; recommendation: string} | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string>('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleFile = (uploadedFile: File) => {
    setError('');
    const fileType = uploadedFile.type;
    const fileName = uploadedFile.name.toLowerCase();

    if (
      fileType === 'text/csv' ||
      fileType === 'application/pdf' ||
      fileName.endsWith('.csv') ||
      fileName.endsWith('.pdf')
    ) {
      setFile(uploadedFile);
      setAnalysis(null);
      setAiExplanation(null);
    } else {
      setError('Please upload a CSV or PDF file');
    }
  };

  const analyzeFile = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError('');
    setShowBreakdown(false);
    setExpandedCategories(new Set());

    try {
      let transactions;
      if (file.name.toLowerCase().endsWith('.csv')) {
        transactions = await parseCSV(file);
      } else {
        transactions = await parsePDF(file);
      }

      const result = analyzeTransactions(transactions);
      setAnalysis(result);

      // Show breakdown after counter animation (2.5 seconds)
      setTimeout(() => {
        setShowBreakdown(true);
      }, 2500);

      setIsLoadingAI(true);
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: result }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        // Don't throw - just skip AI insights
      } else {
        const data = await response.json();
        console.log('AI response:', data);
        if (data.insights) {
          setAiExplanation(data.insights);
        }
      }
      setIsLoadingAI(false);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze file');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setAnalysis(null);
    setAiExplanation(null);
    setIsLoadingAI(false);
    setError('');
    setShowBreakdown(false);
  };

  // Results View
  if (analysis) {
    return (
      <div className="min-h-screen bg-white bg-dots">
        <div className="mx-auto max-w-2xl px-6 py-12">
          {/* Header */}
          <div className="mb-10">
            <button
              onClick={resetAnalysis}
              className="mb-6 text-gray-500 hover:text-gray-900 text-sm font-medium flex items-center gap-2 transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Back to upload</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Financial Overview
                </h1>
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {file?.name}
                </p>
              </div>
              <div className="hidden sm:block">
                <ChartIcon className="w-10 h-10 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Main Stats Grid - Total + Quick Stats side by side */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Animated Total */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gray-900 rounded-2xl p-8 text-center shadow-xl border border-gray-800 h-full flex flex-col justify-center">
                <p className="text-gray-400 text-xs mb-2 uppercase tracking-widest">Total Spent</p>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  <AnimatedCounter value={analysis.totalSpent} duration={2} />
                </h2>
                <p className="text-gray-500 text-xs">this statement period</p>
              </div>
            </motion.div>

            {/* Quick Stats */}
            {showBreakdown && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="grid grid-cols-1 gap-3"
              >
                <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <FolderIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Categories</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{analysis.categorySpending.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <ReceiptIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Transactions</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {analysis.categorySpending.reduce((sum, cat) => sum + cat.transactions.length, 0)}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* AI Insights - Compact horizontal layout */}
          {showBreakdown && (aiExplanation || isLoadingAI) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-gray-900" />
                <h2 className="text-xl font-bold text-black">Insights</h2>
              </div>
              
              {isLoadingAI ? (
                <div className="grid md:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : aiExplanation && (
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ChartIcon className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900 text-sm">Overview</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{aiExplanation.overview}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <LightbulbIcon className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900 text-sm">Key Insight</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{aiExplanation.insight}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TargetIcon className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900 text-sm">Recommendation</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{aiExplanation.recommendation}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Breakdown - Shows after counter animation */}
          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mb-12"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FolderIcon className="w-5 h-5 text-gray-900" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Spending by Category
                  </h2>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  {analysis.categorySpending.map((cat, idx) => {
                    const isExpanded = expandedCategories.has(cat.category);
                    const categoryColors = [
                      'bg-gray-900',
                      'bg-gray-700',
                      'bg-gray-500',
                      'bg-gray-600',
                      'bg-gray-800',
                      'bg-gray-400',
                      'bg-gray-500',
                      'bg-gray-700',
                    ];
                    const colorClass = categoryColors[idx % categoryColors.length];
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + idx * 0.05, duration: 0.3 }}
                        className={idx !== 0 ? 'border-t border-gray-100' : ''}
                      >
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedCategories);
                            if (isExpanded) {
                              newExpanded.delete(cat.category);
                            } else {
                              newExpanded.add(cat.category);
                            }
                            setExpandedCategories(newExpanded);
                          }}
                          className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                              <span className="text-gray-900 font-medium">{cat.category}</span>
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {cat.transactions.length}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">
                                {formatCurrency(cat.total)}
                              </span>
                              <svg 
                                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor" 
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${cat.percentage}%` }}
                                transition={{ delay: 0.7 + idx * 0.05, duration: 0.6, ease: "easeOut" }}
                                className={`h-full ${colorClass} rounded-full`}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-500 w-14 text-right">
                              {cat.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </button>

                        {/* Expandable transaction list */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-4 pb-4"
                          >
                            <div className="bg-gray-50 rounded-xl p-3 space-y-1 max-h-64 overflow-y-auto">
                              {cat.transactions.map((transaction, txIdx) => (
                                <div
                                  key={txIdx}
                                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-gray-200"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-gray-800 text-sm font-medium truncate">{transaction.description}</p>
                                    <p className="text-xs text-gray-400">{transaction.date}</p>
                                  </div>
                                  <p className="text-sm font-semibold text-gray-900 ml-3">
                                    {formatCurrency(transaction.amount)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-center pt-10 mt-8 border-t border-gray-200"
          >
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <LockIcon className="w-4 h-4" />
                <p className="text-sm font-medium">
                  Your files are analyzed locally and immediately discarded. Nothing is stored.
                </p>
              </div>
            </div>

            <button
              onClick={resetAnalysis}
              className="mb-8 bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Analyze Another Statement
            </button>

            {/* Footer Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <Link href="/faq" className="text-gray-500 hover:text-gray-900 transition-colors">
                FAQ
              </Link>
              <Link href="/changelog" className="text-gray-500 hover:text-gray-900 transition-colors">
                Changelog
              </Link>
              <Link href="/refer" className="text-gray-500 hover:text-gray-900 transition-colors">
                Refer & Earn
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-gray-900 transition-colors">
                Contact
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Upload View
  return (
    <div className="min-h-screen bg-white bg-dots">
      <div className="mx-auto max-w-3xl px-6 py-20">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-black mb-4">
            just save
          </h1>
          <p className="text-gray-600 text-xl">
            Find and cancel forgotten subscriptions
          </p>
        </div>

        {/* GitHub Star */}
        <a
          href="https://github.com/tommyc10/just-save"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 mb-12 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-900"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">Star on GitHub</span>
        </a>

        {/* Error */}
        {error && (
          <div className="mb-8 border border-red-200 rounded-lg p-4 bg-red-50 text-red-700 text-center text-sm">
            {error}
          </div>
        )}

        {/* Upload Box */}
        <div className="border border-gray-200 rounded-2xl mb-8 overflow-hidden">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-16 text-center transition-all ${
              isDragging ? 'bg-gray-50' : 'hover:bg-gray-50'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".csv,.pdf"
              onChange={handleFileInput}
              className="hidden"
            />

            {!file ? (
              <label htmlFor="file-upload" className="cursor-pointer block">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  Drop your bank statement here
                </p>
                <p className="text-gray-500 text-sm">
                  CSV or PDF · Supports most banks · Under 90 seconds
                </p>
              </label>
            ) : (
              <div>
                <p className="text-xl font-semibold text-gray-900 mb-2">{file.name}</p>
                <p className="text-gray-500 mb-4 text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-500 hover:text-gray-900 font-medium text-sm"
                >
                  Choose different file
                </button>
              </div>
            )}
          </div>

          {file && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <button
                onClick={analyzeFile}
                disabled={isAnalyzing}
                className="w-full bg-gray-900 text-white font-semibold py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze My Spending'}
              </button>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
          <LockIcon className="w-4 h-4" />
          <p>Your files are analyzed locally and immediately discarded.</p>
        </div>

        {/* Social Proof Section */}
        <div className="mt-24 pt-12 border-t border-gray-200">
          <h3 className="text-center text-xl font-semibold text-gray-900 mb-8">
            What users are saving
          </h3>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src="/bobafett.png" alt="Boba Fett" className="w-10 h-10 rounded-full object-cover" />
                <span className="font-medium text-gray-900">@bobafett</span>
              </div>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                "Found subscriptions I forgot about. Simple and effective."
              </p>
              <p className="text-2xl font-bold text-gray-900">$240<span className="text-sm font-normal text-gray-500">/yr</span></p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src="/DinDjarin.png" alt="Din Djarin" className="w-10 h-10 rounded-full object-cover" />
                <span className="font-medium text-gray-900">@themandalorian</span>
              </div>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                "Fast, private, and found charges I missed. Highly recommend."
              </p>
              <p className="text-2xl font-bold text-gray-900">$180<span className="text-sm font-normal text-gray-500">/yr</span></p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src="/cadbane.png" alt="Cad Bane" className="w-10 h-10 rounded-full object-cover" />
                <span className="font-medium text-gray-900">@cadbane</span>
              </div>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                "Clean interface, no data stored. Exactly what I needed."
              </p>
              <p className="text-2xl font-bold text-gray-900">$420<span className="text-sm font-normal text-gray-500">/yr</span></p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-900 transition-colors">
              Terms
            </Link>
            <Link href="/faq" className="text-gray-500 hover:text-gray-900 transition-colors">
              FAQ
            </Link>
            <Link href="/changelog" className="text-gray-500 hover:text-gray-900 transition-colors">
              Changelog
            </Link>
            <Link href="/refer" className="text-gray-500 hover:text-gray-900 transition-colors">
              Refer & Earn
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
