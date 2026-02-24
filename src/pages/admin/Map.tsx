import { useEffect, useRef, useState } from 'react';
import { MapPin, Maximize2, Minimize2, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const outbreakReports = [
  { id: 1, lat: 10.3157, lng: 123.8854, title: 'Dengue Cluster', severity: 'high', count: 15, location: 'Cebu City', date: '2024-01-15' },
  { id: 2, lat: 10.2935, lng: 123.9025, title: 'Flu Outbreak', severity: 'medium', count: 8, location: 'Mandaue City', date: '2024-01-14' },
  { id: 3, lat: 10.3103, lng: 123.9619, title: 'Diarrhea Cases', severity: 'low', count: 5, location: 'Lapu-Lapu City', date: '2024-01-13' },
  { id: 4, lat: 10.2449, lng: 123.8493, title: 'Fever Reports', severity: 'medium', count: 12, location: 'Talisay City', date: '2024-01-15' },
  { id: 5, lat: 10.3521, lng: 123.8644, title: 'Cough/Cold', severity: 'low', count: 6, location: 'Consolacion', date: '2024-01-12' },
  { id: 6, lat: 10.3333, lng: 123.7500, title: 'Skin Rash', severity: 'medium', count: 9, location: 'Toledo City', date: '2024-01-14' },
  { id: 7, lat: 10.5167, lng: 124.0000, title: 'Stomach Pain', severity: 'low', count: 4, location: 'Danao City', date: '2024-01-11' },
  { id: 8, lat: 10.2833, lng: 123.8667, title: 'Dengue Alert', severity: 'high', count: 18, location: 'Minglanilla', date: '2024-01-15' },
];

// Function to generate OpenStreetMap iframe URL with markers
const getCebuMapEmbedUrl = () => {
  const center = '10.3157,123.8854'; // Cebu City center
  const zoom = 12;
  
  // Create markers for each report using OpenStreetMap query format
  // This adds pins for each location
  const markers = outbreakReports.map(report => {
    return `&marker=${report.lat},${report.lng}`;
  }).join('');
  
  // Using OpenStreetMap's embed feature (completely free, no API key)
  return `https://www.openstreetmap.org/export/embed.html?bbox=123.75%2C10.15%2C124.05%2C10.55&layer=mapnik&marker=${center}${markers}`;
};

// Alternative: Use a more visual map with better styling (still free)
const getCebuMapWithStyle = () => {
  return `https://www.openstreetmap.org/export/embed.html?bbox=123.75%2C10.15%2C124.05%2C10.55&layer=transportmap&marker=10.3157%2C123.8854`;
};

export default function Map() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<typeof outbreakReports[0] | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Calculate stats
  const totalCases = outbreakReports.reduce((sum, r) => sum + r.count, 0);
  const cebuCityCases = outbreakReports
    .filter(r => r.location === 'Cebu City')
    .reduce((sum, r) => sum + r.count, 0);
  const highSeverityCount = outbreakReports.filter(r => r.severity === 'high').length;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1B365D] mb-2 flex items-center gap-2">
              <MapPin className="h-8 w-8" />
               Outbreak Map
            </h1>
            <p className="text-gray-600">
              Real-time visualization of outbreak reports across Cebu region
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#CE1126]"></span>
              <span className="font-medium">High Severity</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#f59e0b]"></span>
              <span className="font-medium">Medium Severity</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#10b981]"></span>
              <span className="font-medium">Low Severity</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Reports</p>
          <p className="text-2xl font-bold text-[#1B365D]">{outbreakReports.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Cases</p>
          <p className="text-2xl font-bold text-[#1B365D]">{totalCases}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Cebu City Cases</p>
          <p className="text-2xl font-bold text-[#CE1126]">{cebuCityCases}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">High Severity</p>
          <p className="text-2xl font-bold text-[#CE1126]">{highSeverityCount}</p>
        </div>
      </motion.div>

      {/* Main Map Frame - Cebu City Focus */}
      <motion.div
        ref={mapContainerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative"
      >

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={toggleFullscreen}
            className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
          <button
            onClick={() => window.open('https://www.openstreetmap.org/#map=12/10.3157/123.8854', '_blank')}
            className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          >
            <Navigation className="h-5 w-5" />
          </button>
        </div>

        {/* Embedded OpenStreetMap Frame */}
        <div className="w-full h-[600px] relative">
          <iframe
            title="Cebu City Outbreak Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={getCebuMapEmbedUrl()}
            style={{ border: 0 }}
            allowFullScreen
          />
          
          {/* Custom Overlay Pins (since iframe can't be directly modified, we add a note) */}
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg shadow-lg p-3 max-w-xs">
            <h4 className="font-bold text-[#1B365D] mb-2">📍 Outbreak Locations</h4>
            <div className="space-y-1 text-sm">
              {outbreakReports.slice(0, 5).map(report => (
                <div key={report.id} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    report.severity === 'high' ? 'bg-[#CE1126]' : 
                    report.severity === 'medium' ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                  }`}></span>
                  <span>{report.location}</span>
                  <span className="text-gray-500">({report.count} cases)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Location Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {Object.entries(
          outbreakReports.reduce((acc, report) => {
            if (!acc[report.location]) {
              acc[report.location] = {
                total: 0,
                reports: [],
                highestSeverity: 'low' as 'high' | 'medium' | 'low'
              };
            }
            acc[report.location].total += report.count;
            acc[report.location].reports.push(report);
            
            const severityValue = { high: 3, medium: 2, low: 1 };
            if (severityValue[report.severity] > severityValue[acc[report.location].highestSeverity]) {
              acc[report.location].highestSeverity = report.severity;
            }
            
            return acc;
          }, {} as Record<string, { total: number; reports: typeof outbreakReports; highestSeverity: 'high' | 'medium' | 'low' }>)
        ).map(([location, data]) => (
          <motion.div
            key={location}
            whileHover={{ scale: 1.02 }}
            className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all ${
              selectedLocation === location ? 'ring-2 ring-[#1B365D]' : ''
            } ${location === 'Cebu City' ? 'border-[#CE1126] border-2 bg-red-50' : 'border-gray-100'}`}
            onClick={() => setSelectedLocation(location === selectedLocation ? null : location)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-gray-900">
                {location === 'Cebu City' && '📍 '}
                {location}
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                data.highestSeverity === 'high' ? 'bg-[#CE1126]' : 
                data.highestSeverity === 'medium' ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
              }`}>
                {data.highestSeverity}
              </span>
            </div>
            
            <div className="text-2xl font-bold text-[#1B365D] mb-2">
              {data.total} <span className="text-sm font-normal text-gray-500">cases</span>
            </div>

            <div className="space-y-1">
              {data.reports.slice(0, 2).map(report => (
                <div 
                  key={report.id} 
                  className="text-sm flex justify-between items-center hover:bg-gray-50 p-1 rounded cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReport(report);
                  }}
                >
                  <span className="text-gray-600">{report.title}</span>
                  <span className={`font-semibold ${
                    report.severity === 'high' ? 'text-[#CE1126]' : 
                    report.severity === 'medium' ? 'text-[#f59e0b]' : 'text-[#10b981]'
                  }`}>
                    {report.count}
                  </span>
                </div>
              ))}
              {data.reports.length > 2 && (
                <p className="text-xs text-gray-400">+{data.reports.length - 2} more reports</p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Detailed Reports Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1B365D]">{selectedReport.title}</h2>
                <span className={`px-3 py-1 rounded text-xs font-bold text-white ${
                  selectedReport.severity === 'high' ? 'bg-[#CE1126]' : 
                  selectedReport.severity === 'medium' ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                }`}>
                  {selectedReport.severity.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{selectedReport.location}</span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Cases</p>
                  <p className="text-3xl font-bold text-[#1B365D]">{selectedReport.count}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Report Date:</span>
                  <span className="font-semibold">{selectedReport.date}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Coordinates:</span>
                  <span className="font-mono text-xs">{selectedReport.lat.toFixed(4)}, {selectedReport.lng.toFixed(4)}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-[#1B365D] text-white py-2 rounded-lg hover:bg-[#2A4A7A] transition-colors"
                  onClick={() => {
                    window.open(`https://www.openstreetmap.org/?mlat=${selectedReport.lat}&mlon=${selectedReport.lng}#map=15/${selectedReport.lat}/${selectedReport.lng}`, '_blank');
                  }}
                >
                  View on Map
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4"
      >
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#CE1126]"></div>
              <span className="text-sm">High Severity (10+ cases)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#f59e0b]"></div>
              <span className="text-sm">Medium Severity (5-9 cases)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#10b981]"></div>
              <span className="text-sm">Low Severity (1-4 cases)</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Map data © OpenStreetMap contributors | Click on any location card for details
          </p>
        </div>
      </motion.div>
    </div>
  );
}