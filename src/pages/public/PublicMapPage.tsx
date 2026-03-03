import { useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import Navbar from '@/components/Navbar';

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

export default function PublicMapPage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });
  
  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SymptomReport | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    getUserLocation();
    fetchVerifiedReports();
  }, []);

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

  const fetchVerifiedReports = async () => {
    try {
      const reportsRef = collection(db, 'symptomReports');
      const q = query(reportsRef, where('status', '==', 'verified'));
      const snapshot = await getDocs(q);
      
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        latitude: doc.data().latitude,
        longitude: doc.data().longitude
      })) as SymptomReport[];
      
      const data = reportsData.filter((report): report is SymptomReport => 
        typeof report.latitude === 'number' && typeof report.longitude === 'number'
      );
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  if (loadError) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 p-8 text-center text-red-600">Error loading maps</div>
    </div>
  );
  
  if (!isLoaded) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1B365D] rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20">
        <div className="p-2 bg-gray-50 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-sm p-6 shadow-md border border-blue-100">
              <div className="flex items-center gap-4">
                <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-3 rounded-lg shadow-sm">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-linear-to-r from-[#1B365D] to-indigo-600 bg-clip-text text-transparent mb-1">Public Health Map</h1>
                  <p className="text-gray-600 text-sm">Verified community health reports across the Philippines</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-white shadow-sm border border-gray-100 overflow-hidden relative">
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
                  }}
                />
              )}

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
                            if (status === google.maps.DirectionsStatus.OK && result) {
                              setDirections(result);
                            } else {
                              // Fallback to walking if driving fails
                              directionsService.route(
                                {
                                  origin: userLocation,
                                  destination: { lat: report.latitude, lng: report.longitude },
                                  travelMode: google.maps.TravelMode.WALKING,
                                },
                                (walkResult, walkStatus) => {
                                  if (walkStatus === google.maps.DirectionsStatus.OK && walkResult) {
                                    setDirections(walkResult);
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
            
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 shadow-lg border border-gray-200">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Verified Reports</h3>
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
          </div>

          {selectedReport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-8 right-8 bg-white p-6 shadow-2xl border border-gray-200 max-w-md z-50"
            >
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setDirections(null);
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                    A
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-[#1B365D] mb-1">Anonymous Report</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedReport.location}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Symptoms</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedReport.symptoms?.map((symptom, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    VERIFIED
                  </span>
                  <div className="flex items-center gap-2">
                    {userLocation && (
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedReport.latitude},${selectedReport.longitude}`;
                          window.open(url, '_blank');
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Get Directions"
                      >
                        <Navigation className="h-4 w-4" />
                      </button>
                    )}
                    <span className="text-xs text-gray-500">
                      {selectedReport.createdAt?.toDate?.()?.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}