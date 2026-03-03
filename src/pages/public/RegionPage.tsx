import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { MapPin, Users, Activity, TrendingUp, Building, Phone, Mail } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Region Not Found</h1>
            <p className="text-gray-600">The requested region could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20">
        {/* Header */}
        <section className="bg-gradient-to-r from-[#1B365D] to-blue-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center mb-4">
                <MapPin className="h-8 w-8 mr-3" />
                <h1 className="text-4xl md:text-5xl font-bold">{currentRegion.name}</h1>
              </div>
              <p className="text-xl text-blue-100">
                Regional Capital: {currentRegion.capital}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {loading ? '...' : regionStats.totalReports.toLocaleString()}
                    </p>
                  </div>
                  <Activity className="h-12 w-12 text-blue-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Verified Reports</p>
                    <p className="text-3xl font-bold text-green-600">
                      {loading ? '...' : regionStats.verifiedReports.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-green-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Sentinels</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {loading ? '...' : regionStats.activeSentinels.toLocaleString()}
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-purple-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Municipalities</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {loading ? '...' : regionStats.municipalities}
                    </p>
                  </div>
                  <Building className="h-12 w-12 text-orange-200" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Recent Reports */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Health Reports</h2>
                <div className="space-y-4">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-100 p-4 rounded-lg">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))
                  ) : recentReports.length > 0 ? (
                    recentReports.map((report) => (
                      <div key={report.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="font-medium text-gray-900">
                          {report.symptoms?.slice(0, 2).join(', ') || 'Health Report'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {report.barangay || report.location || 'Location not specified'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {report.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent reports available</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Regional Health Office Contact */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Regional Health Office</h2>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    Department of Health - {currentRegion.name}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">{currentRegion.capital}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">+63 (2) 8651-7800</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">info@doh.gov.ph</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-white rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Emergency Hotline</h4>
                    <p className="text-2xl font-bold text-red-600">911</p>
                    <p className="text-sm text-gray-600">24/7 Emergency Response</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* All Regions List */}
        <section className="py-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">All Philippine Regions</h2>
              <p className="text-gray-600">Explore health monitoring data across the Philippines</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PHILIPPINE_REGIONS.map((region, index) => (
                <motion.a
                  key={region.code}
                  href={`/region/${region.code}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`block p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                    region.code === regionId 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{region.name}</h3>
                      <p className="text-sm text-gray-600">Capital: {region.capital}</p>
                    </div>
                    <MapPin className={`h-6 w-6 ${
                      region.code === regionId ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}