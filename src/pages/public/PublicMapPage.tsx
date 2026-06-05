import { useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { MapPin, Navigation, X } from 'lucide-react';
import Navbar from '@/components/Navbar';

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 64px)', // Full height minus navbar
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
      
      <div className="pt-16">
        <div className="bg-gray-50 min-h-screen">
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
                fullscreenControl: true,
                fullscreenControlOptions: {
                  position: google.maps.ControlPosition.TOP_RIGHT,
                },
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
            
            {/* Map Legend - Bottom Left */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-[5px] shadow-lg border border-gray-200 z-10">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Verified Reports</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-6" style={{ 
                    background: '#10B981',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  }}></div>
                  <span className="text-xs text-gray-700">Low (1 symptom)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-6" style={{ 
                    background: '#F59E0B',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  }}></div>
                  <span className="text-xs text-gray-700">Medium (2-3 symptoms)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-6" style={{ 
                    background: '#DC2626',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  }}></div>
                  <span className="text-xs text-gray-700">High (4+ symptoms)</span>
                </div>
              </div>
            </div>

            {/* Selected Report Modal - Fixed position that stays visible in fullscreen */}
            {selectedReport && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed bottom-6 right-6 bg-white rounded-[5px] shadow-2xl border border-gray-200 w-96 max-w-[calc(100vw-3rem)] z-[100] overflow-hidden"
                style={{
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div className="relative">
                  {/* Header with gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
                  
                  <button
                    onClick={() => {
                      setSelectedReport(null);
                      setDirections(null);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-[5px] transition-colors z-10"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  <div className="p-5 pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">Health Report</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{selectedReport.location || 'Location reported'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Symptoms Section */}
                    <div className="bg-gray-50 rounded-[5px] p-3 mb-4">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Reported Symptoms</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedReport.symptoms?.map((symptom, idx) => (
                          <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Description if available */}
                    {selectedReport.description && (
                      <div className="mb-4">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Additional Info</span>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">{selectedReport.description}</p>
                      </div>
                    )}

                    {/* Footer with status and actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        ✓ VERIFIED
                      </span>
                      <div className="flex items-center gap-3">
                        {userLocation && (
                          <button
                            onClick={() => {
                              const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedReport.latitude},${selectedReport.longitude}`;
                              window.open(url, '_blank');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-[5px] transition-colors text-xs font-semibold"
                            title="Get Directions"
                          >
                            <Navigation className="h-3.5 w-3.5" />
                            Directions
                          </button>
                        )}
                        <span className="text-xs text-gray-400">
                          {selectedReport.createdAt?.toDate?.()?.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}