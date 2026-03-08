import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, Bell, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, getDocs, query, where, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PatternAnalysisModal } from '@/components/ui/PatternAnalysisModal';
import { type PatternAnalysisResult } from '@/services/patternAnalysisService';
import { type OutbreakAnnouncementData } from '@/services/outbreakAnnouncementService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showAnnouncementCreatedToast } from '@/services/toastService';

const observationData = [
  { day: 'Mon', observations: 12, verified: 10 },
  { day: 'Tue', observations: 15, verified: 13 },
  { day: 'Wed', observations: 18, verified: 16 },
  { day: 'Thu', observations: 22, verified: 20 },
  { day: 'Fri', observations: 19, verified: 17 },
  { day: 'Sat', observations: 14, verified: 12 },
  { day: 'Sun', observations: 16, verified: 14 },
];

const symptomData = [
  { name: 'Fever', value: 35 },
  { name: 'Cough', value: 28 },
  { name: 'Diarrhea', value: 18 },
  { name: 'Rash', value: 12 },
  { name: 'Others', value: 7 },
];

const COLORS = ['#1B365D', '#CE1126', '#10b981', '#f59e0b', '#8b5cf6'];

export default function BhwDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [totalSentinels, setTotalSentinels] = useState(0);
  const [activeSentinels, setActiveSentinels] = useState(0);

  const [pendingReports, setPendingReports] = useState(0);
  const [verifiedToday, setVerifiedToday] = useState(0);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPatternAnalysis, setShowPatternAnalysis] = useState(false);
  const [patternAnalysis] = useState<PatternAnalysisResult | null>(null);
  const [analysisLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch sentinels
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const sentinelsData = usersSnapshot.docs.filter(doc => doc.data().communityRole);
      setTotalSentinels(sentinelsData.length);
      
      // Count approved sentinels as active
      const activeSentinelsCount = sentinelsData.filter(doc => doc.data().status === 'approved').length;
      setActiveSentinels(activeSentinelsCount);
      
      // Fetch reports
      const reportsRef = collection(db, 'symptomReports');
      const reportsSnapshot = await getDocs(reportsRef);
      
      // Count pending reports
      const pendingCount = reportsSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
      setPendingReports(pendingCount);
      
      // Count verified today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const verifiedTodayCount = reportsSnapshot.docs.filter(doc => {
        const data = doc.data();
        if (data.status === 'verified' && data.createdAt) {
          const reportDate = data.createdAt.toDate();
          return reportDate >= today;
        }
        return false;
      }).length;
      setVerifiedToday(verifiedTodayCount);
      
      // Get recent reports (last 4) with user selfies
      const reportsQuery = query(reportsRef, orderBy('createdAt', 'desc'), limit(4));
      const recentSnapshot = await getDocs(reportsQuery);
      const recentData = await Promise.all(
        recentSnapshot.docs.map(async (reportDoc) => {
          const reportData = reportDoc.data();
          
          // Fetch user selfie
          let userSelfieUrl = '';
          if (reportData.userId) {
            try {
              const usersRef = collection(db, 'users');
              const userQuery = query(usersRef, where('uid', '==', reportData.userId));
              const userSnapshot = await getDocs(userQuery);
              
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                userSelfieUrl = userData.documents?.selfieUrl || '';
              }
            } catch (error) {
              console.error('Error fetching user selfie:', error);
            }
          }
          
          return {
            id: reportDoc.id,
            ...reportData,
            userSelfieUrl
          };
        })
      );
      setRecentReports(recentData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  {/* 
    const handleCreateAnnouncement = async (announcementData: OutbreakAnnouncementData, analysisData: PatternAnalysisResult) => {
      try {
        await addDoc(collection(db, 'announcements'), {
          title: announcementData.title,
          message: announcementData.message,
          type: announcementData.type,
          priority: announcementData.priority,
          createdAt: serverTimestamp(),
          createdBy: user?.displayName || 'BHW',
          sourceType: 'pattern_analysis',
          analysisData: analysisData
        });
        
        setShowPatternAnalysis(false);
        showAnnouncementCreatedToast(announcementData.title);
        navigate('/bhw/announcements');
      } catch (error) {
        console.error('Error creating announcement:', error);
      }
    };
  */}
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1B365D] dark:text-white mb-2">BHW Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor community health observations in your barangay</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Sentinels</p>
              <h3 className="text-3xl font-bold text-[#1B365D] dark:text-white">{loading ? '...' : totalSentinels}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Registered</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <Users className="h-8 w-8 text-[#1B365D] dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Sentinels</p>
              <h3 className="text-3xl font-bold text-[#1B365D] dark:text-white">{loading ? '...' : activeSentinels}</h3>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Approved</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Reports</p>
              <h3 className="text-3xl font-bold text-[#CE1126] dark:text-red-400">{loading ? '...' : pendingReports}</h3>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Pending review</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <Bell className="h-8 w-8 text-[#CE1126] dark:text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verified Today</p>
              <h3 className="text-3xl font-bold text-[#1B365D] dark:text-white">{loading ? '...' : verifiedToday}</h3>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Reports verified</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <CheckCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <motion.div 
        className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700" whileHover={{ scale: 1.02 }}>
          <h3 className="text-base sm:text-lg font-bold text-[#1B365D] dark:text-white mb-4">Weekly Observation Trends</h3>
          <div className="h-62.5 sm:h-75">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={observationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="observations" stroke="#1B365D" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Total Observations" />
                <Line type="monotone" dataKey="verified" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Verified" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700" whileHover={{ scale: 1.02 }}>
          <h3 className="text-base sm:text-lg font-bold text-[#1B365D] dark:text-white mb-4">Common Symptoms Reported</h3>
          <div className="h-62.5 sm:h-75">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={symptomData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={window.innerWidth < 640 ? 70 : 100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {symptomData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="text-base sm:text-lg font-bold text-[#1B365D] dark:text-white mb-4">Recent Reports</h3>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100  dark:bg-gray-600 rounded-[3px] animate-pulse"></div>
            ))}
          </div>
        ) : recentReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-150">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reporter</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Description</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentReports.map((report, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-2 sm:px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                          <AvatarImage src={report.userSelfieUrl} alt={report.userName} />
                          <AvatarFallback className="text-xs">{report.userName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate block">{report.userName}</span>
                          <span className="text-xs text-gray-600 dark:text-white truncate block sm:hidden">{report.description || 'No description'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-sm text-gray-600 dark:text-white truncate max-w-xs hidden sm:table-cell">{report.description || 'No description'}</td>
                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-500 dark:text-white whitespace-nowrap">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-2 sm:px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'verified' 
                          ? 'bg-green-100 text-green-700' 
                          : report.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {report.status === 'verified' ? 'Verified' : report.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-white">
            <p className="text-sm sm:text-base">No recent reports</p>
          </div>
        )}
      </motion.div>

      {/* Pattern Analysis Modal 
      <PatternAnalysisModal
        isOpen={showPatternAnalysis}
        onClose={() => setShowPatternAnalysis(false)}
        analysis={patternAnalysis}
        isLoading={analysisLoading}
        onCreateAnnouncement={handleCreateAnnouncement}
      />
      */}
    </div>
  );
}
