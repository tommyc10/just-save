'use client';

import { LockIcon, UploadIcon, GitHubIcon } from './Icons';
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
    <div className="min-h-screen bg-background bg-dots relative">
      {/* Theme Toggle - positioned top right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-20">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-foreground mb-4">
            just save
          </h1>
          <p className="text-muted-foreground text-xl">
            Find and cancel forgotten subscriptions
          </p>
        </div>

        {/* GitHub Star */}
        <a
          href="https://github.com/tommyc10/just-save"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 mb-12 px-4 py-2 border border-border rounded-full hover:bg-accent transition-colors"
        >
          <GitHubIcon className="w-5 h-5 text-foreground" />
          <span className="text-sm font-medium text-foreground">Star on GitHub</span>
        </a>

        {/* Error */}
        {error && (
          <div className="mb-8 border border-red-300 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-center text-sm">
            {error}
          </div>
        )}

        {/* Upload Box */}
        <div className="border border-border rounded-2xl mb-8 overflow-hidden bg-card">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`p-16 text-center transition-all ${
              isDragging ? 'bg-accent' : 'hover:bg-accent'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".csv,.pdf"
              onChange={onFileInput}
              className="hidden"
            />

            {!file ? (
              <label htmlFor="file-upload" className="cursor-pointer block">
                <div className="mb-4">
                  <UploadIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                </div>
                <p className="text-xl font-semibold text-foreground mb-2">
                  Drop your bank statement here
                </p>
                <p className="text-muted-foreground text-sm">
                  CSV or PDF · Supports most banks · Under 90 seconds
                </p>
              </label>
            ) : (
              <div>
                <p className="text-xl font-semibold text-foreground mb-2">{file.name}</p>
                <p className="text-muted-foreground mb-4 text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={onClearFile}
                  className="text-muted-foreground hover:text-foreground font-medium text-sm transition-colors"
                >
                  Choose different file
                </button>
              </div>
            )}
          </div>

          {file && (
            <div className="border-t border-border p-6 bg-accent">
              {isAnalyzing ? (
                <div className="py-4">
                  <ProgressIndicator currentStep={analysisStep} />
                </div>
              ) : (
                <button
                  onClick={onAnalyze}
                  className="w-full bg-foreground text-background font-semibold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Analyze My Spending
                </button>
              )}
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <LockIcon className="w-4 h-4" />
          <p>Your files are analyzed locally and immediately discarded.</p>
        </div>

        {/* Social Proof Section */}
        <div className="mt-24 pt-12 border-t border-border">
          <h3 className="text-center text-xl font-semibold text-foreground mb-8">
            What users are saving
          </h3>

          <div className="grid sm:grid-cols-3 gap-6">
            <TestimonialCard
              avatar="/bobafett.png"
              name="@bobafett"
              quote="Found subscriptions I forgot about. Simple and effective."
              savings="$240"
            />
            <TestimonialCard
              avatar="/DinDjarin.png"
              name="@themandalorian"
              quote="Fast, private, and found charges I missed. Highly recommend."
              savings="$180"
            />
            <TestimonialCard
              avatar="/cadbane.png"
              name="@cadbane"
              quote="Clean interface, no data stored. Exactly what I needed."
              savings="$420"
            />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-border">
          <Footer />
        </div>
      </div>
    </div>
  );
}

interface TestimonialCardProps {
  avatar: string;
  name: string;
  quote: string;
  savings: string;
}

function TestimonialCard({ avatar, name, quote, savings }: TestimonialCardProps) {
  return (
    <div className="border border-border rounded-2xl p-6 bg-card">
      <div className="flex items-center gap-3 mb-4">
        <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
        <span className="font-medium text-foreground">{name}</span>
      </div>
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">"{quote}"</p>
      <p className="text-2xl font-bold text-foreground">
        {savings}<span className="text-sm font-normal text-muted-foreground">/yr</span>
      </p>
    </div>
  );
}
