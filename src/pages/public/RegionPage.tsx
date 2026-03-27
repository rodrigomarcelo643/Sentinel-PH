import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { MapPin, Users, Activity, TrendingUp, Building, Phone, Mail, Shield, AlertTriangle, Clock } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';

const PHILIPPINE_REGIONS = [
  { code: 'ncr', name: 'National Capital Region (NCR)', capital: 'Manila' },
  { code: 'car', name: 'Cordillera Administrative Region (CAR)', capital: 'Baguio City' },
  { code: 'region-i', name: 'Region I - Ilocos Region', capital: 'San Fernando City' },
  { code: 'region-ii', name: 'Region II - Cagayan Valley', capital: 'Tuguegarao City' },
  { code: 'region-iii', name: 'Region III - Central Luzon', capital: 'San Fernando City' },
  { code: 'region-iv-a', name: 'Region IV-A - CALABARZON', capital: 'Calamba City' },
  { code: 'region-iv-b', name: 'Region IV-B - MIMAROPA', capital: 'Calapan City' },
  { code: 'region-v', name: 'Region V - Bicol Region', capital: 'Legazpi City' },
  { code: 'region-vi', name: 'Region VI - Western Visayas', capital: 'Iloilo City' },
  { code: 'region-vii', name: 'Region VII - Central Visayas', capital: 'Cebu City' },
  { code: 'region-viii', name: 'Region VIII - Eastern Visayas', capital: 'Tacloban City' },
  { code: 'region-ix', name: 'Region IX - Zamboanga Peninsula', capital: 'Pagadian City' },
  { code: 'region-x', name: 'Region X - Northern Mindanao', capital: 'Cagayan de Oro City' },
  { code: 'region-xi', name: 'Region XI - Davao Region', capital: 'Davao City' },
  { code: 'region-xii', name: 'Region XII - SOCCSKSARGEN', capital: 'Koronadal City' },
  { code: 'region-xiii', name: 'Region XIII - Caraga', capital: 'Butuan City' },
  { code: 'barmm', name: 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)', capital: 'Cotabato City' }
];

interface RegionStats {
  totalReports: number;
  verifiedReports: number;
  activeSentinels: number;
  municipalities: number;
}

