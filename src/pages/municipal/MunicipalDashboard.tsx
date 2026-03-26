import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, Bell, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

const alertData = [
  { name: 'Mon', alerts: 2 },
  { name: 'Tue', alerts: 4 },
  { name: 'Wed', alerts: 3 },
  { name: 'Thu', alerts: 5 },
  { name: 'Fri', alerts: 3 },
  { name: 'Sat', alerts: 4 },
  { name: 'Sun', alerts: 2 },
];

export default function MunicipalDashboard() {
  const { } = useAuth();
  const [selectedBarangay, setSelectedBarangay] = useState('all');
  const [stats, setStats] = useState({
    totalObservations: 0,
    activeBHWs: 0,
    activeAlerts: 0,
    activeSentinels: 0
  });
  const [observationData, setObservationData] = useState<any[]>([]);
  const [barangayData, setBarangayData] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<string[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all BHWs
      const bhwsRef = collection(db, 'registrations');
      const bhwsQuery = query(bhwsRef, where('role', '==', 'bhw'));
      const bhwsSnapshot = await getDocs(bhwsQuery);
      const bhwsList = bhwsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch all sentinels
      const sentinelsRef = collection(db, 'sentinels');
      const sentinelsSnapshot = await getDocs(sentinelsRef);
      const sentinelsList = sentinelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate stats for municipal view
      const activeBHWs = bhwsList.filter((b: any) => b.status === 'approved').length;
      const activeSentinels = sentinelsList.filter((s: any) => s.status === 'active').length;
      
      // Generate barangay distribution data (mock for now)
      const mockBarangayData = [
        { name: 'Barangay A', value: 30, color: '#1B365D' },
        { name: 'Barangay B', value: 25, color: '#CE1126' },
        { name: 'Barangay C', value: 20, color: '#10b981' },
        { name: 'Barangay D', value: 15, color: '#f59e0b' },
        { name: 'Barangay E', value: 10, color: '#8b5cf6' },
      ];

      // Generate observation data (mock for now)
      const mockObservationData = [
        { time: '00:00', Barangay1: 8, Barangay2: 6, Barangay3: 10, Barangay4: 7 },
        { time: '04:00', Barangay1: 10, Barangay2: 8, Barangay3: 12, Barangay4: 9 },
        { time: '08:00', Barangay1: 18, Barangay2: 15, Barangay3: 20, Barangay4: 16 },
        { time: '12:00', Barangay1: 25, Barangay2: 22, Barangay3: 28, Barangay4: 24 },
        { time: '16:00', Barangay1: 30, Barangay2: 26, Barangay3: 32, Barangay4: 28 },
        { time: '20:00', Barangay1: 28, Barangay2: 24, Barangay3: 30, Barangay4: 26 },
        { time: '23:59', Barangay1: 32, Barangay2: 28, Barangay3: 35, Barangay4: 30 }
      ];

      const mockBarangays = [
        "Barangay A", "Barangay B", "Barangay C", "Barangay D", 
        "Barangay E", "Barangay F", "Barangay G", "Barangay H"
      ];

      setStats({
        totalObservations: bhwsList.length + sentinelsList.length,
        activeBHWs,
        activeAlerts: 0,
        activeSentinels
      });
      setObservationData(mockObservationData as any);
      setBarangayData(mockBarangayData as any);
      setBarangays(mockBarangays);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1B365D] mb-2">Municipal Dashboard</h1>
            <p className="text-gray-600">Municipal health intelligence across barangays</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Barangay" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Barangays</SelectItem>
                {barangays.map((barangay) => (
                  <SelectItem key={barangay} value={barangay}>{barangay}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Observations</p>
              <h3 className="text-3xl font-bold text-[#1B365D]">{stats.totalObservations.toLocaleString()}</h3>
              <p className="text-xs text-green-600 mt-1">↑ 18% from last week</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Activity className="h-8 w-8 text-[#1B365D]" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active BHWs</p>
              <h3 className="text-3xl font-bold text-[#1B365D]">{stats.activeBHWs}</h3>
              <p className="text-xs text-green-600 mt-1">↑ 6% this month</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
              <h3 className="text-3xl font-bold text-[#CE1126]">{stats.activeAlerts}</h3>
              <p className="text-xs text-red-600 mt-1">↑ 3 new alerts</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <Bell className="h-8 w-8 text-[#CE1126]" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Sentinels</p>
              <h3 className="text-3xl font-bold text-[#1B365D]">{stats.activeSentinels}</h3>
              <p className="text-xs text-green-600 mt-1">↑ 22% this month</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" whileHover={{ scale: 1.02 }}>
          <h3 className="text-lg font-bold text-[#1B365D] mb-4">Observations Across Barangays</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={observationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Line type="monotone" dataKey="Barangay1" stroke="#1B365D" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Barangay2" stroke="#CE1126" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Barangay3" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Barangay4" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" whileHover={{ scale: 1.02 }}>
          <h3 className="text-lg font-bold text-[#1B365D] mb-4">Weekly Alert Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={alertData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="alerts" fill="#1B365D" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" whileHover={{ scale: 1.02 }}>
          <h3 className="text-lg font-bold text-[#1B365D] mb-4">Observation Density Heatmap</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={observationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Area type="monotone" dataKey="Barangay1" stackId="1" stroke="#1B365D" fill="#1B365D" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Barangay2" stackId="1" stroke="#CE1126" fill="#CE1126" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Barangay3" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Barangay4" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" whileHover={{ scale: 1.02 }}>
          <h3 className="text-lg font-bold text-[#1B365D] mb-4">Barangay Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={barangayData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name || ''} ${(((props.percent || 0) * 100).toFixed(0))}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {barangayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>
    </div>
  );
}
