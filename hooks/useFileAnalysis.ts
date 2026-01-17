import { useReducer, useCallback } from 'react';
import { parseCSV, parsePDF } from '@/lib/parsers';
import { analyzeTransactions } from '@/lib/analyzer';
import type { Analysis, AIInsights } from '@/lib/types';
import { SUPPORTED_FILE_TYPES } from '@/lib/constants';
import type { AnalysisStep } from '@/components/ProgressIndicator';

// View modes
export type ViewMode = 'upload' | 'results' | 'categorization' | 'audit';

// State type
interface FileAnalysisState {
  file: File | null;
  isDragging: boolean;
  isAnalyzing: boolean;
  analysisStep: AnalysisStep;
  analysis: Analysis | null;
  insights: AIInsights | null;
  error: string;
  currentView: ViewMode;
}

// Action types
type FileAnalysisAction =
  | { type: 'SET_DRAGGING'; isDragging: boolean }
  | { type: 'SET_FILE'; file: File }
  | { type: 'CLEAR_FILE' }
  | { type: 'START_ANALYSIS' }
  | { type: 'SET_STEP'; step: AnalysisStep }
  | { type: 'ANALYSIS_SUCCESS'; analysis: Analysis; insights: AIInsights | null }
  | { type: 'ANALYSIS_ERROR'; error: string }
  | { type: 'SET_VIEW'; view: ViewMode }
  | { type: 'UPDATE_ANALYSIS'; analysis: Analysis }
  | { type: 'RESET' };

const initialState: FileAnalysisState = {
  file: null,
  isDragging: false,
  isAnalyzing: false,
  analysisStep: 'idle',
  analysis: null,
  insights: null,
  error: '',
  currentView: 'upload',
};

function reducer(state: FileAnalysisState, action: FileAnalysisAction): FileAnalysisState {
  switch (action.type) {
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.isDragging };
    case 'SET_FILE':
      return { ...state, file: action.file, analysis: null, insights: null, error: '' };
    case 'CLEAR_FILE':
      return { ...state, file: null };
    case 'START_ANALYSIS':
      return { ...state, isAnalyzing: true, analysisStep: 'uploading', error: '' };
    case 'SET_STEP':
      return { ...state, analysisStep: action.step };
    case 'ANALYSIS_SUCCESS':
      return {
        ...state,
        isAnalyzing: false,
        analysisStep: 'complete',
        analysis: action.analysis,
        insights: action.insights,
      };
    case 'ANALYSIS_ERROR':
      return { ...state, isAnalyzing: false, analysisStep: 'idle', error: action.error };
    case 'SET_VIEW':
      return { ...state, currentView: action.view };
    case 'UPDATE_ANALYSIS':
      return { ...state, analysis: action.analysis };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function isValidFileType(file: File): boolean {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  const csvTypes = SUPPORTED_FILE_TYPES.CSV as readonly string[];
  const pdfTypes = SUPPORTED_FILE_TYPES.PDF as readonly string[];

  return (
    csvTypes.includes(fileType) ||
    pdfTypes.includes(fileType) ||
    fileName.endsWith('.csv') ||
    fileName.endsWith('.pdf')
  );
}

export function useFileAnalysis() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setDragging = useCallback((isDragging: boolean) => {
    dispatch({ type: 'SET_DRAGGING', isDragging });
  }, []);

  const handleFile = useCallback((file: File) => {
    if (isValidFileType(file)) {
      dispatch({ type: 'SET_FILE', file });
    } else {
      dispatch({ type: 'ANALYSIS_ERROR', error: 'Please upload a CSV or PDF file' });
    }
  }, []);

  const clearFile = useCallback(() => {
    dispatch({ type: 'CLEAR_FILE' });
  }, []);

  const analyzeFile = useCallback(async () => {
    if (!state.file) return;

    dispatch({ type: 'START_ANALYSIS' });

    try {
      // Brief uploading state
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Step 2: Parse
      dispatch({ type: 'SET_STEP', step: 'parsing' });
      const isCSV = state.file.name.toLowerCase().endsWith('.csv');
      const transactions = isCSV
        ? await parseCSV(state.file)
        : await parsePDF(state.file);

      // Step 3: Analyze
      dispatch({ type: 'SET_STEP', step: 'analyzing' });
      const analysis = await analyzeTransactions(transactions);

      dispatch({
        type: 'ANALYSIS_SUCCESS',
        analysis,
        insights: analysis.insights || null,
      });
      dispatch({ type: 'SET_VIEW', view: 'results' });
    } catch (err) {
      console.error('Analysis error:', err);
      dispatch({
        type: 'ANALYSIS_ERROR',
        error: err instanceof Error ? err.message : 'Failed to analyze file',
      });
    }
  }, [state.file]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const setView = useCallback((view: ViewMode) => {
    dispatch({ type: 'SET_VIEW', view });
  }, []);

  const updateAnalysis = useCallback((analysis: Analysis) => {
    dispatch({ type: 'UPDATE_ANALYSIS', analysis });
  }, []);

  return {
    ...state,
    setDragging,
    handleFile,
    clearFile,
    analyzeFile,
    reset,
    setView,
    updateAnalysis,
  };
}
