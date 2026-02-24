import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Users, Bell, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const observationData = [
  { time: '00:00', Barangay1: 12, Barangay2: 8, Barangay3: 15, Barangay4: 10 },
  { time: '04:00', Barangay1: 15, Barangay2: 12, Barangay3: 18, Barangay4: 14 },
  { time: '08:00', Barangay1: 25, Barangay2: 20, Barangay3: 28, Barangay4: 22 },
  { time: '12:00', Barangay1: 35, Barangay2: 28, Barangay3: 38, Barangay4: 30 },
  { time: '16:00', Barangay1: 42, Barangay2: 35, Barangay3: 45, Barangay4: 38 },
  { time: '20:00', Barangay1: 38, Barangay2: 32, Barangay3: 40, Barangay4: 35 },
  { time: '23:59', Barangay1: 45, Barangay2: 38, Barangay3: 48, Barangay4: 40 },
];

const alertData = [
  { name: 'Mon', alerts: 4 },
  { name: 'Tue', alerts: 7 },
  { name: 'Wed', alerts: 5 },
  { name: 'Thu', alerts: 9 },
  { name: 'Fri', alerts: 6 },
  { name: 'Sat', alerts: 8 },
  { name: 'Sun', alerts: 5 },
];

export default function AdminDashboard() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedMunicipality, setSelectedMunicipality] = useState('all');

  const regions = [
    "NCR", "CAR", "Region I", "Region II", "Region III", "Region IV-A", 
    "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII",
    "Region IX", "Region X", "Region XI", "Region XII", "Region XIII", "BARMM"
  ];

  const municipalities = ["Manila", "Quezon City", "Makati", "Pasig", "Taguig"];

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
            <h1 className="text-3xl font-bold text-[#1B365D] mb-2">Live Monitoring Dashboard</h1>
            <p className="text-gray-600">Real-time community health intelligence across barangays</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Municipality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Municipalities</SelectItem>
                {municipalities.map((municipality) => (
                  <SelectItem key={municipality} value={municipality}>{municipality}</SelectItem>
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
              <h3 className="text-3xl font-bold text-[#1B365D]">1,284</h3>
              <p className="text-xs text-green-600 mt-1">↑ 12% from yesterday</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Activity className="h-8 w-8 text-[#1B365D]" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Sentinels</p>
              <h3 className="text-3xl font-bold text-[#1B365D]">342</h3>
              <p className="text-xs text-green-600 mt-1">↑ 8% this week</p>
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
              <h3 className="text-3xl font-bold text-[#CE1126]">23</h3>
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
              <p className="text-sm text-gray-600 mb-1">Verified Today</p>
              <h3 className="text-3xl font-bold text-[#1B365D]">156</h3>
              <p className="text-xs text-green-600 mt-1">↑ 94% accuracy</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600" />
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
          <h3 className="text-lg font-bold text-[#1B365D] mb-4">Live Observations Across Barangays</h3>
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
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        whileHover={{ scale: 1.01 }}
      >
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
    </div>
  );
}
