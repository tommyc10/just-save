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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleStartCategorization = () => {
    setView('categorization');
  };

  const handleCategorizationComplete = (categorized: CategorizedSubscription[]) => {
    if (analysis) {
      updateAnalysis({
        ...analysis,
        subscriptions: categorized,
      });
      setView('audit');
    }
  };

  const handleBackToResults = () => {
    setView('results');
  };

  const handleBackToCategorization = () => {
    setView('categorization');
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
        onBack={handleBackToCategorization}
        onExportHTML={handleExportHTML}
      />
    );
  }

  if (currentView === 'categorization' && analysis) {
    return (
      <CategorizationView
        subscriptions={analysis.subscriptions}
        onComplete={handleCategorizationComplete}
        onBack={handleBackToResults}
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
        onStartCategorization={handleStartCategorization}
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
