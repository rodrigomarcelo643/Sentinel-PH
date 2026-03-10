import { Clock, Camera, User, Trash2 } from "lucide-react";

interface Visit {
  id: string;
  residentName: string;
  qrId: string;
  selfieUrl?: string;
  visitDate: any;
  scannedBy: string;
}

interface VisitsTableProps {
  visits: Visit[];
  loading: boolean;
  onDeleteVisit: (visitId: string) => void;
}

export default function VisitsTable({ visits, loading, onDeleteVisit }: VisitsTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-[2px] dark:border-gray-700 dark:bg-gray-800 shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#1B365D]" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Visits</h2>
        </div>
        <div className="p-12 text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1B365D] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="bg-white rounded-[2px] dark:bg-gray-800  shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#1B365D]" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white ">Recent Visits</h2>
        </div>
        <div className="p-12 text-center">
          <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Visits Yet</h3>
          <p className="text-gray-600">Start scanning QR codes to track resident visits.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2px] dark:border-gray-700 dark:bg-gray-800 shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700 border-gray-200 flex items-center gap-2">
        <Clock className="h-5 w-5 text-[#1B365D] dark:text-white" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Visits</h2>
      </div>
      
      <table className="w-full">
        <thead className="bg-gray-50 dark:border-gray-700 dark:bg-gray-900 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">
              Resident Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">
              QR ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">
              Visit Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">
              Scanned By
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-white uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {visits.map((visit) => (
            <tr key={visit.id} className="hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-900 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {visit.selfieUrl ? (
                    <img 
                      src={visit.selfieUrl} 
                      alt={visit.residentName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{visit.residentName}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-mono text-gray-700 dark:text-white">
                {visit.qrId}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-white">
                {visit.visitDate?.toDate?.()?.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) || 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-white">
                {visit.scannedBy}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onDeleteVisit(visit.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-[2px] transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}