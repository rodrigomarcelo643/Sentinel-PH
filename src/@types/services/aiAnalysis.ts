// Types from src/services/aiAnalysisService.ts

export interface AIAnalysisResult {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskPercentage: number;
  potentialConditions: Array<{
    condition: string;
    probability: number;
    severity: 'mild' | 'moderate' | 'severe';
  }>;
  recommendations: Array<{
    type: 'immediate' | 'followup' | 'monitoring';
    action: string;
    priority: number;
  }>;
  specialistRecommendations: Array<{
    specialty: string;
    reason: string;
    urgency: 'routine' | 'urgent' | 'emergency';
  }>;
  summary: string;
  trends: {
    improving: boolean;
    worsening: boolean;
    stable: boolean;
    pattern: string;
  };
}