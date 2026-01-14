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
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showBreakdown, setShowBreakdown] = useState(false);

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
      setAiExplanation('');
    } else {
      setError('Please upload a CSV or PDF file');
    }
  };

  const analyzeFile = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError('');
    setShowBreakdown(false);

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

      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: result }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI insights');
      }

      const { explanation } = await response.json();
      setAiExplanation(explanation);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze file');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setAnalysis(null);
    setAiExplanation('');
    setError('');
    setShowBreakdown(false);
  };

  // Results View
  if (analysis) {
    return (
      <div className="min-h-screen bg-white bg-dots">
        <div className="mx-auto max-w-4xl px-6 py-12">
          {/* Header */}
          <div className="mb-16">
            <button
              onClick={resetAnalysis}
              className="mb-8 text-red-600 hover:text-red-700 font-medium"
            >
              ← Back
            </button>
            <h1 className="text-5xl font-bold tracking-tight text-black mb-2">
              your financial breakdown
            </h1>
            <p className="text-black text-lg">Analysis complete • {file?.name}</p>
          </div>

          {/* Animated Total - Always shows first */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="border-2 border-dashed border-red-300 rounded-lg p-12 text-center bg-red-50/30">
              <p className="text-red-600 text-sm uppercase tracking-wider mb-4 font-semibold">Total Spent This Month</p>
              <h2 className="text-7xl font-bold text-black mb-4">
                <AnimatedCounter value={analysis.totalSpent} duration={2} />
              </h2>
              <p className="text-gray-600 text-base">from your statement</p>
            </div>
          </motion.div>

          {/* Breakdown - Shows after counter animation */}
          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* AI Insights */}
              {aiExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="mb-16 border-2 border-dashed border-red-300 rounded-lg p-8 bg-red-50/30"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">✨</span>
                    <h2 className="text-xl font-bold text-black">AI Analysis</h2>
                  </div>
                  <p className="text-black leading-relaxed whitespace-pre-line text-lg">
                    {aiExplanation}
                  </p>
                </motion.div>
              )}


              {/* Subscriptions */}
              {analysis.subscriptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mb-16"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-black">
                      💳 Recurring Subscriptions
                    </h2>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(analysis.subscriptions.reduce((sum, sub) => sum + sub.amount, 0))}
                      </p>
                      <p className="text-sm text-gray-600">total per month</p>
                    </div>
                  </div>
                  <div className="border-2 border-dashed border-red-300 rounded-lg divide-y-2 divide-dashed divide-red-300 bg-white">
                    {analysis.subscriptions.map((sub, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1, duration: 0.4 }}
                        className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex-1">
                          <p className="text-black text-xl font-semibold mb-1 capitalize">{sub.name}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-600 text-sm">{sub.transactions.length} charges this month</span>
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                              {sub.frequency}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-3xl text-black group-hover:text-red-600 transition-colors">
                            {formatCurrency(sub.amount)}
                          </p>
                          <p className="text-gray-600 text-sm">/month</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatCurrency(sub.amount * 12)}/year
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg">
                    <p className="text-sm text-yellow-900">
                      💡 <span className="font-semibold">Tip:</span> Review these subscriptions - canceling just one could save you hundreds per year!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-black mb-6">
                  📊 Spending Breakdown
                </h2>
                <div className="border-2 border-dashed border-red-300 rounded-lg divide-y-2 divide-dashed divide-red-300 bg-white">
                  {analysis.categorySpending.map((cat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1, duration: 0.4 }}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-black text-xl font-semibold">{cat.category}</span>
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                            {cat.count} {cat.count === 1 ? 'transaction' : 'transactions'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-2xl text-black">
                            {formatCurrency(cat.total)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.percentage}%` }}
                            transition={{ delay: 0.7 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                          />
                        </div>
                        <span className="text-base font-bold text-red-600 w-14 text-right">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Footer */}
          <div className="text-center pt-8 border-t-2 border-dashed border-red-200">
            <p className="text-red-600 text-sm mb-8">
              Your files are analyzed locally and immediately discarded. Nothing is stored.
            </p>

            {/* Footer Navigation */}
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
