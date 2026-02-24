import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, Bell, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [selectedPeriod, setSelectedPeriod] = useState('week');

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
            <h1 className="text-3xl font-bold text-[#1B365D] mb-2">BHW Dashboard</h1>
            <p className="text-gray-600">Monitor community health observations in your barangay</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
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
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Residents</p>
              <h3 className="text-3xl font-bold text-[#1B365D]">1,847</h3>
              <p className="text-xs text-gray-500 mt-1">Registered</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="h-8 w-8 text-[#1B365D]" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Sentinels</p>
              <h3 className="text-3xl font-bold text-[#1B365D]">24</h3>
              <p className="text-xs text-green-600 mt-1">↑ 3 this week</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">New Observations</p>
              <h3 className="text-3xl font-bold text-[#CE1126]">18</h3>
              <p className="text-xs text-red-600 mt-1">Pending review</p>
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
              <h3 className="text-3xl font-bold text-[#1B365D]">12</h3>
              <p className="text-xs text-green-600 mt-1">↑ 92% accuracy</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <CheckCircle className="h-8 w-8 text-purple-600" />
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
          <h3 className="text-lg font-bold text-[#1B365D] mb-4">Weekly Observation Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={observationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Line type="monotone" dataKey="observations" stroke="#1B365D" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Total Observations" />
              <Line type="monotone" dataKey="verified" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Verified" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" whileHover={{ scale: 1.02 }}>
          <h3 className="text-lg font-bold text-[#1B365D] mb-4">Common Symptoms Reported</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={symptomData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {symptomData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="text-lg font-bold text-[#1B365D] mb-4">Recent Observations</h3>
        <div className="space-y-4">
          {[
            { sentinel: 'Maria Santos', observation: 'Multiple children with fever in Purok 3', time: '2 hours ago', status: 'pending' },
            { sentinel: 'Juan Dela Cruz', observation: 'Increased paracetamol purchases', time: '4 hours ago', status: 'verified' },
            { sentinel: 'Rosa Garcia', observation: 'Several families boiling water', time: '6 hours ago', status: 'verified' },
            { sentinel: 'Pedro Reyes', observation: 'Unusual cough symptoms reported', time: '8 hours ago', status: 'pending' },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-lg ${item.status === 'verified' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                {item.status === 'verified' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900">{item.sentinel}</p>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
                <p className="text-sm text-gray-600">{item.observation}</p>
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                  item.status === 'verified' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.status === 'verified' ? 'Verified' : 'Pending Review'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
