import { Clock, CheckCircle, User } from "lucide-react";

interface Visit {
  id: string;
  residentName: string;
  qrId: string;
  visitDate: any;
}

interface SavedAnalysis {
  id: string;
  patientUid: string;
  createdAt: any;
  reportDate: string;
}

interface StatsCardsProps {
  activeTab: 'visits' | 'analyses';
  visits: Visit[];
  savedAnalyses: SavedAnalysis[];
}

export default function StatsCards({ activeTab, visits, savedAnalyses }: StatsCardsProps) {
  const getTodayVisits = () => {
    return visits.filter(v => v.visitDate?.toDate?.()?.toDateString() === new Date().toDateString()).length;
  };

  const getThisWeekAnalyses = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return savedAnalyses.filter(a => {
      const analysisDate = a.createdAt?.toDate?.() || new Date(a.reportDate);
      return analysisDate >= weekAgo;
    }).length;
  };

  const getUniqueResidents = () => {
    return activeTab === 'visits' 
      ? new Set(visits.map(v => v.qrId)).size
      : new Set(savedAnalyses.map(a => a.patientUid)).size;
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2px] p-4 border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="bg-[#1B365D] p-3 rounded-[2px]">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total {activeTab === 'visits' ? 'Visits' : 'Analyses'}</p>
            <p className="text-2xl font-bold text-gray-900">{activeTab === 'visits' ? visits.length : savedAnalyses.length}</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[2px] p-4 border border-green-100">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-3 rounded-[2px]">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{activeTab === 'visits' ? 'Today' : 'This Week'}</p>
            <p className="text-2xl font-bold text-gray-900">
              {activeTab === 'visits' ? getTodayVisits() : getThisWeekAnalyses()}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[2px] p-4 border border-purple-100">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-3 rounded-[2px]">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Unique Residents</p>
            <p className="text-2xl font-bold text-gray-900">{getUniqueResidents()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}