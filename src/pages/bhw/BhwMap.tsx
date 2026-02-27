import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, Circle, DirectionsRenderer } from '@react-google-maps/api';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { MapPin, Activity } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 200px)',
};

const center = {
  lat: 10.3157,
  lng: 123.8854,
};

interface SymptomReport {
  id: string;
  latitude: number;
  longitude: number;
  symptoms: string[];
  description: string;
  userName: string;
  status: string;
  createdAt: any;
  location: string;
  userId?: string;
  userSelfieUrl?: string;
  proofImageUrl?: string;
  reportType?: string;
}

const getSeverity = (symptomsCount: number): 'low' | 'medium' | 'high' => {
  if (symptomsCount >= 4) return 'high';
  if (symptomsCount >= 2) return 'medium';
  return 'low';
};

const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
  switch (severity) {
    case 'high': return '#DC2626';
    case 'medium': return '#F59E0B';
    case 'low': return '#10B981';
  }
};

export default function BhwMap() {
  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<SymptomReport | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    fetchReports();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchReports = async () => {
    try {
      const reportsRef = collection(db, 'symptomReports');
      const snapshot = await getDocs(reportsRef);
      const reportsData = await Promise.all(
        snapshot.docs.map(async (reportDoc) => {
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
      
      const data = reportsData.filter(report => report.latitude && report.longitude) as SymptomReport[];
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const PulsingPin = ({ severity }: { severity: 'low' | 'medium' | 'high' }) => {
    const color = getSeverityColor(severity);
    return (
      <div className="relative">
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-75"
          style={{ backgroundColor: color, width: '24px', height: '24px' }}
        />
        <MapPin 
          className="relative z-10" 
          fill={color} 
          color={color} 
          size={24}
        />
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 shadow-md border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg shadow-sm">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B365D] to-indigo-600 bg-clip-text text-transparent mb-1">Symptom Reports Map</h1>
              <p className="text-gray-600 text-sm">Real-time visualization of community health observations</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        <LoadScript 
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          onLoad={() => setMapLoaded(true)}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={userLocation || center}
            zoom={13}
            options={{
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }],
                },
              ],
            }}
          >
              {/* Barangay Coverage Circle - 1km radius */}
              {userLocation && (
                <Circle
                  center={userLocation}
                  radius={1000}
                  options={{
                    fillColor: '#10B981',
                    fillOpacity: 0.08,
                    strokeColor: '#10B981',
                    strokeOpacity: 0.6,
                    strokeWeight: 2,
                    strokeDashArray: [5, 5],
                  }}
                />
              )}

              {/* Directions Route */}
              {directions && (
                <DirectionsRenderer 
                  directions={directions}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: '#3B82F6',
                      strokeWeight: 6,
                      strokeOpacity: 0.8,
                    },
                  }}
                />
              )}

              {/* User Location Marker */}
              {userLocation && mapLoaded && (
                <Marker
                  position={userLocation}
                  icon={{
                    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="15" fill="#3B82F6" opacity="0.2">
                          <animate attributeName="r" values="15;20;15" dur="2s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="20" cy="20" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
                      </svg>
                    `)}`,
                  }}
                />
              )}

              {/* Symptom Report Markers */}
              {mapLoaded && reports.map((report) => {
                const severity = getSeverity(report.symptoms?.length || 0);
                const color = getSeverityColor(severity);
                return (
                  <Marker
                    key={report.id}
                    position={{ lat: report.latitude, lng: report.longitude }}
                    onClick={() => {
                      setSelectedReport(report);
                      if (userLocation) {
                        const directionsService = new google.maps.DirectionsService();
                        directionsService.route(
                          {
                            origin: userLocation,
                            destination: { lat: report.latitude, lng: report.longitude },
                            travelMode: google.maps.TravelMode.DRIVING,
                          },
                          (result, status) => {
                            if (status === google.maps.DirectionsStatus.OK) {
                              setDirections(result);
                            }
                          }
                        );
                      }
                    }}
                    icon={{
                      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                        <svg width="36" height="45" viewBox="0 0 36 45" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="18" cy="18" r="14" fill="${color}" opacity="0.3">
                            <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
                          </circle>
                          <path d="M18 3C11.373 3 6 8.373 6 15c0 6.627 12 25 12 25s12-18.373 12-25C30 8.373 24.627 3 18 3z" 
                            fill="${color}" stroke="white" stroke-width="2.5"/>
                          <circle cx="18" cy="15" r="5" fill="white"/>
                        </svg>
                      `)}`,
                    }}
                  />
                );
              })}
          </GoogleMap>
          
          {/* Loading Indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[999]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1B365D] rounded-full animate-spin"></div>
              </div>
            </div>
          )}
          
          {/* Barangay Name - Top Left */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200 border-l-4 border-l-[#1B365D] z-[1000]">
              <h3 className="font-bold text-sm text-[#1B365D]">Barangay Sambag I</h3>
              <p className="text-xs text-gray-600">Urgello Street, Cebu City</p>
            </div>

            {/* Legend - Inside Map on Bottom Left Side */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 border-l-4 border-l-[#CE1126] z-[1000]">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Symptom Severity</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-6" style={{ 
                    background: '#10B981',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  }}></div>
                  <span className="text-xs text-gray-700">Low (1)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-6" style={{ 
                    background: '#F59E0B',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  }}></div>
                  <span className="text-xs text-gray-700">Medium (2-3)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-6" style={{ 
                    background: '#DC2626',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  }}></div>
                  <span className="text-xs text-gray-700">High (4+)</span>
                </div>
              </div>
            </div>
          </LoadScript>
        </div>

      {selectedReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8 bg-white p-6 rounded-xl shadow-2xl border border-gray-200 border-l-4 border-l-blue-400 max-w-md z-50"
        >
          <button
            onClick={() => {
              setSelectedReport(null);
              setDirections(null);
            }}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
          
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <img src="/sentinel_ph_logo.png" alt="SentinelPH" className="h-10" />
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Symptom Report</h4>
              <p className="text-xs text-gray-400">ID: {selectedReport.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {selectedReport.userSelfieUrl ? (
                <img 
                  src={selectedReport.userSelfieUrl} 
                  alt={selectedReport.userName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                  {selectedReport.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-xl text-[#1B365D] mb-1">{selectedReport.userName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedReport.location}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Symptoms Reported</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedReport.symptoms?.map((symptom, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</span>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{selectedReport.description}</p>
              </div>
              {selectedReport.proofImageUrl && (
                <img 
                  src={selectedReport.proofImageUrl} 
                  alt="Proof" 
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Report Type:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedReport.reportType === 'observed' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {selectedReport.reportType === 'observed' ? 'Observed' : 'Self-Reported'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedReport.status === 'verified' 
                    ? 'bg-green-100 text-green-700' 
                    : selectedReport.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedReport.status.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  getSeverity(selectedReport.symptoms?.length || 0) === 'high'
                    ? 'bg-red-100 text-red-700'
                    : getSeverity(selectedReport.symptoms?.length || 0) === 'medium'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {getSeverity(selectedReport.symptoms?.length || 0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {selectedReport.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
