import React from 'react';
import { X, AlertTriangle, TrendingUp, MapPin, Activity, Users, Calendar, Shield, Brain, Megaphone } from 'lucide-react';
import { Button } from './button';
import type { PatternAnalysisResult } from '../../services/patternAnalysisService';
import { generateOutbreakAnnouncement, type OutbreakAnnouncementData } from '../../services/outbreakAnnouncementService';

interface PatternAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: PatternAnalysisResult | null;
  isLoading: boolean;
  onSaveOutbreakAlert?: (analysis: PatternAnalysisResult) => void;
  onCreateAnnouncement?: (announcementData: OutbreakAnnouncementData, analysisData: PatternAnalysisResult) => void;
}

export const PatternAnalysisModal: React.FC<PatternAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  isLoading,
  onSaveOutbreakAlert,
  onCreateAnnouncement
}) => {
  const [showLowRiskConfirm, setShowLowRiskConfirm] = React.useState(false);

  const saveOutbreakAlert = (analysis: PatternAnalysisResult) => {
    if (analysis.outbreakRisk === 'LOW') {
      setShowLowRiskConfirm(true);
    } else if (onSaveOutbreakAlert) {
      onSaveOutbreakAlert(analysis);
    }
  };

  const confirmLowRiskSave = () => {
    if (onSaveOutbreakAlert && analysis) {
      onSaveOutbreakAlert(analysis);
    }
    setShowLowRiskConfirm(false);
  };

  const handleCreateAnnouncement = () => {
    if (analysis && onCreateAnnouncement) {
      const announcementData = generateOutbreakAnnouncement(analysis);
      onCreateAnnouncement(announcementData, analysis);
    }
  };

  if (!isOpen) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskBorderColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'border-red-500';
      case 'HIGH': return 'border-orange-500';
      case 'MEDIUM': return 'border-yellow-500';
      case 'LOW': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-1 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Pattern Analysis Report</h2>
          <div className="flex items-center gap-3">
            {analysis && onCreateAnnouncement && (
              <button
                onClick={handleCreateAnnouncement}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Megaphone className="w-4 h-4" />
                <span>Create Announcement</span>
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Analyzing Health Patterns</h3>
                <p className="text-gray-600">Processing reports and detecting potential outbreaks...</p>
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-8">
              {/* Overview Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className={`p-4 rounded-lg border-2 ${getRiskBorderColor(analysis.outbreakRisk)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Outbreak Risk</p>
                      <p className={`text-2xl font-bold ${getRiskColor(analysis.outbreakRisk).split(' ')[0]}`}>
                        {analysis.outbreakRisk}
                      </p>
                    </div>
                    <AlertTriangle className={`w-8 h-8 ${getRiskColor(analysis.outbreakRisk).split(' ')[0]}`} />
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${analysis.outbreakRisk === 'CRITICAL' ? 'bg-red-500' : 
                          analysis.outbreakRisk === 'HIGH' ? 'bg-orange-500' :
                          analysis.outbreakRisk === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${(analysis.riskScore / 10) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Risk Score: {analysis.riskScore.toFixed(1)}/10</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Reports</p>
                      <p className="text-2xl font-bold text-blue-600">{analysis.totalReports}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Affected Residents</p>
                      <p className="text-2xl font-bold text-purple-600">{analysis.affectedResidents}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Clusters Found</p>
                      <p className="text-2xl font-bold text-green-600">{analysis.clusters.length}</p>
                    </div>
                    <MapPin className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Disease Patterns */}
              {analysis.diseases.length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                    Potential Disease Patterns
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.diseases.slice(0, 6).map((disease, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{disease.disease}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            disease.probability > 0.7 ? 'bg-red-100 text-red-800' :
                            disease.probability > 0.5 ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {(disease.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Affected: {disease.affectedCount} residents
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(disease.symptoms || []).slice(0, 3).map((symptom, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spatial Clusters */}
              {analysis.clusters.length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    Spatial Clusters (DBSCAN Analysis)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysis.clusters.map((cluster, index) => (
                      <div key={cluster.id} className={`p-4 border-2 rounded-lg ${getRiskBorderColor(cluster.riskLevel)}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">Cluster {index + 1}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(cluster.riskLevel)}`}>
                            {cluster.riskLevel}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Reports: {cluster.reportCount}</p>
                          <p>Residents: {cluster.residents}</p>
                          <p>Radius: {cluster.radius.toFixed(2)} km</p>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Dominant Symptoms:</p>
                          <div className="flex flex-wrap gap-1">
                            {cluster.dominantSymptoms.slice(0, 3).map((symptom, i) => (
                              <span key={i} className="px-1 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anomalies */}
              {analysis.anomalies.length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                    Detected Anomalies
                  </h3>
                  <div className="space-y-3">
                    {analysis.anomalies.slice(0, 5).map((anomaly, index) => (
                      <div key={index} className="p-3 border-l-4 border-orange-400 bg-orange-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{anomaly.type} Anomaly</p>
                            <p className="text-sm text-gray-700">{anomaly.description}</p>
                            {anomaly.location && (
                              <p className="text-xs text-gray-500 mt-1">Location: {anomaly.location}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-orange-500"
                                style={{ width: `${Math.min(anomaly.severity * 20, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Severity: {anomaly.severity.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predictions */}
              {analysis.predictions.length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                    Predictive Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.predictions.slice(0, 4).map((prediction, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{prediction.disease}</h4>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-medium">
                            {(prediction.confidence * 100).toFixed(1)}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Predicted cases: <span className="font-semibold">{prediction.predictedCases}</span> in {prediction.timeframe}
                        </p>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Prevention Measures:</p>
                          <ul className="text-xs text-gray-700 space-y-1">
                            {prediction.preventionMeasures.slice(0, 3).map((measure, i) => (
                              <li key={i} className="flex items-center">
                                <Shield className="w-3 h-3 mr-1 text-green-600" />
                                {measure}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              {analysis.aiRecommendations && analysis.aiRecommendations.length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-600" />
                    AI-Powered Recommendations
                  </h3>
                  <div className="space-y-3">
                    {analysis.aiRecommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Recommendations */}
              {analysis.outbreakRisk === 'LOW' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-blue-800 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Monitoring Recommended
                    </h3>
                    <Button
                      onClick={() => saveOutbreakAlert(analysis)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      Save for Monitoring
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2">Recommended Actions:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Continue routine surveillance</li>
                        <li>• Monitor for symptom pattern changes</li>
                        <li>• Maintain community health education</li>
                        <li>• Regular follow-up with affected residents</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2">Contact Information:</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>Municipal Health Office: (02) 123-4567</p>
                        <p>DOH Hotline: 1555</p>
                        <p>Emergency Response: 911</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-red-800 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Immediate Action Required
                    </h3>
                    <Button
                      onClick={() => saveOutbreakAlert(analysis)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                    >
                      Save as Outbreak Alert
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">Recommended Actions:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Alert municipal health officer immediately</li>
                        <li>• Increase surveillance in identified clusters</li>
                        <li>• Deploy rapid response teams</li>
                        <li>• Issue community health advisories</li>
                        <li>• Coordinate with DOH regional office</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">Contact Information:</h4>
                      <div className="text-sm text-red-700 space-y-1">
                        <p>Municipal Health Office: (02) 123-4567</p>
                        <p>DOH Hotline: 1555</p>
                        <p>Emergency Response: 911</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No analysis data available</p>
            </div>
          )}
        </div>

        {/* Low Risk Confirmation Dialog */}
        {showLowRiskConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Low Risk Alert</h3>
              <p className="text-gray-600 mb-4">
                The analysis shows LOW outbreak risk. Are you sure you want to save this as a monitoring alert?
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowLowRiskConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmLowRiskSave}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Yes, Save for Monitoring
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};