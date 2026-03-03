import type { PatternAnalysisResult } from './patternAnalysisService';

export interface OutbreakAnnouncementData {
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export const generateOutbreakAnnouncement = (analysis: PatternAnalysisResult): OutbreakAnnouncementData => {
  const { outbreakRisk, diseases } = analysis;
  
  // Determine priority based on risk level
  const priority = outbreakRisk === 'CRITICAL' ? 'high' : 
                  outbreakRisk === 'HIGH' ? 'high' :
                  outbreakRisk === 'MEDIUM' ? 'medium' : 'low';

  // Get primary disease
  const primaryDisease = diseases[0]?.disease || 'Unknown Health Pattern';
  
  // Generate title based on risk level and disease
  const title = outbreakRisk === 'CRITICAL' 
    ? `🚨 CRITICAL HEALTH ALERT: ${primaryDisease} Outbreak Detected`
    : outbreakRisk === 'HIGH'
    ? `⚠️ HIGH PRIORITY: ${primaryDisease} Cases Increasing`
    : outbreakRisk === 'MEDIUM'
    ? `📢 HEALTH ADVISORY: ${primaryDisease} Pattern Detected`
    : `ℹ️ HEALTH UPDATE: ${primaryDisease} Monitoring`;

  // Generate detailed message
  const message = generateDetailedMessage(analysis, primaryDisease);

  // Generate recommendations
  const recommendations = generateRecommendations(analysis);

  return {
    title,
    message,
    type: 'outbreak_alert',
    priority,
    recommendations
  };
};

const generateDetailedMessage = (analysis: PatternAnalysisResult, primaryDisease: string): string => {
  const { outbreakRisk, totalReports, affectedResidents, clusters, diseases } = analysis;
  
  let message = `Dear Residents,\n\n`;
  
  // Risk level introduction
  if (outbreakRisk === 'CRITICAL') {
    message += `🚨 IMMEDIATE ACTION REQUIRED: Our health monitoring system has detected a CRITICAL outbreak pattern in our community.\n\n`;
  } else if (outbreakRisk === 'HIGH') {
    message += `⚠️ URGENT ATTENTION: Our health monitoring system has identified a HIGH-RISK health pattern requiring immediate attention.\n\n`;
  } else if (outbreakRisk === 'MEDIUM') {
    message += `📢 HEALTH ADVISORY: Our community health monitoring has detected patterns that require your attention and preventive action.\n\n`;
  } else {
    message += `ℹ️ HEALTH UPDATE: Our monitoring system has identified health patterns in the community that we're closely watching.\n\n`;
  }

  // Key statistics
  message += `📊 CURRENT SITUATION:\n`;
  message += `• Primary Health Concern: ${primaryDisease}\n`;
  message += `• Total Reports: ${totalReports}\n`;
  message += `• Affected Residents: ${affectedResidents}\n`;
  message += `• Geographic Clusters: ${clusters.length}\n`;
  
  // Additional diseases if present
  if (diseases.length > 1) {
    message += `• Related Symptoms: ${diseases.slice(1, 3).map(d => d.disease).join(', ')}\n`;
  }
  
  message += `\n`;

  // Risk-specific messaging
  if (outbreakRisk === 'CRITICAL' || outbreakRisk === 'HIGH') {
    message += `🏥 IMMEDIATE ACTIONS REQUIRED:\n`;
    message += `• Seek medical attention if you have symptoms\n`;
    message += `• Avoid crowded areas and practice social distancing\n`;
    message += `• Report any symptoms immediately to your BHW\n`;
    message += `• Follow all health protocols strictly\n\n`;
  } else {
    message += `🛡️ PREVENTIVE MEASURES:\n`;
    message += `• Monitor your health and family members\n`;
    message += `• Practice good hygiene and sanitation\n`;
    message += `• Report any concerning symptoms to your BHW\n`;
    message += `• Stay informed through official health updates\n\n`;
  }

  message += `📞 EMERGENCY CONTACTS:\n`;
  message += `• Barangay Health Worker: [Contact Number]\n`;
  message += `• Municipal Health Office: [Contact Number]\n`;
  message += `• Emergency Hotline: 911\n\n`;

  message += `Stay safe and vigilant. Together, we can protect our community's health.\n\n`;
  message += `- Your Barangay Health Team`;

  return message;
};

const generateRecommendations = (analysis: PatternAnalysisResult): string[] => {
  const { outbreakRisk, diseases } = analysis;
  const recommendations: string[] = [];

  // Risk-based recommendations
  if (outbreakRisk === 'CRITICAL') {
    recommendations.push(
      'Activate emergency response protocols immediately',
      'Contact municipal and provincial health authorities',
      'Implement community quarantine measures if necessary',
      'Deploy medical teams to affected areas',
      'Set up isolation facilities for confirmed cases'
    );
  } else if (outbreakRisk === 'HIGH') {
    recommendations.push(
      'Alert all health authorities and stakeholders',
      'Increase surveillance in affected areas',
      'Deploy additional health workers to hotspots',
      'Prepare isolation and treatment facilities',
      'Conduct mass health education campaigns'
    );
  } else if (outbreakRisk === 'MEDIUM') {
    recommendations.push(
      'Monitor situation closely for 48-72 hours',
      'Increase community health worker visits',
      'Conduct targeted health education',
      'Prepare contingency response plans',
      'Coordinate with neighboring barangays'
    );
  } else {
    recommendations.push(
      'Continue routine monitoring and surveillance',
      'Maintain preventive health measures',
      'Keep community informed of developments',
      'Review and update response protocols',
      'Document patterns for trend analysis'
    );
  }

  // Disease-specific recommendations
  const primaryDisease = diseases[0]?.disease?.toLowerCase() || '';
  
  if (primaryDisease.includes('fever') || primaryDisease.includes('dengue')) {
    recommendations.push(
      'Intensify vector control and cleanup campaigns',
      'Eliminate stagnant water sources',
      'Distribute mosquito nets and repellents'
    );
  } else if (primaryDisease.includes('diarrhea') || primaryDisease.includes('gastro')) {
    recommendations.push(
      'Ensure safe water supply and sanitation',
      'Promote proper food handling practices',
      'Distribute ORS packets to affected households'
    );
  } else if (primaryDisease.includes('respiratory') || primaryDisease.includes('cough')) {
    recommendations.push(
      'Promote mask-wearing and respiratory hygiene',
      'Ensure proper ventilation in public spaces',
      'Limit large gatherings if necessary'
    );
  }

  return recommendations;
};

export const getAnnouncementTypeFromRisk = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'CRITICAL':
    case 'HIGH':
      return 'outbreak_alert';
    case 'MEDIUM':
      return 'health_advisory';
    default:
      return 'health_advisory';
  }
};

export const formatAnnouncementForDisplay = (data: OutbreakAnnouncementData): string => {
  let formatted = data.message;
  
  if (data.recommendations.length > 0) {
    formatted += `\n\n🎯 KEY RECOMMENDATIONS:\n`;
    data.recommendations.slice(0, 5).forEach((rec, index) => {
      formatted += `${index + 1}. ${rec}\n`;
    });
  }
  
  return formatted;
};