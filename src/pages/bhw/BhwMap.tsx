import { useEffect, useState, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, Circle, DirectionsRenderer } from '@react-google-maps/api';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 160px)',
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
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });
  
  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<SymptomReport | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showNewCaseAlert, setShowNewCaseAlert] = useState(false);
  const previousReportCount = useRef<number>(0);

  useEffect(() => {
    getUserLocation();
    
    // Real-time listener
    const unsubscribe = onSnapshot(collection(db, 'symptomReports'), (snapshot) => {
      const newCount = snapshot.size;
      
      // Show alert if new report detected
      if (!loading && previousReportCount.current > 0 && newCount > previousReportCount.current) {
        setShowNewCaseAlert(true);
        setTimeout(() => setShowNewCaseAlert(false), 60000);
      }
      
      previousReportCount.current = newCount;
      fetchReports();
    });

    fetchReports();
    
    return () => unsubscribe();
  }, [loading]);

  useEffect(() => {
    if (map) {
      map.setMapTypeId('satellite');
    }
  }, [map]);

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
            userSelfieUrl,
            latitude: reportData.latitude,
            longitude: reportData.longitude
          } as SymptomReport;
        })
      );
      
      const data = reportsData.filter((report): report is SymptomReport => 
        typeof report.latitude === 'number' && typeof report.longitude === 'number'
      );
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };



  if (loadError) return <div className="p-8 text-center text-red-600">Error loading maps</div>;
  if (!isLoaded) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1B365D] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 sm:mb-6"
      >
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-sm p-4 sm:p-6 shadow-md border border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-2 sm:p-3 rounded-lg shadow-sm">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-linear-to-r from-[#1B365D] to-indigo-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">Symptom Reports Map</h1>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Real-time visualization of community health observations</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || center}
          zoom={13}
          onLoad={(map) => {
            setMap(map);
            map.setMapTypeId('satellite');
          }}
          options={{
            mapTypeId: 'satellite',
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
                    strokeWeight: 2
                  }}
                />
              )}

              {/* Directions Route */}
              {directions && (
                <DirectionsRenderer 
                  directions={directions}
                  options={{
                    suppressMarkers: false,
                    polylineOptions: {
                      strokeColor: '#3B82F6',
                      strokeWeight: 4,
                      strokeOpacity: 0.8,
                    },
                    markerOptions: {
                      icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                          </svg>
                        `),
                      }
                    }
                  }}
                />
              )}

              {/* User Location Marker */}
              {userLocation && (
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
              {reports.map((report) => {
                const severity = getSeverity(report.symptoms?.length || 0);
                const color = getSeverityColor(severity);
                return (
                  <Marker
                    key={report.id}
                    position={{ lat: report.latitude, lng: report.longitude }}
                    onClick={() => {
                      setSelectedReport(report);
                      if (userLocation && map) {
                        const directionsService = new google.maps.DirectionsService();
                        directionsService.route(
                          {
                            origin: userLocation,
                            destination: { lat: report.latitude, lng: report.longitude },
                            travelMode: google.maps.TravelMode.DRIVING,
                          },
                          (result, status) => {
                            console.log('Directions status:', status); // Debug log
                            if (status === google.maps.DirectionsStatus.OK && result) {
                              setDirections(result);
                            } else {
                              console.error('Directions request failed:', status);
                              // Show user-friendly error
                              alert(`Directions failed: ${status}. Please check if Directions API is enabled.`);
                              // Fallback to walking if driving fails
                              directionsService.route(
                                {
                                  origin: userLocation,
                                  destination: { lat: report.latitude, lng: report.longitude },
                                  travelMode: google.maps.TravelMode.WALKING,
                                },
                                (walkResult, walkStatus) => {
                                  console.log('Walking directions status:', walkStatus);
                                  if (walkStatus === google.maps.DirectionsStatus.OK && walkResult) {
                                    setDirections(walkResult);
                                  } else {
                                    console.error('Walking directions also failed:', walkStatus);
                                  }
                                }
                              );
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
          
          {/* New Case Alert - Inside Map */}
          <AnimatePresence>
            {showNewCaseAlert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-10"
              >
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <MapPin className="relative h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">New Report Added!</h4>
                  <p className="text-xs text-green-50">Check the map for new pin</p>
                </div>
                <button
                  onClick={() => setShowNewCaseAlert(false)}
                  className="hover:bg-white/20 p-1 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Barangay Name - Top Left */}
          <div className="absolute top-4 sm:top-15 left-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-3 sm:px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-600 border-l-4 border-l-[#1B365D] max-w-[200px] sm:max-w-none">
              <h3 className="font-bold text-xs sm:text-sm text-[#1B365D] dark:text-blue-400 truncate">Barangay Sambag I</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate">Urgello Street, Cebu City</p>
            </div>

            {/* Legend - Inside Map on Bottom Left Side */}
            <div className="absolute bottom-4 left-2 sm:left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-600 border-l-4 border-l-[#CE1126] max-w-[180px] sm:max-w-none">
              <h3 className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">Symptom Severity</h3>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-4 h-5 sm:w-5 sm:h-6" style={{ 
                    background: '#10B981',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  }}></div>
                  <span className="text-xs text-gray-700 dark:text-gray-200">Low (1)</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-4 h-5 sm:w-5 sm:h-6" style={{ 
                    background: '#F59E0B',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  }}></div>
                  <span className="text-xs text-gray-700 dark:text-gray-200">Medium (2-3)</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-4 h-5 sm:w-5 sm:h-6" style={{ 
                    background: '#DC2626',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  }}></div>
                  <span className="text-xs text-gray-700 dark:text-gray-200">High (4+)</span>
                </div>
              </div>
            </div>
        </div>

      {selectedReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 sm:bottom-8 right-2 sm:right-8 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-2xl border border-gray-200 dark:border-gray-600 border-l-4 border-l-blue-400 max-w-[calc(100vw-16px)] sm:max-w-md z-50"
        >
          <button
            onClick={() => {
              setSelectedReport(null);
              setDirections(null);
            }}
            className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100">
            <img src="/sentinel_ph_logo.png" alt="SentinelPH" className="h-8 sm:h-10" />
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Symptom Report</h4>
              <p className="text-xs text-gray-400 dark:text-gray-500">ID: {selectedReport.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              {selectedReport.userSelfieUrl ? (
                <img 
                  src={selectedReport.userSelfieUrl} 
                  alt={selectedReport.userName}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-sm">
                  {selectedReport.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg sm:text-xl text-[#1B365D] dark:text-blue-400 mb-1 truncate">{selectedReport.userName}</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  {selectedReport.location}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Symptoms Reported</span>
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                {selectedReport.symptoms?.map((symptom, idx) => (
                  <span key={idx} className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Description</span>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 mt-1 leading-relaxed">{selectedReport.description}</p>
              </div>
              {selectedReport.proofImageUrl && (
                <img 
                  src={selectedReport.proofImageUrl} 
                  alt="Proof" 
                  className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600 flex-shrink-0"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Report Type:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedReport.reportType === 'observed' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {selectedReport.reportType === 'observed' ? 'Observed' : 'Self-Reported'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
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
              <span className="text-xs text-gray-500 dark:text-gray-400">
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
