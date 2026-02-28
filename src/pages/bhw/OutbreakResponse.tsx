import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, Users, MapPin, Clock, CheckCircle, XCircle, Send, Activity } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface OutbreakAlert {
  id: string;
  disease: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  cases: number;
  residents: string[];
  trend: 'increasing' | 'stable' | 'decreasing';
  detectedAt: any;
  status: 'pending' | 'ongoing' | 'resolved';
  respondedAt?: any;
  respondedBy?: string;
}

export default function OutbreakResponse() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<OutbreakAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'ongoing' | 'resolved'>('pending');
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; alertId: string; action: 'respond' | 'resolve' }>({ show: false, alertId: '', action: 'respond' });

  useEffect(() => {
    fetchOutbreakAlerts();
  }, []);

  const fetchOutbreakAlerts = async () => {
    try {
      // Check if outbreaks collection exists, if not analyze and create
      const outbreaksRef = collection(db, 'outbreaks');
      const outbreaksSnapshot = await getDocs(outbreaksRef);
      
      if (outbreaksSnapshot.empty) {
        // Analyze symptom reports for patterns
        const reportsRef = collection(db, 'symptomReports');
        const snapshot = await getDocs(reportsRef);
        const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Group by symptoms and location
        const patterns: Record<string, any> = {};
        reports.forEach((report: any) => {
          report.symptoms?.forEach((symptom: string) => {
            const key = `${symptom}-${report.location}`;
            if (!patterns[key]) {
              patterns[key] = {
                symptom,
                location: report.location,
                cases: 0,
                residents: [],
                recentCases: 0,
                reports: []
              };
            }
            patterns[key].cases++;
            patterns[key].residents.push(report.userName);
            patterns[key].reports.push(report);
            
            // Count recent cases (last 7 days)
            if (report.createdAt) {
              const reportDate = report.createdAt.toDate();
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              if (reportDate >= weekAgo) {
                patterns[key].recentCases++;
              }
            }
          });
        });

        // Create outbreak records for patterns with 3+ cases
        const potentialOutbreaks = Object.values(patterns).filter((p: any) => p.cases >= 3);
        for (const outbreak of potentialOutbreaks) {
          await addDoc(outbreaksRef, {
            disease: outbreak.symptom,
            location: outbreak.location,
            severity: outbreak.cases >= 10 ? 'high' : outbreak.cases >= 5 ? 'medium' : 'low',
            cases: outbreak.cases,
            residents: outbreak.residents,
            trend: outbreak.recentCases > outbreak.cases / 2 ? 'increasing' : 'stable',
            detectedAt: serverTimestamp(),
            status: 'pending'
          });
        }
      }

      // Fetch all outbreaks
      const finalSnapshot = await getDocs(outbreaksRef);
      const data = finalSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OutbreakAlert[];
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching outbreak alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (alertId: string) => {
    setConfirmDialog({ show: true, alertId, action: 'respond' });
  };

  const handleResolve = async (alertId: string) => {
    setConfirmDialog({ show: true, alertId, action: 'resolve' });
  };

  const confirmAction = async () => {
    try {
      const alertRef = doc(db, 'outbreaks', confirmDialog.alertId);
      if (confirmDialog.action === 'respond') {
        await updateDoc(alertRef, {
          status: 'ongoing',
          respondedAt: serverTimestamp(),
          respondedBy: user?.displayName || 'BHW'
        });
      } else {
        await updateDoc(alertRef, {
          status: 'resolved',
          resolvedAt: serverTimestamp()
        });
      }
      setConfirmDialog({ show: false, alertId: '', action: 'respond' });
      fetchOutbreakAlerts();
    } catch (error) {
      console.error('Error updating outbreak:', error);
    }
  };

  const filteredAlerts = alerts.filter(a => a.status === activeTab);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'increasing' ? <TrendingUp className="h-4 w-4 text-red-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 rounded-sm p-6 shadow-sm border border-red-100">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-red-500 to-orange-600 p-3 rounded-sm shadow-sm">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1B365D] mb-1">Outbreak Response</h1>
              <p className="text-gray-600 text-sm">Pattern analysis and outbreak detection system</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setConfirmDialog({ show: false, alertId: '', action: 'respond' })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-sm shadow-lg max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Action</h3>
              <p className="text-gray-600 mb-6">
                {confirmDialog.action === 'respond'
                  ? 'Are you sure you want to respond to this outbreak? This will mark it as ongoing.'
                  : 'Are you sure you want to mark this outbreak as resolved?'}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmDialog({ show: false, alertId: '', action: 'respond' })}
                  className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-4 py-2 text-white rounded-sm transition-colors ${
                    confirmDialog.action === 'respond' ? 'bg-[#1B365D] hover:bg-[#152a4a]' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <>
          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                    <div className="h-8 bg-gray-300 rounded w-12"></div>
                  </div>
                  <Activity className="h-12 w-12 text-gray-200" />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs Skeleton */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 mb-6">
            <div className="flex border-b">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-1 px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-sm shadow-sm border-l-4 border-l-gray-300 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-sm shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <h3 className="text-3xl font-bold text-yellow-600">{alerts.filter(a => a.status === 'pending').length}</h3>
                </div>
                <Clock className="h-12 w-12 text-yellow-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-sm shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ongoing</p>
                  <h3 className="text-3xl font-bold text-orange-600">{alerts.filter(a => a.status === 'ongoing').length}</h3>
                </div>
                <AlertTriangle className="h-12 w-12 text-orange-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-sm shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resolved</p>
                  <h3 className="text-3xl font-bold text-green-600">{alerts.filter(a => a.status === 'resolved').length}</h3>
                </div>
                <CheckCircle className="h-12 w-12 text-green-200" />
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative ${
                  activeTab === 'pending'
                    ? 'text-yellow-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Pending ({alerts.filter(a => a.status === 'pending').length})
                {activeTab === 'pending' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('ongoing')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative ${
                  activeTab === 'ongoing'
                    ? 'text-orange-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Ongoing ({alerts.filter(a => a.status === 'ongoing').length})
                {activeTab === 'ongoing' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('resolved')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative ${
                  activeTab === 'resolved'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Resolved ({alerts.filter(a => a.status === 'resolved').length})
                {activeTab === 'resolved' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Outbreak Alerts */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="bg-white p-12 rounded-sm shadow-sm border border-gray-100 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Outbreaks Detected</h3>
                <p className="text-gray-600">The system is monitoring for patterns. All clear for now.</p>
              </div>
            ) : (
              filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-sm shadow-sm border-l-4 ${
                    alert.severity === 'high' ? 'border-l-red-500' :
                    alert.severity === 'medium' ? 'border-l-orange-500' : 'border-l-yellow-500'
                  }"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{alert.disease}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(alert.trend)}
                          <span className="text-xs text-gray-600">{alert.trend}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{alert.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{alert.cases} cases</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Detected {alert.detectedAt?.toDate?.()?.toLocaleDateString() || 'today'}</span>
                        </div>
                      </div>
                      
                      {/* Residents List */}
                      <div className="bg-blue-50 p-4 rounded-sm mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Affected Residents ({alert.residents?.length || 0}):</h4>
                        <div className="flex flex-wrap gap-2">
                          {alert.residents?.slice(0, 10).map((resident, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white text-gray-700 text-xs rounded-sm border border-gray-200">
                              {resident}
                            </span>
                          ))}
                          {alert.residents?.length > 10 && (
                            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-sm font-medium">
                              +{alert.residents.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="ml-4">
                      {alert.status === 'pending' && (
                        <button
                          onClick={() => handleRespond(alert.id)}
                          className="flex items-center gap-2 bg-[#1B365D] text-white px-4 py-2 rounded-sm hover:bg-[#152a4a] transition-colors"
                        >
                          <Send className="h-4 w-4" />
                          <span>Respond</span>
                        </button>
                      )}
                      {alert.status === 'ongoing' && (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-sm hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommended Actions:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Alert local health authorities immediately</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Conduct contact tracing in affected area</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Issue health advisory to residents</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Monitor for additional cases</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
