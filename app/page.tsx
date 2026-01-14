'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { parseCSV, parsePDF, formatCurrency } from '@/lib/parsers';
import { analyzeTransactions, Analysis } from '@/lib/analyzer';

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
                <span className="text-4xl">📊</span>
              </div>
            </div>
          </div>

          {/* Animated Total - Always shows first */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-center shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
              <div className="relative">
                <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Total Spent</p>
                <h2 className="text-5xl sm:text-6xl font-bold text-white mb-2">
                  <AnimatedCounter value={analysis.totalSpent} duration={2} />
                </h2>
                <p className="text-gray-500 text-sm">this statement period</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Row */}
          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="grid grid-cols-3 gap-3 mb-10"
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{analysis.categorySpending.length}</p>
                <p className="text-xs text-gray-500">Categories</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{analysis.subscriptions.length}</p>
                <p className="text-xs text-gray-500">Subscriptions</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(analysis.subscriptions.reduce((sum, sub) => sum + sub.amount * 12, 0))}
                </p>
                <p className="text-xs text-gray-500">Yearly Subs</p>
              </div>
            </motion.div>
          )}

          {/* Breakdown - Shows after counter animation */}
          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* AI Insights */}
              {(aiExplanation || isLoadingAI) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="mb-16"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl">✨</span>
                    <h2 className="text-3xl font-bold text-black">AI Insights</h2>
                  </div>
                  
                  {isLoadingAI ? (
                    <div className="grid gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-xl"></div>
                            <div className="h-5 bg-gray-300 rounded w-32"></div>
                          </div>
                          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : aiExplanation && (
                    <div className="grid gap-4">
                      {/* Overview Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                            <span className="text-white text-lg">📊</span>
                          </div>
                          <h3 className="font-semibold text-blue-900 text-lg">Spending Overview</h3>
                        </div>
                        <p className="text-blue-800 leading-relaxed">{aiExplanation.overview}</p>
                      </div>

                      {/* Insight Card */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                            <span className="text-white text-lg">💡</span>
                          </div>
                          <h3 className="font-semibold text-purple-900 text-lg">Key Insight</h3>
                        </div>
                        <p className="text-purple-800 leading-relaxed">{aiExplanation.insight}</p>
                      </div>

                      {/* Recommendation Card */}
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                            <span className="text-white text-lg">🎯</span>
                          </div>
                          <h3 className="font-semibold text-emerald-900 text-lg">Money-Saving Tip</h3>
                        </div>
                        <p className="text-emerald-800 leading-relaxed">{aiExplanation.recommendation}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}


              {/* Subscriptions */}
              {analysis.subscriptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mb-12"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔄</span>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Recurring Subscriptions
                      </h2>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-full px-3 py-1">
                      <p className="text-sm font-semibold text-red-600">
                        {formatCurrency(analysis.subscriptions.reduce((sum, sub) => sum + sub.amount, 0))}
                        <span className="text-xs font-normal text-red-500">/mo</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    {analysis.subscriptions.map((sub, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.05, duration: 0.3 }}
                        className={`p-4 flex items-center justify-between hover:bg-red-50 transition-colors group ${idx !== 0 ? 'border-t border-gray-100' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-red-50 border border-red-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-lg">💳</span>
                          </div>
                          <div>
                            <p className="text-gray-900 font-medium capitalize">{sub.name}</p>
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                              {sub.frequency}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {formatCurrency(sub.amount)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatCurrency(sub.amount * 12)}/yr
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-3">
                    💡 Tip: Review these subscriptions to see if you still need them all
                  </p>
                </motion.div>
              )}

              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mb-12"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📁</span>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Spending by Category
                  </h2>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  {analysis.categorySpending.map((cat, idx) => {
                    const isExpanded = expandedCategories.has(cat.category);
                    const categoryColors = [
                      'from-blue-500 to-blue-600',
                      'from-purple-500 to-purple-600',
                      'from-emerald-500 to-emerald-600',
                      'from-amber-500 to-amber-600',
                      'from-red-500 to-red-600',
                      'from-indigo-500 to-indigo-600',
                      'from-pink-500 to-pink-600',
                      'from-teal-500 to-teal-600',
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
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colorClass}`}></div>
                              <span className="text-gray-900 font-medium">{cat.category}</span>
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {cat.transactions.length} txns
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">
                                {formatCurrency(cat.total)}
                              </span>
                              <span className={`text-gray-400 text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                ▼
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${cat.percentage}%` }}
                                transition={{ delay: 0.7 + idx * 0.05, duration: 0.6, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r ${colorClass} rounded-full`}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600 w-14 text-right">
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
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <span className="text-lg">🔒</span>
                <p className="text-sm font-medium">
                  Your files are analyzed locally and immediately discarded. Nothing is stored.
                </p>
              </div>
            </div>

            <button
              onClick={resetAnalysis}
              className="mb-8 bg-black text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Analyze Another Statement →
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
          <p className="text-red-600 text-xl">
            Find and cancel forgotten subscriptions
          </p>
        </div>

        {/* GitHub Star */}
        <a
          href="https://github.com/tommyc10/just-save"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 mb-12 px-4 py-2 border-2 border-dashed border-red-300 rounded-full hover:bg-red-50 transition-colors"
        >
          <svg
            className="w-5 h-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-semibold text-red-600">just save</span>
        </a>

        {/* Error */}
        {error && (
          <div className="mb-8 border-2 border-dashed border-red-400 rounded-lg p-4 bg-red-50 text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Upload Box */}
        <div className="border-2 border-dashed border-red-300 rounded-lg mb-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-16 text-center transition-all ${
              isDragging ? 'bg-red-50 border-red-400' : 'hover:bg-gray-50'
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
                <p className="text-2xl font-bold text-black mb-2">
                  Drop your monthly bank statement
                </p>
                <p className="text-red-600 mb-1">
                  CSV or PDF • Supports UK & US banks • Takes under 90 seconds
                </p>
              </label>
            ) : (
              <div>
                <p className="text-2xl font-bold text-black mb-2">{file.name}</p>
                <p className="text-red-600 mb-4">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-600 hover:text-red-700 font-semibold text-sm"
                >
                  Choose different file
                </button>
              </div>
            )}
          </div>

          {file && (
            <div className="border-t-2 border-dashed border-red-300 p-6 bg-gray-50">
              <button
                onClick={analyzeFile}
                disabled={isAnalyzing}
                className="w-full bg-black text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze My Spending →'}
              </button>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <p className="text-center text-red-600 text-sm">
          Your files are analyzed and immediately discarded. Nothing is stored.
        </p>

        {/* Social Proof Section */}
        <div className="mt-24 pt-12 border-t-2 border-dashed border-red-200">
          <h3 className="text-center text-2xl font-bold text-black mb-8">
            Savings from our users
          </h3>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="border-2 border-dashed border-red-300 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <img src="/bobafett.png" alt="Boba Fett" className="w-10 h-10 rounded-full object-cover" />
                <span className="font-semibold text-red-600">@bobafett</span>
              </div>
              <p className="text-gray-700 mb-4 text-sm">
                "This tool's worth every credit. Found subscriptions I forgot about like they were dodging Imperial entanglements."
              </p>
              <p className="text-xl font-black text-black">$240/yr</p>
            </div>

            <div className="border-2 border-dashed border-red-300 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <img src="/DinDjarin.png" alt="Din Djarin" className="w-10 h-10 rounded-full object-cover" />
                <span className="font-semibold text-red-600">@themandalorian</span>
              </div>
              <p className="text-gray-700 mb-4 text-sm">
                "This is the way. Found unwanted charges faster than finding a bounty on Tatooine."
              </p>
              <p className="text-xl font-black text-black">$180/yr</p>
            </div>

            <div className="border-2 border-dashed border-red-300 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <img src="/cadbane.png" alt="Cad Bane" className="w-10 h-10 rounded-full object-cover" />
                <span className="font-semibold text-red-600">@cadbane</span>
              </div>
              <p className="text-gray-700 mb-4 text-sm">
                "A bounty hunter's gotta watch every credit. This caught subscriptions I didn't even know existed."
              </p>
              <p className="text-xl font-black text-black">$420/yr</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t-2 border-dashed border-red-200">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy" className="text-black hover:text-red-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-black hover:text-red-600 transition-colors">
              Terms
            </Link>
            <Link href="/faq" className="text-black hover:text-red-600 transition-colors">
              FAQ
            </Link>
            <Link href="/changelog" className="text-black hover:text-red-600 transition-colors">
              Changelog
            </Link>
            <Link href="/refer" className="text-black hover:text-red-600 transition-colors">
              Refer & Earn
            </Link>
            <Link href="/contact" className="text-black hover:text-red-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
