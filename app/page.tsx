'use client';

import { useFileAnalysis } from '@/hooks/useFileAnalysis';
import { UploadView } from '@/components/UploadView';
import { ResultsView } from '@/components/ResultsView';
import { CategorizationView } from '@/components/CategorizationView';
import { AuditView } from '@/components/AuditView';
import { CategorizedSubscription } from '@/lib/types';
import { generateAuditReport, exportToHTML } from '@/lib/audit-export';

export default function Home() {
  const {
    file,
    isDragging,
    isAnalyzing,
    analysisStep,
    analysis,
    insights,
    error,
    currentView,
    setDragging,
    handleFile,
    clearFile,
    analyzeFile,
    reset,
    setView,
    updateAnalysis,
  } = useFileAnalysis();

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleCategorizationComplete = (categorized: CategorizedSubscription[]) => {
    if (analysis) {
      updateAnalysis({ ...analysis, subscriptions: categorized });
      setView('audit');
    }
  };

  const handleExportHTML = () => {
    if (!analysis) return;

    const report = generateAuditReport(analysis.subscriptions);
    const html = exportToHTML(report);

    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscription-audit-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render based on current view
  if (currentView === 'audit' && analysis) {
    return (
      <AuditView
        subscriptions={analysis.subscriptions}
        onBack={() => setView('categorization')}
        onExportHTML={handleExportHTML}
      />
    );
  }

  if (currentView === 'categorization' && analysis) {
    return (
      <CategorizationView
        subscriptions={analysis.subscriptions}
        onComplete={handleCategorizationComplete}
        onBack={() => setView('results')}
      />
    );
  }

  if (currentView === 'results' && analysis) {
    return (
      <ResultsView
        analysis={analysis}
        fileName={file?.name || 'Statement'}
        insights={insights}
        onReset={reset}
        onStartCategorization={() => setView('categorization')}
      />
    );
  }

  return (
    <UploadView
      file={file}
      error={error}
      isDragging={isDragging}
      isAnalyzing={isAnalyzing}
      analysisStep={analysisStep}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onFileInput={handleFileInput}
      onClearFile={clearFile}
      onAnalyze={analyzeFile}
    />
  );
}
