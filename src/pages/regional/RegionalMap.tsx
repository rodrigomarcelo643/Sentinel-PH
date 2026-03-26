import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap, useLoadScript, Marker, Circle } from '@react-google-maps/api';
import { MapPin, Users, Activity, Filter } from 'lucide-react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 160px)',
};

const center = {
  lat: 12.8797,
  lng: 123.8854,
};

export default function RegionalMap() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMunicipality, setSelectedMunicipality] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [mapCenter] = useState(center);
  const [mapZoom] = useState(6);

  const { isLoaded } = useLoadScript({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    if (isLoaded) {
      fetchReports();
    }
  }, [isLoaded]);

  useEffect(() => {
    // Real-time listener for new reports
    const unsubscribe = onSnapshot(collection(db, 'symptomReports'), (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchReports = async () => {
    try {
      const reportsRef = collection(db, 'symptomReports');
      const snapshot = await getDocs(reportsRef);
      
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const getSeverityColor = (severity: 'mild' | 'moderate' | 'severe') => {
    switch (severity) {
      case 'mild': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'severe': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredReports = reports.filter(report => {
    const municipalityMatch = selectedMunicipality === 'all' || (report as any).municipality === selectedMunicipality;
    const severityMatch = selectedSeverity === 'all' || (report as any).severity === selectedSeverity;
    const statusMatch = selectedStatus === 'all' || (report as any).status === selectedStatus;
    return municipalityMatch && severityMatch && statusMatch;
  });

  const uniqueMunicipalities = Array.from(new Set(reports.map(r => (r as any).municipality).filter(Boolean)));
  const uniqueSeverities = ['mild', 'moderate', 'severe'];
  const uniqueStatuses = ['pending', 'verified'];
  const uniqueUsers = Array.from(new Set(reports.map(r => (r as any).userId).filter(Boolean)));

  if (!isLoaded) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1B365D] mb-2">Regional Map</h1>
            <p className="text-gray-600">Disease surveillance map across all municipalities</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedMunicipality}
                onChange={(e) => setSelectedMunicipality(e.target.value)}
                className="border-0 bg-transparent focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Municipalities</option>
                {uniqueMunicipalities.map(municipality => (
                  <option key={municipality} value={municipality}>{municipality}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="border-0 bg-transparent focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Severities</option>
                {uniqueSeverities.map(severity => (
                  <option key={severity} value={severity}>{severity.charAt(0).toUpperCase() + severity.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border-0 bg-transparent focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-[#1B365D]">{filteredReports.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="bg-yellow-50 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Municipalities</p>
                <p className="text-2xl font-bold text-[#1B365D]">{uniqueMunicipalities.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-2 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-[#1B365D]">{uniqueUsers.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Google Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          style={mapContainerStyle}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Loading map data...</p>
              </div>
            </div>
          ) : (
            <GoogleMap
              center={mapCenter}
              zoom={mapZoom}
              mapContainerStyle={mapContainerStyle}
              options={{
                zoomControl: true,
                streetViewControl: true,
                fullscreenControl: false,
              }}
            >
              {filteredReports.map((report: any) => (
                <Marker
                  key={report.id}
                  position={{ lat: report.latitude, lng: report.longitude }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: getSeverityColor(report.severity || 'mild'),
                    fillOpacity: 0.8,
                    scale: 7,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  }}
                  title={`${report.symptoms?.join(', ')} - ${report.severity} (${report.status})`}
                >
                  <Circle
                    center={{ lat: report.latitude, lng: report.longitude }}
                    radius={50}
                    options={{
                      fillColor: getSeverityColor(report.severity || 'mild'),
                      fillOpacity: 0.2,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                    }}
                  />
                </Marker>
              ))}
            </GoogleMap>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
