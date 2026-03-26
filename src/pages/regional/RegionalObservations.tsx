import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, RadialBarChart, RadialBar, Legend, BarChart, Bar, CartesianGrid } from 'recharts';
import { TrendingUp, Users, Activity, AlertTriangle, Bell, X } from 'lucide-react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ObservationStats } from '@/@types';

export default function RegionalObservations() {
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNewCaseAlert, setShowNewCaseAlert] = useState(false);
  const previousReportCount = useRef<number>(0);
  const [stats, setStats] = useState<ObservationStats>({
    totalReports: 0,
    activeSentinels: 0,
    pendingCases: 0,
    verifiedCases: 0,
    trendData: [],
    symptomRadar: [],
    severityData: [],
    reportTypeData: [],
    topReporters: []
  });

  useEffect(() => {
    // Real-time clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Real-time data listener
    const unsubscribe = onSnapshot(collection(db, 'symptomReports'), (snapshot) => {
      const newCount = snapshot.size;
      console.log('🔔 Real-time update - Snapshot size:', newCount);
      console.log('🔔 Real-time update - Snapshot docs:', snapshot.docs);
      
      // Show alert if new report detected (after initial load)
      if (!loading && previousReportCount.current > 0 && newCount > previousReportCount.current) {
        setShowNewCaseAlert(true);
        
        // Auto-close after 1 minute
        setTimeout(() => {
          setShowNewCaseAlert(false);
        }, 60000);
      }
      
      previousReportCount.current = newCount;
      fetchObservationStats();
    });

    // Initial fetch
    fetchObservationStats();
    
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, []);

  const fetchObservationStats = async () => {
    try {
      console.log('🔍 Fetching observation stats...');
      const reportsRef = collection(db, 'symptomReports');
      const snapshot = await getDocs(reportsRef);
      
      console.log('📊 Snapshot size:', snapshot.size);
      console.log('📊 Snapshot docs:', snapshot.docs);
      
      const reports = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Document data:', data);
        return {
          id: doc.id,
          ...data
        } as any;
      });
      
      console.log('📊 Processed reports:', reports);
      console.log('📊 First report data:', reports[0]);
      
      // Calculate stats from all reports
      const pendingCases = reports.filter(r => (r as any).status === 'pending').length;
      const verifiedCases = reports.filter(r => (r as any).status === 'verified').length;
      const activeSentinels = reports.filter(r => (r as any).userId).length;
      
      // Generate trend data (last 7 days)
      const trendData: any[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayReports = reports.filter(r => {
          const reportDate = (r as any).createdAt?.toDate();
          return reportDate && reportDate.toDateString() === date.toDateString();
        });
        
        trendData.push({
          date: date.toLocaleDateString(),
          reports: dayReports.length,
          pending: dayReports.filter(r => (r as any).status === 'pending').length,
          verified: dayReports.filter(r => (r as any).status === 'verified').length
        });
      }

      // Symptom radar data
      const symptomCounts: Record<string, number> = {};
      reports.forEach(r => {
        (r as any).symptoms?.forEach((symptom: string) => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
      });

      const symptomRadar = Object.entries(symptomCounts)
        .slice(0, 6)
        .map(([symptom, count]) => ({
          symptom,
          count,
          fullMark: Math.max(...Object.values(symptomCounts))
        }));

      // Severity data
      const severityData = [
        { name: 'Low', value: reports.filter(r => ((r as any).symptoms?.length || 0) === 1).length, fill: '#10B981' },
        { name: 'Medium', value: reports.filter(r => ((r as any).symptoms?.length || 0) >= 2 && ((r as any).symptoms?.length || 0) < 4).length, fill: '#F59E0B' },
        { name: 'High', value: reports.filter(r => ((r as any).symptoms?.length || 0) >= 4).length, fill: '#DC2626' }
      ];

      // Report type data
      const reportTypeData: any[] = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayReports = reports.filter(r => {
          if ((r as any).createdAt) {
            const reportDate = (r as any).createdAt.toDate();
            return reportDate.toDateString() === date.toDateString();
          }
          return false;
        });
        
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          reports: dayReports.length,
          verified: dayReports.filter(r => (r as any).status === 'verified').length
        };
      });

      // Top reporters
      const reporterCounts: Record<string, number> = {};
      reports.forEach(r => {
        if ((r as any).userName) {
          reporterCounts[(r as any).userName] = (reporterCounts[(r as any).userName] || 0) + 1;
        }
      });

      const topReporters = Object.entries(reporterCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count, reports: count }));

      setStats({
        totalReports: reports.length,
        activeSentinels,
        pendingCases,
        verifiedCases,
        trendData,
        symptomRadar,
        severityData,
        reportTypeData,
        topReporters
      });
      
      console.log('🔄 About to set loading to false...');
      console.log('📊 Stats being set:', {
        totalReports: reports.length,
        activeSentinels,
        pendingCases,
        verifiedCases,
        trendData: trendData.length,
        symptomRadar: symptomRadar.length,
        severityData: severityData.length,
        reportTypeData: reportTypeData.length,
        topReporters: topReporters.length
      });
      
      setLoading(false);
      console.log(' Loading set to false');
    } catch (error) {
      console.error('Error fetching observation stats:', error);
    }
  };

  const CustomTooltip = ({ active, label, payload }: any) => {
    if (active && payload) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{`${label}: ${payload}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AnimatePresence>
        {showNewCaseAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-green-50 border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <span className="font-medium">New case report submitted</span>
              <button
                onClick={() => setShowNewCaseAlert(false)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1B365D] dark:text-white mb-2">Real-Time Statistics</h1>
            <p className="text-gray-600 dark:text-gray-400">Live monitoring of community health observations</p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <>
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
                  <div className="h-75 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                    <Activity className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Stats Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Reports</p>
                    <h3 className="text-3xl font-bold text-[#1B365D] dark:text-white">{stats.totalReports}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All submissions</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-[#1B365D] dark:text-blue-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Users</p>
                    <h3 className="text-3xl font-bold text-[#1B365D] dark:text-white">{stats.activeSentinels}</h3>
                    <p className="text-xs text-green-600 mt-1">Approved</p>
                  </div>
                  <div className="bg-green-50 dark:bg-gray-700 p-3 rounded-lg">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Cases</p>
                    <h3 className="text-3xl font-bold text-[#CE1126]">{stats.pendingCases}</h3>
                    <p className="text-xs text-red-600 mt-1">Awaiting review</p>
                  </div>
                  <div className="bg-red-50 dark:bg-gray-700 p-3 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-[#CE1126]" />
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">7-Day Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af" 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="reports" 
                      stroke="#1B365D" 
                      fill="#1B365D" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pending" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="verified" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Symptom Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={stats.symptomRadar}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis type="number" domain={[0, 100]} />
                    <PolarRadiusAxis />
                    <Radar 
                      name="symptom" 
                      dataKey="count" 
                      stroke="#1B365D" 
                      fill="#1B365D" 
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Severity Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={stats.severityData}>
                    <RadialBar dataKey="value" cornerRadius={10} fill="#8884d" />
                    <Legend iconSize={10} />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Report Types & Top Reporters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Types</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.reportTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1B365D" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Reporters</h3>
                <div className="space-y-3">
                  {stats.topReporters.map((reporter, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1B365D] rounded-full flex items-center justify-center text-white font-bold">
                          {reporter.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{reporter.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{reporter.reports} reports</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-[#1B365D]">{reporter.reports}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
