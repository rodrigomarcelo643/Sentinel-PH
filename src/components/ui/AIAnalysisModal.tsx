import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  X, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Stethoscope,
  Clock,
  Activity,
  Target,
  Shield,
  Zap,
  Save
} from 'lucide-react';
import { aiAnalysisService } from '@/services/aiAnalysisService';
import type { AIAnalysisResult, SymptomReport } from '@/services/aiAnalysisService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AIAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selfReports: SymptomReport[];
  observedReports: SymptomReport[];
  patientInfo: {
    name: string;
    uid: string;
    age?: number;
    gender?: string;
    location?: string;
  };
}

export default function AIAnalysisModal({
  open,
  onOpenChange,
  selfReports,
  observedReports,
  patientInfo
}: AIAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const saveAnalysis = async () => {
    if (!analysis || !user) return;
    
    setSaving(true);
    try {
      await addDoc(collection(db, 'aiAnalysisReports'), {
        patientUid: patientInfo.uid,
        patientName: patientInfo.name,
        patientLocation: patientInfo.location,
        analysisResult: analysis,
        selfReportsCount: selfReports.length,
        observedReportsCount: observedReports.length,
        totalReports: selfReports.length + observedReports.length,
        analyzedBy: user.displayName || 'BHW',
        analyzedByUid: user.uid,
        createdAt: serverTimestamp(),
        reportDate: new Date().toISOString().split('T')[0]
      });
      
      toast({
        title: 'Analysis Saved',
        description: 'AI analysis report has been saved successfully.',
      });
      
      // Close the modal after saving
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save analysis report.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };
  const handleModalClose = (open: boolean) => {
    if (!open) {
      // Reset states when modal closes
      setAnalysis(null);
      setLoading(false);
      setProgress(0);
      setSaving(false);
    }
    onOpenChange(open);
  };
  useEffect(() => {
    if (open && (selfReports.length > 0 || observedReports.length > 0)) {
      performAnalysis();
    }
  }, [open, selfReports, observedReports]);

  const performAnalysis = async () => {
    setLoading(true);
    setProgress(0);
    setAnalysis(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const result = await aiAnalysisService.analyzeSymptomReports(
        selfReports,
        observedReports,
        patientInfo
      );

      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setAnalysis(result);
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error('Analysis failed:', error);
      setLoading(false);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to complete AI analysis. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'routine': return 'text-blue-600 bg-blue-100';
      case 'urgent': return 'text-orange-600 bg-orange-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trends: AIAnalysisResult['trends']) => {
    if (trends.improving) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trends.worsening) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto p-0 dark:bg-gray-800">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">AI Health Analysis</DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">Patient: {patientInfo.name}</p>
            </div>
          </div>
          <Button onClick={() => handleModalClose(false)} variant="ghost" size="icon" className="dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-800"></div>
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Health Analysis in Progress</h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md text-center">
                  Advanced AI algorithms are analyzing symptom patterns, medical correlations, and generating personalized health insights...
                </p>
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>🧠 Processing {selfReports.length + observedReports.length} symptom reports</p>
                  <p>🎯 Identifying potential conditions</p>
                  <p>💡 Generating recommendations</p>
                </div>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Risk Assessment Header */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-6 border border-purple-100 dark:border-purple-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Risk Assessment</h3>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getRiskColor(analysis.riskLevel)}`}>
                    {analysis.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="35" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke={analysis.riskLevel === 'critical' ? '#dc2626' : 
                                 analysis.riskLevel === 'high' ? '#ea580c' :
                                 analysis.riskLevel === 'medium' ? '#d97706' : '#16a34a'}
                          strokeWidth="10"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 35}`}
                          strokeDashoffset={`${2 * Math.PI * 35 * (1 - analysis.riskPercentage / 100)}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{analysis.riskPercentage}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Overall Risk</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getTrendIcon(analysis.trends)}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{analysis.trends.pattern}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Health Trend</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {selfReports.length + observedReports.length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Reports</p>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Potential Conditions */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-red-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Potential Conditions</h4>
                    </div>
                    <div className="space-y-3">
                      {analysis.potentialConditions.map((condition, index) => (
                        <div key={index} className="border dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">{condition.condition}</h5>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              condition.severity === 'severe' ? 'bg-red-100 text-red-800' :
                              condition.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {condition.severity}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${condition.probability}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{condition.probability}% probability</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Recommendations</h4>
                    </div>
                    <div className="space-y-3">
                      {analysis.recommendations
                        .sort((a, b) => a.priority - b.priority)
                        .map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                          <div className={`p-1 rounded-full ${
                            rec.type === 'immediate' ? 'bg-red-100 dark:bg-red-900/30' :
                            rec.type === 'followup' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            {rec.type === 'immediate' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                             rec.type === 'followup' ? <Clock className="h-4 w-4 text-yellow-600" /> :
                             <Activity className="h-4 w-4 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                rec.type === 'immediate' ? 'bg-red-100 text-red-800' :
                                rec.type === 'followup' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {rec.type}
                              </span>
                              <span className="text-xs text-gray-500">Priority {rec.priority}</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{rec.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Specialist Recommendations */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Stethoscope className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold text-gray-900">Specialist Recommendations</h4>
                    </div>
                    <div className="space-y-3">
                      {analysis.specialistRecommendations.map((spec, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">{spec.specialty}</h5>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(spec.urgency)}`}>
                              {spec.urgency}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{spec.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">AI Summary</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
                  </div>

                  {/* Report Distribution Chart */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Report Distribution</h4>
                    
                    {/* Donut Chart */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                          {(() => {
                            const total = selfReports.length + observedReports.length;
                            if (total === 0) return null;
                            
                            const selfPercentage = (selfReports.length / total) * 100;
                            const observedPercentage = (observedReports.length / total) * 100;
                            
                            const radius = 35;
                            const circumference = 2 * Math.PI * radius;
                            const selfStroke = (selfPercentage / 100) * circumference;
                            const observedStroke = (observedPercentage / 100) * circumference;
                            
                            return (
                              <>
                                {/* Background circle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r={radius}
                                  fill="none"
                                  stroke="#f3f4f6"
                                  strokeWidth="12"
                                />
                                
                                {/* Self reports arc */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r={radius}
                                  fill="none"
                                  stroke="#3b82f6"
                                  strokeWidth="12"
                                  strokeLinecap="round"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={circumference - selfStroke}
                                  className="transition-all duration-500"
                                />
                                
                                {/* Observed reports arc */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r={radius}
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="12"
                                  strokeLinecap="round"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={circumference - selfStroke - observedStroke}
                                  className="transition-all duration-500"
                                />
                              </>
                            );
                          })()}
                        </svg>
                        
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-bold text-gray-900">
                            {selfReports.length + observedReports.length}
                          </span>
                          <span className="text-xs text-gray-500">Total</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Legend and Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Self-Reported</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{selfReports.length}</div>
                          <div className="text-xs text-gray-500">
                            {selfReports.length + observedReports.length > 0 
                              ? Math.round((selfReports.length / (selfReports.length + observedReports.length)) * 100)
                              : 0}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Observed</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{observedReports.length}</div>
                          <div className="text-xs text-gray-500">
                            {selfReports.length + observedReports.length > 0 
                              ? Math.round((observedReports.length / (selfReports.length + observedReports.length)) * 100)
                              : 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bar Chart */}
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Report Comparison</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-16">Self</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${selfReports.length + observedReports.length > 0 
                                  ? (selfReports.length / Math.max(selfReports.length, observedReports.length, 1)) * 100
                                  : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700 w-8">{selfReports.length}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-16">Observed</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-green-500 h-3 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${selfReports.length + observedReports.length > 0 
                                  ? (observedReports.length / Math.max(selfReports.length, observedReports.length, 1)) * 100
                                  : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700 w-8">{observedReports.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={performAnalysis}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Re-analyze
                </Button>
                <Button 
                  onClick={saveAnalysis}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Report'}
                </Button>
                <Button variant="outline" onClick={() => handleModalClose(false)}>
                  Close Analysis
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Analysis Available</h3>
              <p className="text-gray-600 dark:text-gray-300">No symptom reports found to analyze.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}