export default function RegionPage() {
  const { regionId } = useParams();
  const [regionStats, setRegionStats] = useState<RegionStats>({
    totalReports: 0,
    verifiedReports: 0,
    activeSentinels: 0,
    municipalities: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  const currentRegion = PHILIPPINE_REGIONS.find(r => r.code === regionId);

  useEffect(() => {
    if (regionId) {
      fetchRegionData();
    }
  }, [regionId]);

  const fetchRegionData = async () => {
    try {
      setLoading(true);
      
      // Fetch reports for this region (mock data for now)
      const reportsRef = collection(db, 'symptomReports');
      const reportsQuery = query(reportsRef, where('status', '==', 'verified'));
      const reportsSnapshot = await getDocs(reportsQuery);
      
      // Mock region-specific data
      const mockStats = {
        totalReports: Math.floor(Math.random() * 500) + 100,
        verifiedReports: Math.floor(Math.random() * 300) + 50,
        activeSentinels: Math.floor(Math.random() * 200) + 20,
        municipalities: Math.floor(Math.random() * 50) + 10
      };
      
      setRegionStats(mockStats);
      setRecentReports(reportsSnapshot.docs.slice(0, 5).map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      
    } catch (error) {
      console.error('Error fetching region data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentRegion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex p-4 bg-red-100 rounded-2xl mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Region Not Found</h1>
            <p className="text-gray-600 text-lg mb-8">The requested region could not be found.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#1B365D] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1B365D]/90 transition-colors"
              onClick={() => window.location.href = '/regions'}
            >
              View All Regions
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar />
      
      <div className="pt-20">
        {/* Header */}
        <section className="bg-gradient-to-r from-[#1B365D] to-blue-700 text-white py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row items-center justify-between"
            >
              <div className="flex items-center mb-6 lg:mb-0">
                <div className="p-3 bg-white/20 rounded-xl mr-4">
                  <MapPin className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{currentRegion.name}</h1>
                  <p className="text-lg sm:text-xl text-blue-100">
                    Regional Capital: {currentRegion.capital}
                  </p>
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4"
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{regionStats.activeSentinels}</div>
                  <div className="text-sm text-blue-100">Active Sentinels</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{regionStats.municipalities}</div>
                  <div className="text-sm text-blue-100">Municipalities</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B365D] mb-4">Regional Health Monitoring</h2>
              <p className="text-lg text-gray-600">Real-time insights and community health data</p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Total</div>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold text-blue-600">
                    {loading ? '...' : regionStats.totalReports.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total Reports</p>
                </div>
                <div className="mt-4 flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>12% increase</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Verified</div>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold text-green-600">
                    {loading ? '...' : regionStats.verifiedReports.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Verified Reports</p>
                </div>
                <div className="mt-4 flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>8% increase</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Active</div>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold text-purple-600">
                    {loading ? '...' : regionStats.activeSentinels.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Active Sentinels</p>
                </div>
                <div className="mt-4 flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>15% increase</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Building className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Coverage</div>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold text-orange-600">
                    {loading ? '...' : regionStats.municipalities}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Municipalities</p>
                </div>
                <div className="mt-4 flex items-center text-blue-600 text-sm">
                  <Shield className="h-4 w-4 mr-1" />
                  <span>Full coverage</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Recent Activity & Contact */}
        <section className="py-12 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">
              {/* Recent Reports */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-gray-50 rounded-2xl p-6 lg:p-8 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Health Reports</h2>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white p-4 rounded-xl border border-gray-200">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))
                  ) : recentReports.length > 0 ? (
                    recentReports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-4 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">
                              {report.symptoms?.slice(0, 2).join(', ') || 'Health Report'}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              {report.barangay || report.location || 'Location not specified'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {report.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                            </p>
                          </div>
                          <div className="p-2 bg-green-100 rounded-lg ml-3">
                            <Shield className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="inline-flex p-4 bg-gray-100 rounded-2xl mb-4">
                        <Activity className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">No recent reports available</p>
                      <p className="text-sm mt-2">Reports will appear here as they are submitted</p>
                    </div>
                  )}
                </div>
                
                {recentReports.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-6 bg-[#1B365D] text-white py-3 rounded-xl font-semibold hover:bg-[#1B365D]/90 transition-colors"
                  >
                    View All Reports
                  </motion.button>
                )}
              </motion.div>

              {/* Regional Health Office Contact */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 lg:p-8 border border-blue-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-blue-900">Regional Health Office</h2>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    Department of Health - {currentRegion.name}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700 font-medium">{currentRegion.capital}</span>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700 font-medium">+63 (2) 8651-7800</span>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700 font-medium">info@doh.gov.ph</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                    <h4 className="font-bold text-red-900">Emergency Hotline</h4>
                  </div>
                  <p className="text-3xl font-bold text-red-600 mb-2">911</p>
                  <p className="text-sm text-red-700">24/7 Emergency Response</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Contact Health Office
                </motion.button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* All Regions List */}
        <section className="py-12 sm:py-20 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B365D] mb-4">All Philippine Regions</h2>
              <p className="text-lg text-gray-600">Explore health monitoring data across the Philippines</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {PHILIPPINE_REGIONS.map((region, index) => (
                <motion.a
                  key={region.code}
                  href={`/region/${region.code}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`block p-6 rounded-2xl border-2 transition-all hover:shadow-xl ${
                    region.code === regionId 
                      ? 'bg-blue-50 border-blue-500 shadow-lg' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{region.name}</h3>
                      <p className="text-sm text-gray-600">Capital: {region.capital}</p>
                    </div>
                    <div className={`p-3 rounded-xl transition-colors ${
                      region.code === regionId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>
                  
                  {region.code === regionId && (
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      <Shield className="h-4 w-4 mr-1" />
                      Currently Viewing
                    </div>
                  )}
                </motion.a>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#1B365D] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#1B365D]/90 transition-colors shadow-xl"
                onClick={() => window.location.href = '/register'}
              >
                Join SentinelPH Network
              </motion.button>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}