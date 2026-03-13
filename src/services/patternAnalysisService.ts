import axios from 'axios';
import type { 
  PatternAnalysisResult, 
  ClusterData, 
  DiseasePattern, 
  AnomalyData, 
  PredictionData, 
  ReportData 
} from '@/@types/services/patternAnalysis';

class PatternAnalysisService {
  private readonly openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

  private dbscanClustering(reports: ReportData[], eps: number = 0.01, minPts: number = 3): ClusterData[] {
    const clusters: ClusterData[] = [];
    const visited = new Set<string>();
    const clustered = new Set<string>();

    for (const report of reports) {
      if (visited.has(report.id)) continue;
      visited.add(report.id);

      const neighbors = this.getNeighbors(report, reports, eps);
      if (neighbors.length < minPts) continue;

      const cluster: ReportData[] = [report];
      clustered.add(report.id);

      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          const neighborNeighbors = this.getNeighbors(neighbor, reports, eps);
          if (neighborNeighbors.length >= minPts) {
            neighbors.push(...neighborNeighbors.filter(n => !neighbors.includes(n)));
          }
        }
        if (!clustered.has(neighbor.id)) {
          cluster.push(neighbor);
          clustered.add(neighbor.id);
        }
      }

      if (cluster.length >= minPts) {
        clusters.push(this.createClusterData(cluster));
      }
    }

    return clusters;
  }

  private getNeighbors(report: ReportData, reports: ReportData[], eps: number): ReportData[] {
    return reports.filter(r => 
      r.id !== report.id && this.calculateDistance(report.location, r.location) <= eps
    );
  }

  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 6371;
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  private createClusterData(cluster: ReportData[]): ClusterData {
    const center = this.calculateCentroid(cluster);
    const symptoms = cluster.flatMap(r => r.symptoms);
    const symptomCounts = symptoms.reduce((acc, symptom) => {
      acc[symptom] = (acc[symptom] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([symptom]) => symptom);

    const riskLevel = this.calculateClusterRisk(cluster.length, dominantSymptoms);

    return {
      id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      center,
      radius: this.calculateClusterRadius(cluster, center),
      reportCount: cluster.length,
      residents: new Set(cluster.map(r => r.residentId)).size,
      dominantSymptoms,
      riskLevel
    };
  }

  private calculateCentroid(cluster: ReportData[]): { lat: number; lng: number } {
    const lat = cluster.reduce((sum, r) => sum + r.location.lat, 0) / cluster.length;
    const lng = cluster.reduce((sum, r) => sum + r.location.lng, 0) / cluster.length;
    return { lat, lng };
  }

  private calculateClusterRadius(cluster: ReportData[], center: { lat: number; lng: number }): number {
    return Math.max(...cluster.map(r => this.calculateDistance(center, r.location)));
  }

  private calculateClusterRisk(reportCount: number, symptoms: string[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const highRiskSymptoms = ['fever', 'cough', 'diarrhea', 'vomiting', 'rash'];
    const riskSymptomCount = symptoms.filter(s => highRiskSymptoms.includes(s.toLowerCase())).length;
    
    if (reportCount >= 10 && riskSymptomCount >= 3) return 'CRITICAL';
    if (reportCount >= 7 && riskSymptomCount >= 2) return 'HIGH';
    if (reportCount >= 4 && riskSymptomCount >= 1) return 'MEDIUM';
    return 'LOW';
  }

  private async categorizeSymptoms(symptoms: string[], totalReports: number): Promise<DiseasePattern[]> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [{
            role: 'system',
            content: `You are a medical epidemiologist AI specializing in Philippine health patterns. Analyze symptoms and provide realistic disease predictions. Return JSON array with: disease, probability (0-1), affectedCount (realistic number based on ${totalReports} total reports), symptoms array, locations array, trend (INCREASING/STABLE/DECREASING). Keep affectedCount reasonable and proportional to total reports.`
          }, {
            role: 'user',
            content: `Analyze these symptoms for potential disease outbreaks in the Philippines: ${symptoms.join(', ')}. Total reports: ${totalReports}. Provide realistic affected counts.`
          }],
          temperature: 0.3,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const aiResults = JSON.parse(content);
      
      return aiResults.map((disease: any) => ({
        disease: disease.disease || 'Unknown Disease',
        probability: disease.probability || 0.5,
        affectedCount: Math.min(disease.affectedCount || 5, totalReports), // Cap at actual report count
        symptoms: disease.symptoms || symptoms.slice(0, 3),
        locations: disease.locations || ['Metro Manila', 'Cebu', 'Davao'],
        trend: disease.trend || 'STABLE'
      }));
    } catch (error) {
      console.error('Error categorizing symptoms:', error);
      return this.getFallbackDiseases(symptoms, totalReports);
    }
  }

  private getFallbackDiseases(symptoms: string[], totalReports: number): DiseasePattern[] {
    const commonDiseases = [
      {
        disease: 'Dengue Fever',
        probability: 0.7,
        affectedCount: Math.min(Math.ceil(totalReports * 0.6), totalReports),
        symptoms: ['fever', 'headache', 'muscle pain'],
        locations: ['Metro Manila', 'Cebu City'],
        trend: 'INCREASING' as const
      },
      {
        disease: 'Gastroenteritis',
        probability: 0.6,
        affectedCount: Math.min(Math.ceil(totalReports * 0.4), totalReports),
        symptoms: ['diarrhea', 'vomiting', 'abdominal pain'],
        locations: ['Quezon City', 'Makati'],
        trend: 'STABLE' as const
      }
    ];
    return commonDiseases.filter(d => 
      d.symptoms.some(s => symptoms.includes(s))
    ).slice(0, 3);
  }

  private detectAnomalies(reports: ReportData[]): AnomalyData[] {
    const anomalies: AnomalyData[] = [];
    
    const timeGroups = this.groupByTimeWindow(reports, 24);
    const avgReportsPerDay = Object.values(timeGroups).reduce((sum, count) => sum + count, 0) / Object.keys(timeGroups).length;
    
    Object.entries(timeGroups).forEach(([date, count]) => {
      if (count > avgReportsPerDay * 2) {
        anomalies.push({
          type: 'TEMPORAL',
          description: `Unusual spike in reports: ${count} reports on ${date} (avg: ${avgReportsPerDay.toFixed(1)})`,
          severity: Math.min(count / avgReportsPerDay, 5),
          timestamp: date
        });
      }
    });

    const locationGroups = this.groupByLocation(reports);
    Object.entries(locationGroups).forEach(([location, locationReports]) => {
      if (locationReports.length > 5) {
        anomalies.push({
          type: 'SPATIAL',
          description: `High concentration of reports in ${location}: ${locationReports.length} cases`,
          severity: Math.min(locationReports.length / 5, 5),
          location,
          timestamp: new Date().toISOString()
        });
      }
    });

    const symptomFreq = this.calculateSymptomFrequency(reports);
    Object.entries(symptomFreq).forEach(([symptom, frequency]) => {
      if (frequency > 0.7) {
        anomalies.push({
          type: 'SYMPTOM',
          description: `Unusual prevalence of ${symptom}: ${(frequency * 100).toFixed(1)}% of reports`,
          severity: frequency * 5,
          timestamp: new Date().toISOString()
        });
      }
    });

    return anomalies.sort((a, b) => b.severity - a.severity);
  }

  private groupByTimeWindow(reports: ReportData[], hours: number): Record<string, number> {
    const groups: Record<string, number> = {};
    reports.forEach(report => {
      const date = new Date(report.timestamp);
      const windowStart = new Date(Math.floor(date.getTime() / (hours * 60 * 60 * 1000)) * (hours * 60 * 60 * 1000));
      const key = windowStart.toISOString().split('T')[0];
      groups[key] = (groups[key] || 0) + 1;
    });
    return groups;
  }

  private groupByLocation(reports: ReportData[]): Record<string, ReportData[]> {
    return reports.reduce((groups, report) => {
      const key = `${report.municipality}, ${report.barangay}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(report);
      return groups;
    }, {} as Record<string, ReportData[]>);
  }

  private calculateSymptomFrequency(reports: ReportData[]): Record<string, number> {
    const allSymptoms = reports.flatMap(r => r.symptoms);
    const symptomCounts = allSymptoms.reduce((acc, symptom) => {
      acc[symptom] = (acc[symptom] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalReports = reports.length;
    return Object.entries(symptomCounts).reduce((acc, [symptom, count]) => {
      acc[symptom] = count / totalReports;
      return acc;
    }, {} as Record<string, number>);
  }

  private generatePredictions(clusters: ClusterData[], diseases: DiseasePattern[]): PredictionData[] {
    const predictions: PredictionData[] = [];

    diseases.forEach(disease => {
      if (!disease.symptoms || !Array.isArray(disease.symptoms)) {
        return;
      }
      
      const relevantClusters = clusters.filter(c => 
        c.dominantSymptoms.some(symptom => disease.symptoms.includes(symptom))
      );

      if (relevantClusters.length > 0) {
        const totalAffected = relevantClusters.reduce((sum, c) => sum + c.residents, 0);
        const growthRate = this.calculateGrowthRate(disease.trend);
        const predictedCases = Math.round(totalAffected * growthRate);

        predictions.push({
          disease: disease.disease,
          predictedCases,
          confidence: disease.probability * 0.8,
          timeframe: '7 days',
          preventionMeasures: this.getPreventionMeasures(disease.disease)
        });
      }
    });

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  private calculateGrowthRate(trend: 'INCREASING' | 'STABLE' | 'DECREASING'): number {
    switch (trend) {
      case 'INCREASING': return 1.5;
      case 'STABLE': return 1.1;
      case 'DECREASING': return 0.8;
      default: return 1.0;
    }
  }

  private getPreventionMeasures(disease: string): string[] {
    const measures: Record<string, string[]> = {
      'dengue': ['Eliminate standing water', 'Use mosquito repellent', 'Clean water containers'],
      'diarrhea': ['Boil drinking water', 'Wash hands frequently', 'Proper food handling'],
      'respiratory': ['Wear masks', 'Maintain social distance', 'Improve ventilation'],
      'default': ['Maintain hygiene', 'Seek medical attention', 'Follow health protocols']
    };

    const key = Object.keys(measures).find(k => disease.toLowerCase().includes(k)) || 'default';
    return measures[key];
  }

  private async generateAIRecommendations(analysis: any): Promise<string[]> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [{
            role: 'system',
            content: `You are a Philippine public health expert. Provide specific, actionable recommendations for health authorities based on outbreak analysis. Focus on immediate actions, resource allocation, and community interventions.`
          }, {
            role: 'user',
            content: `Analysis Results:\n- Outbreak Risk: ${analysis.outbreakRisk}\n- Risk Score: ${analysis.riskScore}/10\n- Total Reports: ${analysis.totalReports}\n- Affected Residents: ${analysis.affectedResidents}\n- Clusters: ${analysis.clusters.length}\n- Top Diseases: ${analysis.diseases.slice(0, 3).map((d: any) => d.disease).join(', ')}\n\nProvide 5-7 specific recommendations for immediate action.`
          }],
          temperature: 0.4,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return content.split('\n').filter((line: string) => line.trim().length > 0).slice(0, 7);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return this.getFallbackRecommendations(analysis.outbreakRisk);
    }
  }

  private getFallbackRecommendations(riskLevel: string): string[] {
    const recommendations = {
      'CRITICAL': [
        'Activate emergency response protocols immediately',
        'Deploy rapid response teams to affected areas',
        'Coordinate with DOH regional offices',
        'Issue public health emergency declaration',
        'Establish isolation facilities if needed',
        'Implement contact tracing protocols',
        'Mobilize additional medical resources'
      ],
      'HIGH': [
        'Increase surveillance in affected areas',
        'Alert all health facilities in the region',
        'Conduct community health education campaigns',
        'Strengthen laboratory testing capacity',
        'Coordinate with local government units',
        'Prepare emergency medical supplies'
      ],
      'MEDIUM': [
        'Monitor situation closely',
        'Enhance routine surveillance',
        'Conduct targeted health education',
        'Review prevention protocols',
        'Coordinate with barangay health workers'
      ],
      'LOW': [
        'Continue routine monitoring',
        'Maintain standard prevention measures',
        'Regular community health updates'
      ]
    };
    return recommendations[riskLevel as keyof typeof recommendations] || recommendations['LOW'];
  }

  async analyzePatterns(reports: ReportData[]): Promise<PatternAnalysisResult> {
    if (reports.length === 0) {
      return {
        outbreakRisk: 'LOW',
        riskScore: 0,
        clusters: [],
        diseases: [],
        anomalies: [],
        predictions: [],
        affectedResidents: 0,
        totalReports: 0,
        timeframe: '7 days',
        aiRecommendations: ['No data available for analysis']
      };
    }

    const clusters = this.dbscanClustering(reports);
    const allSymptoms = [...new Set(reports.flatMap(r => r.symptoms))];
    const diseases = await this.categorizeSymptoms(allSymptoms, reports.length);
    const anomalies = this.detectAnomalies(reports);
    const predictions = this.generatePredictions(clusters, diseases);
    const riskScore = this.calculateOverallRisk(clusters, anomalies, diseases);
    const outbreakRisk = this.determineOutbreakRisk(riskScore);

    const analysisData = {
      outbreakRisk,
      riskScore,
      clusters,
      diseases,
      anomalies,
      predictions,
      affectedResidents: new Set(reports.map(r => r.residentId)).size,
      totalReports: reports.length,
      timeframe: '7 days'
    };

    const aiRecommendations = await this.generateAIRecommendations(analysisData);

    return {
      ...analysisData,
      aiRecommendations
    };
  }

  private calculateOverallRisk(clusters: ClusterData[], anomalies: AnomalyData[], diseases: DiseasePattern[]): number {
    const clusterRisk = clusters.reduce((sum, c) => {
      const riskValues = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
      return sum + riskValues[c.riskLevel] * c.residents;
    }, 0);

    const anomalyRisk = anomalies.reduce((sum, a) => sum + a.severity, 0);
    const diseaseRisk = diseases.reduce((sum, d) => sum + d.probability * (d.affectedCount || 0), 0);

    return Math.min((clusterRisk + anomalyRisk + diseaseRisk) / 10, 10);
  }

  private determineOutbreakRisk(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (riskScore >= 8) return 'CRITICAL';
    if (riskScore >= 6) return 'HIGH';
    if (riskScore >= 3) return 'MEDIUM';
    return 'LOW';
  }
}

export const patternAnalysisService = new PatternAnalysisService();

// Export the main analysis function
export const analyzeHealthPatterns = async (): Promise<PatternAnalysisResult> => {
  try {
    // Mock data for demonstration - in production, fetch from Firebase
    const mockReports: ReportData[] = [
      {
        id: '1',
        symptoms: ['fever', 'headache'],
        location: { lat: 14.5995, lng: 120.9842 },
        timestamp: new Date().toISOString(),
        barangay: 'Barangay 1',
        municipality: 'Manila',
        residentId: 'resident1'
      },
      {
        id: '2', 
        symptoms: ['cough', 'fever'],
        location: { lat: 14.6042, lng: 120.9822 },
        timestamp: new Date().toISOString(),
        barangay: 'Barangay 2',
        municipality: 'Manila',
        residentId: 'resident2'
      }
    ];
    
    return await patternAnalysisService.analyzePatterns(mockReports);
  } catch (error) {
    console.error('Error in analyzeHealthPatterns:', error);
    throw error;
  }
};
// Re-export types for backward compatibility
export type { 
  PatternAnalysisResult, 
  ClusterData, 
  DiseasePattern, 
  AnomalyData, 
  PredictionData, 
  ReportData 
} from '@/@types/services/patternAnalysis';