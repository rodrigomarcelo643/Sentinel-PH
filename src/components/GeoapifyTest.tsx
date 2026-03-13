import React, { useState, useEffect } from 'react';
import { geoapifyService, type PhilippineRegion, type PhilippineMunicipality } from '@/services/geoapifyService';

export const GeoapifyTest: React.FC = () => {
  const [regions, setRegions] = useState<PhilippineRegion[]>([]);
  const [municipalities, setMunicipalities] = useState<PhilippineMunicipality[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadRegions = async () => {
      try {
        setLoading(true);
        const regionsData = await geoapifyService.getPhilippineRegions();
        setRegions(regionsData);
        console.log('Loaded regions:', regionsData);
      } catch (err) {
        setError('Failed to load regions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRegions();
  }, []);

  const handleRegionChange = async (regionName: string) => {
    setSelectedRegion(regionName);
    setMunicipalities([]);
    
    if (!regionName) return;

    try {
      setLoading(true);
      const municipalitiesData = await geoapifyService.getMunicipalitiesByRegion(regionName);
      setMunicipalities(municipalitiesData);
      console.log(`Loaded ${municipalitiesData.length} municipalities for ${regionName}:`, municipalitiesData);
    } catch (err) {
      setError(`Failed to load municipalities for ${regionName}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Geoapify Service Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Regions ({regions.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {regions.map((region) => (
              <button
                key={region.code}
                onClick={() => handleRegionChange(region.name)}
                className={`w-full text-left p-3 rounded border transition-colors ${
                  selectedRegion === region.name
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{region.name}</div>
                <div className="text-sm text-gray-600">{region.fullName}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">
            Municipalities ({municipalities.length})
            {selectedRegion && ` - ${selectedRegion}`}
          </h2>
          
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading...</span>
            </div>
          )}

          {!loading && selectedRegion && municipalities.length === 0 && (
            <div className="text-gray-500 p-4 text-center">
              No municipalities found for {selectedRegion}
            </div>
          )}

          {!loading && !selectedRegion && (
            <div className="text-gray-500 p-4 text-center">
              Select a region to see municipalities
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {municipalities.map((muni, index) => (
              <div
                key={`${muni.name}-${index}`}
                className="p-3 bg-gray-50 rounded border"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{muni.name}</span>
                  <div className="flex items-center gap-2">
                    {muni.type === 'city' && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        City
                      </span>
                    )}
                    {muni.province && (
                      <span className="text-xs text-gray-500">{muni.province}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {muni.lat.toFixed(4)}, {muni.lon.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>API Key: {import.meta.env.VITE_GEOAPIFY_API_KEY ? 'Set' : 'Not Set'}</div>
          <div>Debug Mode: {import.meta.env.VITE_DEBUG_GEOAPIFY || 'false'}</div>
          <div>Regions Loaded: {regions.length}</div>
          <div>Selected Region: {selectedRegion || 'None'}</div>
          <div>Municipalities: {municipalities.length}</div>
        </div>
      </div>
    </div>
  );
};

export default GeoapifyTest;