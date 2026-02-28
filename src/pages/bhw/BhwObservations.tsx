import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, RadialBarChart, RadialBar, Legend, BarChart, Bar, CartesianGrid, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Activity, AlertTriangle, CheckCircle, Bell, X, UserCheck } from 'lucide-react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function BhwObservations() {
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNewCaseAlert, setShowNewCaseAlert] = useState(false);
  const previousReportCount = useRef<number>(0);
  const [stats, setStats] = useState({
    totalReports: 0,
    activeSentinels: 0,
    pendingCases: 0,
    verifiedCases: 0,
    trendData: [] as any[],
    symptomRadar: [] as any[],
    severityData: [] as any[],
    reportTypeData: [] as any[],
    topReporters: [] as any[]
  });

  useEffect(() => {
    // Real-time clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Real-time data listener
    const unsubscribe = onSnapshot(collection(db, 'symptomReports'), (snapshot) => {
      const newCount = snapshot.size;
      
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

    fetchObservationStats();
    
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [loading]);

  const fetchObservationStats = async () => {
    try {
      // Fetch symptom reports
      const reportsRef = collection(db, 'symptomReports');
      const reportsSnapshot = await getDocs(reportsRef);
      const reports = reportsSnapshot.docs.map(doc => doc.data());

      // Fetch sentinels
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const sentinels = usersSnapshot.docs.filter(doc => doc.data().communityRole && doc.data().status === 'approved');

      // Calculate stats
      const pending = reports.filter(r => r.status === 'pending').length;
      const verified = reports.filter(r => r.status === 'verified').length;

      // Trend data (last 7 days) with repetition patterns
      const trendData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayReports = reports.filter(r => {
          if (r.createdAt) {
            const reportDate = r.createdAt.toDate();
            return reportDate.toDateString() === date.toDateString();
          }
          return false;
        });
        
        // Calculate repeat reporters (users who reported multiple times)
        const userReportCounts: Record<string, number> = {};
        dayReports.forEach(r => {
          if (r.userId) {
            userReportCounts[r.userId] = (userReportCounts[r.userId] || 0) + 1;
          }
        });
        const repeatReports = Object.values(userReportCounts).filter(count => count > 1).length;
        
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          reports: dayReports.length,
          verified: dayReports.filter(r => r.status === 'verified').length,
          repeats: repeatReports
        };
      });

      // Symptom radar data
      const symptomCounts: Record<string, number> = {};
      reports.forEach(r => {
        r.symptoms?.forEach((symptom: string) => {
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
        { name: 'Low', value: reports.filter(r => (r.symptoms?.length || 0) === 1).length, fill: '#10B981' },
        { name: 'Medium', value: reports.filter(r => (r.symptoms?.length || 0) >= 2 && (r.symptoms?.length || 0) < 4).length, fill: '#F59E0B' },
        { name: 'High', value: reports.filter(r => (r.symptoms?.length || 0) >= 4).length, fill: '#DC2626' }
      ];

      // Self-Reported vs Observed (over 7 days)
      const reportTypeData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayReports = reports.filter(r => {
          if (r.createdAt) {
            const reportDate = r.createdAt.toDate();
            return reportDate.toDateString() === date.toDateString();
          }
          return false;
        });
        
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          selfReported: dayReports.filter(r => r.reportType === 'self' || !r.reportType).length,
          observed: dayReports.filter(r => r.reportType === 'observed').length
        };
      });

      // Top Reporters
      const reporterCounts: Record<string, { name: string; count: number }> = {};
      reports.forEach(r => {
        if (r.userId && r.userName) {
          if (!reporterCounts[r.userId]) {
            reporterCounts[r.userId] = { name: r.userName, count: 0 };
          }
          reporterCounts[r.userId].count++;
        }
      });
      const topReporters = Object.values(reporterCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(r => ({ name: r.name.split(' ')[0], reports: r.count }));

      setStats({
        totalReports: reports.length,
        activeSentinels: sentinels.length,
        pendingCases: pending,
        verifiedCases: verified,
        trendData,
        symptomRadar,
        severityData,
        reportTypeData,
        topReporters
      });
    } catch (error) {
      console.error('Error fetching observation stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      {/* New Case Alert */}
      <AnimatePresence>
        {showNewCaseAlert && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md"
          >
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <Bell className="relative h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg">New Case Detected!</h4>
              <p className="text-sm text-green-50">A new symptom report has been submitted</p>
            </div>
            <button
              onClick={() => setShowNewCaseAlert(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1B365D] mb-2">Real-Time Statistics</h1>
            <p className="text-gray-600">Live monitoring of community health observations</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <>
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                    <div className="h-10 bg-gray-300 rounded w-16"></div>
                  </div>
                  <Activity className="h-12 w-12 text-gray-200" />
                </div>
              </div>
            ))}
          </div>

          {/* Trend Chart Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="h-[300px] bg-gray-100 rounded flex items-center justify-center">
              <Activity className="h-16 w-16 text-gray-300" />
            </div>
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="h-[300px] bg-gray-100 rounded flex items-center justify-center">
                  <Activity className="h-16 w-16 text-gray-300" />
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
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                  <h3 className="text-3xl font-bold text-[#1B365D]">{stats.totalReports}</h3>
                  <p className="text-xs text-gray-500 mt-1">All submissions</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-[#1B365D]" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Sentinels</p>
                  <h3 className="text-3xl font-bold text-[#1B365D]">{stats.activeSentinels}</h3>
                  <p className="text-xs text-green-600 mt-1">Approved</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Cases</p>
                  <h3 className="text-3xl font-bold text-[#CE1126]">{stats.pendingCases}</h3>
                  <p className="text-xs text-red-600 mt-1">Awaiting review</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-[#CE1126]" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Verified Cases</p>
                  <h3 className="text-3xl font-bold text-[#1B365D]">{stats.verifiedCases}</h3>
                  <p className="text-xs text-green-600 mt-1">Confirmed</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Trend Area Chart - First */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">7-Day Trend Analysis</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <span>Live</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.trendData}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRepeats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Area type="monotone" dataKey="reports" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorReports)" name="Total Reports" />
                <Area type="monotone" dataKey="verified" stroke="#10b981" fillOpacity={1} fill="url(#colorVerified)" name="Verified" />
                <Area type="monotone" dataKey="repeats" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRepeats)" name="Repeat Patterns" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Symptom Radar Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Symptom Distribution</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <span>Live</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={stats.symptomRadar}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="symptom" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                  <Radar name="Cases" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Severity Radial Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Severity Breakdown</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <span>Live</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart 
                  innerRadius="10%" 
                  outerRadius="90%" 
                  data={stats.severityData} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={10} />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* New Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Self-Reported vs Observed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Self-Reported vs Observed</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <span>Live</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.reportTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="selfReported" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Self-Reported" />
                  <Line type="monotone" dataKey="observed" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="Observed" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Most Active Reporters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Most Active Reporters</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <span>Live</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topReporters}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="reports" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
