// Types from src/services/patternAnalysisService.ts

export interface PatternAnalysisResult {
  outbreakRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  clusters: ClusterData[];
  diseases: DiseasePattern[];
  anomalies: AnomalyData[];
  predictions: PredictionData[];
  affectedResidents: number;
  totalReports: number;
  timeframe: string;
  aiRecommendations?: string[];
}

export interface ClusterData {
  id: string;
  center: { lat: number; lng: number };
  radius: number;
  reportCount: number;
  residents: number;
  dominantSymptoms: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface DiseasePattern {
  disease: string;
  probability: number;
  affectedCount: number;
  symptoms: string[];
  locations: string[];
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

export interface AnomalyData {
  type: 'SPATIAL' | 'TEMPORAL' | 'SYMPTOM';
  description: string;
  severity: number;
  location?: string;
  timestamp: string;
}

export interface PredictionData {
  disease: string;
  predictedCases: number;
  confidence: number;
  timeframe: string;
  preventionMeasures: string[];
}

export interface ReportData {
  id: string;
  symptoms: string[];
  location: { lat: number; lng: number };
  timestamp: string;
  barangay: string;
  municipality: string;
  residentId: string;
}