import axios from 'axios';

interface SymptomReport {
  id: string;
  symptoms: string[];
  description: string;
  reportType: 'self' | 'observed';
  status: string;
  createdAt: any;
}

interface AIAnalysisResult {
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

class AIAnalysisService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
  }

  async analyzeSymptomReports(
    selfReports: SymptomReport[],
    observedReports: SymptomReport[],
    patientInfo: { age?: number; gender?: string; location?: string }
  ): Promise<AIAnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(selfReports, observedReports, patientInfo);
      
      const response = await axios.post(
        this.baseURL,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a medical AI assistant specialized in analyzing symptom patterns for community health surveillance in the Philippines. 
              Provide analysis in JSON format only. Consider local disease patterns, seasonal factors, and community health risks.
              Focus on early detection and appropriate specialist referrals based on Philippine healthcare system.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content) as AIAnalysisResult;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error('Failed to analyze symptom reports');
    }
  }

  private buildAnalysisPrompt(
    selfReports: SymptomReport[],
    observedReports: SymptomReport[],
    patientInfo: { age?: number; gender?: string; location?: string }
  ): string {
    const allSymptoms = [
      ...selfReports.flatMap(r => r.symptoms),
      ...observedReports.flatMap(r => r.symptoms)
    ];

    return `
Analyze the following symptom reports for a community health surveillance system in the Philippines:

PATIENT INFO:
- Age: ${patientInfo.age || 'Unknown'}
- Gender: ${patientInfo.gender || 'Unknown'}
- Location: ${patientInfo.location || 'Philippines'}

SELF-REPORTED SYMPTOMS (${selfReports.length} reports):
${selfReports.map(r => `
- Date: ${r.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
- Symptoms: ${r.symptoms.join(', ')}
- Description: ${r.description}
- Status: ${r.status}
`).join('')}

OBSERVED SYMPTOMS (${observedReports.length} reports):
${observedReports.map(r => `
- Date: ${r.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
- Symptoms: ${r.symptoms.join(', ')}
- Description: ${r.description}
- Status: ${r.status}
`).join('')}

ALL SYMPTOMS FREQUENCY:
${this.getSymptomFrequency(allSymptoms)}

Provide analysis in this exact JSON format:
{
  "riskLevel": "low|medium|high|critical",
  "riskPercentage": 0-100,
  "potentialConditions": [
    {
      "condition": "condition name",
      "probability": 0-100,
      "severity": "mild|moderate|severe"
    }
  ],
  "recommendations": [
    {
      "type": "immediate|followup|monitoring",
      "action": "specific action to take",
      "priority": 1-5
    }
  ],
  "specialistRecommendations": [
    {
      "specialty": "specialist type",
      "reason": "why this specialist",
      "urgency": "routine|urgent|emergency"
    }
  ],
  "summary": "brief summary of findings",
  "trends": {
    "improving": boolean,
    "worsening": boolean,
    "stable": boolean,
    "pattern": "description of pattern"
  }
}

Consider:
- Common diseases in the Philippines (dengue, typhoid, respiratory infections)
- Seasonal patterns and weather-related illnesses
- Community outbreak potential
- Appropriate Philippine healthcare specialists
- Cultural and socioeconomic factors
`;
  }

  private getSymptomFrequency(symptoms: string[]): string {
    const frequency: { [key: string]: number } = {};
    symptoms.forEach(symptom => {
      frequency[symptom] = (frequency[symptom] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .map(([symptom, count]) => `${symptom}: ${count}`)
      .join(', ');
  }

  async getQuickInsights(symptoms: string[]): Promise<{
    urgency: 'low' | 'medium' | 'high';
    keySymptoms: string[];
    possibleCauses: string[];
  }> {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Provide quick medical insights for symptom triage. Respond in JSON format only.'
            },
            {
              role: 'user',
              content: `Analyze these symptoms for urgency: ${symptoms.join(', ')}. 
              Return JSON: {"urgency": "low|medium|high", "keySymptoms": ["symptom1"], "possibleCauses": ["cause1"]}`
            }
          ],
          temperature: 0.2,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Quick insights error:', error);
      return {
        urgency: 'medium',
        keySymptoms: symptoms.slice(0, 3),
        possibleCauses: ['Multiple factors possible']
      };
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();
export type { AIAnalysisResult, SymptomReport };
export { AIAnalysisService };