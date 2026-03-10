import { Brain, Eye, Trash2 } from "lucide-react";

interface SavedAnalysis {
  id: string;
  patientUid: string;
  patientName: string;
  patientLocation: string;
  analysisResult: {
    riskLevel: string;
    riskPercentage: number;
    potentialConditions?: any[];
    recommendations?: any[];
    specialistRecommendations?: any[];
    trends?: any;
    summary: string;
  };
  selfReportsCount: number;
  observedReportsCount: number;
  totalReports: number;
  analyzedBy: string;
  createdAt: any;
  reportDate: string;
}

interface AnalysesTableProps {
  savedAnalyses: SavedAnalysis[];
  loading: boolean;
  onViewAnalysis: (analysis: SavedAnalysis) => void;
  onDeleteAnalysis: (analysisId: string) => void;
}

export default function AnalysesTable({ savedAnalyses, loading, onViewAnalysis, onDeleteAnalysis }: AnalysesTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-[2px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#1B365D]" />
          <h2 className="text-lg font-semibold text-gray-900">Saved AI Analyses</h2>
        </div>
        <div className="p-12 text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1B365D] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (savedAnalyses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-[2px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#1B365D]" />
          <h2 className="text-lg font-semibold text-gray-900">Saved AI Analyses</h2>
        </div>
        <div className="p-12 text-center">
          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Analyses Yet</h3>
          <p className="text-gray-600">AI analyses will appear here after scanning and analyzing resident data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2px] dark:bg-gray-800 dark:border-gray-700  shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border dark:border-gray-700 border-gray-200 flex items-center gap-2">
        <Brain className="h-5 w-5 text-[#1B365D] dark:text-white" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Saved AI Analyses</h2>
      </div>
      
      <table className="w-full">
        <thead className="bg-gray-50 border dark:bg-gray-900 dark:border-gray-700 border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700  dark:text-white uppercase tracking-wider">
              Patient Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">
              Risk Level
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">
              Reports
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">
              Analysis Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">
              Analyzed By
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {savedAnalyses.map((analysis) => (
            <tr key={analysis.id} className="hover:bg-gray-50  dark:hover:bg-gray-900 transition-colors">
              <td className="px-6 py-4">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white ">{analysis.patientName}</span>
                  <p className="text-xs text-gray-500 dark:text-white">{analysis.patientLocation}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  analysis.analysisResult.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                  analysis.analysisResult.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                  analysis.analysisResult.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {analysis.analysisResult.riskLevel.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {analysis.selfReportsCount} Self
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {analysis.observedReportsCount} Observed
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {analysis.createdAt?.toDate?.()?.toLocaleDateString() || analysis.reportDate}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {analysis.analyzedBy}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onViewAnalysis(analysis)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-[2px] transition-colors cursor-pointer"
                    title="View Analysis"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteAnalysis(`analysis_${analysis.id}`)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-[2px] transition-colors cursor-pointer"
                    title="Delete Analysis"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}