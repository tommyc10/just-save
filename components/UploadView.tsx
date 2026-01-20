'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LockIcon, UploadIcon, GitHubIcon, ArrowRightIcon } from './Icons';
import { Footer } from './Footer';
import { ThemeToggle } from './ThemeToggle';
import { ProgressIndicator, AnalysisStep } from './ProgressIndicator';

interface UploadViewProps {
  file: File | null;
  error: string;
  isDragging: boolean;
  isAnalyzing: boolean;
  analysisStep: AnalysisStep;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  onAnalyze: () => void;
}

export function UploadView({
  file,
  error,
  isDragging,
  isAnalyzing,
  analysisStep,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInput,
  onClearFile,
  onAnalyze,
}: UploadViewProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-grid opacity-50" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-radial-fade" />

      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="absolute top-8 right-8 z-20"
      >
        <ThemeToggle />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 md:py-24">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center md:text-left"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-positive-muted border border-positive/20"
          >
            <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
            <span className="text-sm font-medium text-positive">Private & Secure Analysis</span>
          </motion.div>

          {/* Main headline - Editorial serif font */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] tracking-tight mb-6">
            Find your
            <br />
            <span className="italic">forgotten</span>
            <br />
            subscriptions
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-xl">
            Upload your bank statement. We'll identify recurring charges
            and help you decide what to keep.
          </p>
        </motion.div>

        {/* GitHub Star - Floating pill */}
        <motion.a
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          href="https://github.com/tommyc10/just-save"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 mb-12 px-5 py-2.5 rounded-full bg-card border border-border hover:border-foreground/20 transition-all duration-300 stat-glow"
        >
          <GitHubIcon className="w-5 h-5 text-foreground" />
          <span className="text-sm font-medium text-foreground">Star on GitHub</span>
          <ArrowRightIcon className="w-4 h-4 text-muted-foreground" />
        </motion.a>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-8"
            >
              <div className="border border-negative/30 rounded-2xl p-5 bg-negative-muted">
                <p className="text-negative text-sm font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Card - The hero element */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="gradient-border mb-10"
        >
          <div className="bg-card rounded-3xl overflow-hidden stat-glow">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative p-12 md:p-16 text-center transition-all duration-300 ${
                isDragging
                  ? 'bg-positive-muted'
                  : 'hover:bg-accent/50'
              }`}
            >
              {/* Decorative corner accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-border rounded-tl-lg opacity-40" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-border rounded-tr-lg opacity-40" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-border rounded-bl-lg opacity-40" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-border rounded-br-lg opacity-40" />

              <input
                type="file"
                id="file-upload"
                accept=".csv,.pdf"
                onChange={onFileInput}
                className="hidden"
              />

              {!file ? (
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <motion.div
                    animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="mb-6"
                  >
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-accent border border-border flex items-center justify-center">
                      <UploadIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </motion.div>
                  <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">
                    Drop your statement here
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto">
                    CSV or PDF format · Works with most UK & US banks
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-positive" />
                      Instant analysis
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-positive" />
                      No data stored
                    </span>
                  </div>
                </label>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-positive-muted border border-positive/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-positive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl text-foreground mb-2">{file.name}</h3>
                  <p className="text-muted-foreground mb-6 text-sm font-mono">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={onClearFile}
                    className="text-muted-foreground hover:text-foreground font-medium text-sm transition-colors link-underline"
                  >
                    Choose different file
                  </button>
                </motion.div>
              )}
            </div>

            {/* Action Area */}
            <AnimatePresence>
              {file && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border"
                >
                  <div className="p-6 md:p-8 bg-accent/30">
                    {isAnalyzing ? (
                      <div className="py-4">
                        <ProgressIndicator currentStep={analysisStep} />
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={onAnalyze}
                        className="w-full bg-foreground text-background font-semibold py-4 px-8 rounded-xl btn-premium transition-all duration-200 flex items-center justify-center gap-3"
                      >
                        <span>Analyze My Spending</span>
                        <ArrowRightIcon className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Privacy Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex items-center justify-center gap-3 text-muted-foreground text-sm mb-20"
        >
          <LockIcon className="w-4 h-4" />
          <p>Files analyzed locally in your browser. Nothing is stored or transmitted.</p>
        </motion.div>

        {/* Social Proof Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="pt-12 border-t border-border"
        >
          <div className="text-center mb-10">
            <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
              What users are saving
            </h3>
            <p className="text-muted-foreground text-sm">Join thousands who've found forgotten charges</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <TestimonialCard
              avatar="/bobafett.png"
              name="@bobafett"
              quote="Found subscriptions I forgot about. Simple and effective."
              savings="$240"
              delay={0.8}
            />
            <TestimonialCard
              avatar="/DinDjarin.png"
              name="@themandalorian"
              quote="Fast, private, and found charges I missed. Highly recommend."
              savings="$180"
              delay={0.9}
            />
            <TestimonialCard
              avatar="/cadbane.png"
              name="@cadbane"
              quote="Clean interface, no data stored. Exactly what I needed."
              savings="$420"
              delay={1.0}
            />
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-16 pt-8 border-t border-border"
        >
          <Footer />
        </motion.div>
      </div>
    </div>
  );
}

interface TestimonialCardProps {
  avatar: string;
  name: string;
  quote: string;
  savings: string;
  delay?: number;
}

function TestimonialCard({ avatar, name, quote, savings, delay = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-card border border-border rounded-2xl p-6 stat-glow hover:border-border/80 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-4">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
        />
        <span className="font-medium text-foreground text-sm">{name}</span>
      </div>
      <p className="text-muted-foreground mb-5 text-sm leading-relaxed">"{quote}"</p>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-3xl font-bold text-positive">{savings}</span>
        <span className="text-sm text-muted-foreground">/year saved</span>
      </div>
    </motion.div>
  );
}
