/**
 * Types pour le projet LOCAMEX
 */

// Étapes du processus de traitement
export type ProcessingStep =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'correcting'
  | 'generating'
  | 'completed'
  | 'error';

// Données extraites du fichier Word
export interface ExtractedData {
  text: string;
  images: ImageData[];
  tables: TableData[];
}

// Données d'une image
export interface ImageData {
  base64: string;
  contentType?: string;
  width?: number;
  height?: number;
  caption?: string;
}

// Données d'un tableau
export interface TableData {
  headers: string[];
  rows: string[][];
}

// Données du rapport
export interface ReportData {
  originalText: string;
  correctedText: string;
  images: ImageData[];
  tables: TableData[];
  metadata?: ReportMetadata;
}

// Métadonnées du rapport
export interface ReportMetadata {
  clientName?: string;
  address?: string;
  date?: string;
  technicianName?: string;
}

// État du traitement
export interface ProcessingState {
  step: ProcessingStep;
  progress: number;
  message: string;
  error?: string;
}
