import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, Bell, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

const alertData = [
  { name: 'Mon', alerts: 4 },
  { name: 'Tue', alerts: 7 },
  { name: 'Wed', alerts: 5 },
  { name: 'Thu', alerts: 9 },
  { name: 'Fri', alerts: 6 },
  { name: 'Sat', alerts: 8 },
  { name: 'Sun', alerts: 5 },
];

export default function RegionalDashboard() {
  const { } = useAuth();
  const [selectedMunicipality, setSelectedMunicipality] = useState('all');
  const [stats, setStats] = useState({
    totalObservations: 0,
    activeBHWs: 0,
    activeAlerts: 0,
    totalMunicipalities: 0
  });
  const [observationData, setObservationData] = useState<any[]>([]);
  const [municipalityData, setMunicipalityData] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all municipalities
      const municipalitiesRef = collection(db, 'municipalities');
      const municipalitiesSnapshot = await getDocs(municipalitiesRef);
      const municipalitiesList = municipalitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMunicipalities(municipalitiesList);

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
      await getDocs(sentinelsRef);
      // const sentinelsList = sentinelsSnapshot.docs.map(doc => ({
      //   id: doc.id,
      //   ...doc.data()
      // }));

      // Calculate stats
      const activeBHWs = bhwsList.filter((b: any) => b.status === 'approved').length;
      const totalMunicipalities = municipalitiesList.length;
      
      // Calculate municipality counts
      const municipalityCounts = municipalitiesList.map((municipality: any) => ({
        name: municipality.name,
        value: bhwsList.filter((b: any) => b.municipality === municipality.name).length,
        color: '#1B365D'
      }));

      // Mock observation data for demonstration
      const mockObservationData = [
        { time: '00:00', Municipality1: 12, Municipality2: 8, Municipality3: 15, Municipality4: 10 },
        { time: '04:00', Municipality1: 15, Municipality2: 12, Municipality3: 18, Municipality4: 14 },
        { time: '08:00', Municipality1: 25, Municipality2: 20, Municipality3: 28, Municipality4: 22 },
        { time: '12:00', Municipality1: 35, Municipality2: 28, Municipality3: 38, Municipality4: 30 },
        { time: '16:00', Municipality1: 42, Municipality2: 35, Municipality3: 45, Municipality4: 38 },
        { time: '20:00', Municipality1: 38, Municipality2: 32, Municipality3: 40, Municipality4: 35 },
        { time: '23:59', Municipality1: 45, Municipality2: 38, Municipality3: 48, Municipality4: 40 },
      ];

      setStats({
        totalObservations: 3847,
        activeBHWs,
        activeAlerts: 47,
        totalMunicipalities
      });
      setObservationData(mockObservationData);
      setMunicipalityData(municipalityCounts);
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
            <h1 className="text-3xl font-bold text-[#1B365D] mb-2">Regional Dashboard</h1>
            <p className="text-gray-600">Regional health intelligence across municipalities</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Municipality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Municipalities</SelectItem>
                {municipalities.map((municipality) => (
                  <SelectItem key={municipality.id} value={municipality.name}>{municipality.name}</SelectItem>
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
              <p className="text-xs text-green-600 mt-1">↑ 15% from last week</p>
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
              <p className="text-xs text-green-600 mt-1">↑ 12% this month</p>
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
              <p className="text-xs text-red-600 mt-1">↑ 8 new alerts</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <Bell className="h-8 w-8 text-[#CE1126]" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Municipalities</p>
              <h3 className="text-3xl font-bold text-[#1B365D]">{stats.totalMunicipalities}</h3>
              <p className="text-xs text-green-600 mt-1">All active</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Building className="h-8 w-8 text-purple-600" />
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
          <h3 className="text-lg font-bold text-[#1B365D] mb-4">Observations Across Municipalities</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={observationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Line type="monotone" dataKey="Municipality1" stroke="#1B365D" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Municipality2" stroke="#CE1126" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Municipality3" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Municipality4" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
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
              <Area type="monotone" dataKey="Municipality1" stackId="1" stroke="#1B365D" fill="#1B365D" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Municipality2" stackId="1" stroke="#CE1126" fill="#CE1126" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Municipality3" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Municipality4" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" whileHover={{ scale: 1.02 }}>
          <h3 className="text-lg font-bold text-[#1B365D] mb-4">Municipality Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={municipalityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name || ''} ${(((props.percent || 0) * 100).toFixed(0))}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {municipalityData.map((entry, index) => (
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
