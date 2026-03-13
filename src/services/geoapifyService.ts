import axios from 'axios';
import type { 
  GeoapifyPlace, 
  PhilippineRegion, 
  PhilippineMunicipality, 
  PhilippineDistrict, 
  PhilippineBarangay 
} from '@/@types/services/geoapify';

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const BASE_URL = 'https://api.geoapify.com/v1/geocode';

class GeoapifyService {
  private debugMode = import.meta.env.VITE_DEBUG_GEOAPIFY === 'true';
  
  private isApiKeyConfigured(): boolean {
    return !!(GEOAPIFY_API_KEY && GEOAPIFY_API_KEY !== 'your_geoapify_api_key_here');
  }
  
  // Test method to check API connectivity
  async testApiConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      if (!this.isApiKeyConfigured()) {
        return {
          success: false,
          message: 'API key not configured. Please set VITE_GEOAPIFY_API_KEY in your .env file.'
        };
      }
      
      // Use a simple, guaranteed-to-work request
      const response = await this.makeRequest('/search', {
        text: 'Manila Philippines',
        limit: 1
      });
      
      if (response.results && response.results.length > 0) {
        return {
          success: true,
          message: 'API connection successful',
          data: {
            resultsCount: response.results.length,
            firstResult: response.results[0]?.display_name || 'No display name'
          }
        };
      } else {
        return {
          success: false,
          message: 'API connected but returned no results'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  private async makeRequest(endpoint: string, params: Record<string, any>) {
    if (!this.isApiKeyConfigured()) {
      if (this.debugMode) {
        console.warn('Geoapify API key not configured, using fallback data');
      }
      throw new Error('API key not configured');
    }
    
    if (this.debugMode) {
      console.log('Geoapify API Request:', { endpoint, params });
    }
    
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        params: {
          ...params,
          apiKey: GEOAPIFY_API_KEY,
          format: 'json',
          limit: params.limit || 50
        },
        timeout: 10000 // 10 second timeout
      });
      
      if (this.debugMode) {
        console.log('Geoapify API Response:', {
          status: response.status,
          resultsCount: response.data?.results?.length || 0,
          data: response.data
        });
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const statusText = error.response?.statusText;
        const errorData = error.response?.data;
        
        console.error('Geoapify API error:', {
          status,
          statusText,
          errorData,
          url: error.config?.url,
          params: error.config?.params
        });
        
        if (status === 400) {
          throw new Error(`Bad Request: Invalid search parameters. ${errorData?.message || ''}`);
        } else if (status === 401) {
          throw new Error('Unauthorized: Invalid API key');
        } else if (status === 403) {
          throw new Error('Forbidden: API key quota exceeded or access denied');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded: Too many requests');
        } else {
          throw new Error(`API error ${status}: ${statusText}`);
        }
      } else {
        console.error('Network error:', error);
        throw new Error('Network error: Failed to connect to Geoapify API');
      }
    }
  }

  async getPhilippineRegions(): Promise<PhilippineRegion[]> {
    try {
      if (this.debugMode) {
        console.log('Fetching Philippine regions from API...');
      }

      // Try simpler, more targeted search strategies
      const searchStrategies = [
        {
          text: 'Philippines',
          filter: 'countrycode:ph',
          type: 'country'
        },
        {
          text: 'Metro Manila Philippines',
          filter: 'countrycode:ph'
        },
        {
          text: 'Cebu Philippines',
          filter: 'countrycode:ph'
        }
      ];

      let apiRegions: PhilippineRegion[] = [];

      for (const strategy of searchStrategies) {
        try {
          const response = await this.makeRequest('/search', {
            ...strategy,
            limit: 50
          });

          if (response.results && response.results.length > 0) {
            if (this.debugMode) {
              console.log(`Search strategy returned ${response.results.length} results:`, response.results.slice(0, 3));
            }

            // Extract regions from the results
            const regions = response.results
              .filter((place: GeoapifyPlace) => place.country_code === 'ph')
              .map((place: GeoapifyPlace) => {
                // Try to extract region info from various fields
                const stateName = place.state || place.county || place.district || '';
                if (!stateName) return null;
                
                const regionName = this.mapRegionName(stateName);
                if (!regionName || regionName === stateName) return null;
                
                return {
                  name: regionName,
                  fullName: stateName,
                  code: regionName,
                  lat: place.lat,
                  lon: place.lon
                };
              })
              .filter((region: PhilippineRegion | null): region is PhilippineRegion => region !== null)
              .filter((region: PhilippineRegion, index: number, self: PhilippineRegion[]) => 
                index === self.findIndex((r: PhilippineRegion) => r.code === region.code)
              );

            if (regions.length > apiRegions.length) {
              apiRegions = regions;
            }
            
            // If we found some regions, break early
            if (regions.length > 0) {
              break;
            }
          }
        } catch (error) {
          if (this.debugMode) {
            console.log(`Search strategy failed:`, error);
          }
          continue;
        }
      }

      // Get comprehensive fallback regions
      const fallbackRegions = this.getFallbackRegions();
      
      if (this.debugMode) {
        console.log('API regions found:', apiRegions.length);
        console.log('Fallback regions available:', fallbackRegions.length);
      }

      // Always prioritize fallback data for completeness since Geoapify 
      // doesn't have comprehensive Philippine administrative region data
      let finalRegions = fallbackRegions;
      
      if (apiRegions.length > 0) {
        if (this.debugMode) {
          console.log('API returned some regions, but using fallback for completeness');
        }
        // Could potentially enhance fallback data with API coordinates here
        // For now, stick with reliable fallback data
      }

      if (this.debugMode) {
        console.log('Final regions:', finalRegions.map(r => `${r.name} - ${r.fullName}`));
      }

      return finalRegions;
    } catch (error) {
      console.error('Error fetching Philippine regions:', error);
      if (this.debugMode) {
        console.log('Falling back to static regions due to error');
      }
      return this.getFallbackRegions();
    }
  }

  async getMunicipalitiesByRegion(regionName: string): Promise<PhilippineMunicipality[]> {
    try {
      // First, try to get fallback data immediately for better UX
      const fallbackMunicipalities = this.getFallbackMunicipalities(regionName);
      
      // If we have fallback data, return it immediately and optionally enhance with API data
      if (fallbackMunicipalities.length > 0) {
        // Return fallback data immediately
        setTimeout(async () => {
          try {
            // Try to enhance with API data in the background
            const apiMunicipalities = await this.fetchMunicipalitiesFromAPI(regionName);
            if (apiMunicipalities.length > fallbackMunicipalities.length) {
              // If API returns more data, we could potentially update the UI
              // For now, we'll just log it
              console.log(`Enhanced data available for ${regionName}:`, apiMunicipalities.length, 'municipalities');
            }
          } catch (error) {
            console.log('Background API enhancement failed, using fallback data');
          }
        }, 100);
        
        return fallbackMunicipalities;
      }
      
      // If no fallback data, try API
      return await this.fetchMunicipalitiesFromAPI(regionName);
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      // Return fallback data as last resort
      return this.getFallbackMunicipalities(regionName);
    }
  }

  private async fetchMunicipalitiesFromAPI(regionName: string): Promise<PhilippineMunicipality[]> {
    // Try simpler search strategies to avoid 400 errors
    const searchStrategies = [
      {
        text: `${regionName} Philippines`,
        filter: 'countrycode:ph'
      },
      {
        text: `Philippines ${regionName}`,
        filter: 'countrycode:ph'
      }
    ];

    for (const strategy of searchStrategies) {
      try {
        const response = await this.makeRequest('/search', {
          ...strategy,
          limit: 50
        });

        if (response.results && response.results.length > 0) {
          const municipalities: PhilippineMunicipality[] = response.results
            .filter((place: GeoapifyPlace) => 
              place.country_code === 'ph' && 
              (place.city || place.municipality || place.name) &&
              this.isInRegion(place, regionName)
            )
            .map((place: GeoapifyPlace) => {
              const name = (place.city || place.municipality || place.name || '').trim();
              return {
                name,
                region: regionName,
                province: place.county,
                lat: place.lat,
                lon: place.lon,
                type: this.getMunicipalityType(name)
              };
            })
            .filter((muni: PhilippineMunicipality) => muni.name && muni.name.length > 0) // Ensure no empty names
            .filter((muni: PhilippineMunicipality, index: number, self: PhilippineMunicipality[]) => 
              index === self.findIndex((m: PhilippineMunicipality) => m.name.toLowerCase() === muni.name.toLowerCase())
            )
            .sort((a: PhilippineMunicipality, b: PhilippineMunicipality) => a.name.localeCompare(b.name));

          if (municipalities.length > 0) {
            return municipalities;
          }
        }
      } catch (error) {
        if (this.debugMode) {
          console.log(`Municipality search strategy failed:`, error);
        }
        continue;
      }
    }

    throw new Error('All municipality search strategies failed');
  }

  async searchMunicipalities(query: string): Promise<PhilippineMunicipality[]> {
    try {
      const response = await this.makeRequest('/search', {
        text: `${query} Philippines`,
        filter: 'countrycode:ph',
        type: 'city,locality'
      });

      return response.results
        ?.filter((place: GeoapifyPlace) => 
          place.country_code === 'ph' && (place.city || place.municipality)
        )
        .map((place: GeoapifyPlace) => ({
          name: place.city || place.municipality || place.name,
          region: this.getRegionFromState(place.state),
          province: place.county,
          lat: place.lat,
          lon: place.lon,
          type: this.getMunicipalityType(place.name)
        })) || [];
    } catch (error) {
      console.error('Error searching municipalities:', error);
      return [];
    }
  }

  private mapRegionName(stateName: string): string {
    if (!stateName) return '';
    
    const regionMap: Record<string, string> = {
      // Official names
      'National Capital Region': 'NCR',
      'Cordillera Administrative Region': 'CAR',
      'Ilocos Region': 'Region I',
      'Cagayan Valley': 'Region II',
      'Central Luzon': 'Region III',
      'CALABARZON': 'Region IV-A',
      'MIMAROPA': 'Region IV-B',
      'Bicol Region': 'Region V',
      'Western Visayas': 'Region VI',
      'Central Visayas': 'Region VII',
      'Eastern Visayas': 'Region VIII',
      'Zamboanga Peninsula': 'Region IX',
      'Northern Mindanao': 'Region X',
      'Davao Region': 'Region XI',
      'SOCCSKSARGEN': 'Region XII',
      'Caraga': 'Region XIII',
      'Bangsamoro Autonomous Region in Muslim Mindanao': 'BARMM',
      
      // Alternative names and variations
      'Metro Manila': 'NCR',
      'Manila': 'NCR',
      'Cordillera': 'CAR',
      'Ilocos': 'Region I',
      'Cagayan': 'Region II',
      'Luzon': 'Region III',
      'Calabarzon': 'Region IV-A',
      'Mimaropa': 'Region IV-B',
      'Bicol': 'Region V',
      'Western Visayas Region': 'Region VI',
      'Central Visayas Region': 'Region VII',
      'Eastern Visayas Region': 'Region VIII',
      'Zamboanga': 'Region IX',
      'Northern Mindanao Region': 'Region X',
      'Davao': 'Region XI',
      'Soccsksargen': 'Region XII',
      'Caraga Region': 'Region XIII',
      'ARMM': 'BARMM',
      'Bangsamoro': 'BARMM',
      
      // Province-based mapping for cases where state info is actually province
      'Cebu': 'Region VII',
      'Bohol': 'Region VII',
      'Negros Oriental': 'Region VII',
      'Siquijor': 'Region VII',
      'Rizal': 'Region IV-A',
      'Cavite': 'Region IV-A',
      'Laguna': 'Region IV-A',
      'Batangas': 'Region IV-A',
      'Quezon': 'Region IV-A'
    };
    
    // Try exact match first
    if (regionMap[stateName]) {
      return regionMap[stateName];
    }
    
    // Try case-insensitive match
    const lowerStateName = stateName.toLowerCase();
    for (const [key, value] of Object.entries(regionMap)) {
      if (key.toLowerCase() === lowerStateName) {
        return value;
      }
    }
    
    // Try partial match for region numbers
    const regionMatch = stateName.match(/region\s*(\w+)/i);
    if (regionMatch) {
      const regionNum = regionMatch[1].toUpperCase();
      if (regionNum === 'IV') return 'Region IV-A'; // Default IV to IV-A
      return `Region ${regionNum}`;
    }
    
    // If no match found, return the original name
    return stateName;
  }

  private getRegionFromState(stateName: string): string {
    return this.mapRegionName(stateName);
  }

  private isInRegion(place: GeoapifyPlace, regionName: string): boolean {
    if (!place.state && !place.county) return true; // If no state info, assume it matches
    
    // Check if the place's state matches the region
    if (place.state) {
      const placeRegion = this.mapRegionName(place.state);
      if (placeRegion === regionName) return true;
    }
    
    // Also check county/province for additional matching
    if (place.county) {
      // Some places might have province info that helps identify the region
      const countyLower = place.county.toLowerCase();
      const regionLower = regionName.toLowerCase();
      
      // Special cases for known province-region mappings
      const provinceRegionMap: Record<string, string> = {
        'cebu': 'region vii',
        'bohol': 'region vii', 
        'negros oriental': 'region vii',
        'siquijor': 'region vii',
        'metro manila': 'ncr',
        'rizal': 'region iv-a',
        'cavite': 'region iv-a',
        'laguna': 'region iv-a',
        'batangas': 'region iv-a',
        'quezon': 'region iv-a'
      };
      
      if (provinceRegionMap[countyLower] === regionLower) {
        return true;
      }
    }
    
    return false;
  }

  private getMunicipalityType(name: string): PhilippineMunicipality['type'] {
    const nameLower = name.toLowerCase();
    
    // Highly Urbanized Cities (HUCs)
    const hucList = ['quezon city', 'manila', 'caloocan', 'las piñas', 'makati', 'malabon', 'mandaluyong', 'marikina', 'muntinlupa', 'navotas', 'parañaque', 'pasay', 'pasig', 'san juan', 'taguig', 'valenzuela', 'cebu city', 'davao city', 'cagayan de oro', 'zamboanga city', 'antipolo', 'tarlac city', 'angeles city', 'olongapo', 'iloilo city', 'bacolod', 'general santos', 'butuan', 'iligan', 'tacloban', 'mandaue', 'lapu-lapu', 'baguio'];
    
    // Independent Component Cities (ICCs)
    const iccList = ['santiago', 'cotabato city', 'dagupan', 'naga', 'ormoc', 'puerto princesa', 'san carlos', 'toledo'];
    
    // Component Cities
    const componentCityList = ['alaminos', 'angeles', 'bago', 'bais', 'balanga', 'batac', 'bayawan', 'biñan', 'bislig', 'bogo', 'borongan', 'cabadbaran', 'cabanatuan', 'cabuyao', 'cadiz', 'calamba', 'calapan', 'calbayog', 'candon', 'canlaon', 'carcar', 'catbalogan', 'cauayan', 'cavite city', 'danao', 'dapitan', 'dasmariñas', 'digos', 'dipolog', 'dumaguete', 'escalante', 'gapan', 'gingoog', 'guihulngan', 'himamaylan', 'iriga', 'kabankalan', 'kidapawan', 'koronadal', 'la carlota', 'lamitan', 'laoag', 'las piñas', 'legazpi', 'ligao', 'lipa', 'lucena', 'maasin', 'mabalacat', 'malaybalay', 'malolos', 'marawi', 'masbate city', 'mati', 'meycauayan', 'muñoz', 'naga', 'navotas', 'olongapo', 'oroquieta', 'ozamiz', 'pagadian', 'palayan', 'panabo', 'passi', 'puerto princesa', 'roxas', 'sagay', 'san carlos', 'san fernando', 'san jose', 'san jose del monte', 'san pablo', 'santa rosa', 'silay', 'sipalay', 'sorsogon city', 'surigao city', 'tabaco', 'tabuk', 'tagaytay', 'tagbilaran', 'talisay', 'tanauan', 'tandag', 'tangub', 'tanjay', 'tarlac city', 'tayabas', 'toledo', 'trece martires', 'tuguegarao', 'urdaneta', 'valencia', 'victorias', 'vigan', 'zamboanga city'];
    
    if (hucList.some(city => nameLower.includes(city))) {
      return 'highly_urbanized_city';
    }
    
    if (iccList.some(city => nameLower.includes(city))) {
      return 'independent_component_city';
    }
    
    if (componentCityList.some(city => nameLower.includes(city)) || nameLower.includes('city')) {
      return 'component_city';
    }
    
    // Check for districts
    if (nameLower.includes('district') || nameLower.includes('distrito')) {
      return 'district';
    }
    
    return 'municipality';
  }

  async getDistrictsByMunicipality(municipalityName: string, regionName: string): Promise<PhilippineDistrict[]> {
    try {
      // Try API first
      const response = await this.makeRequest('/search', {
        text: `${municipalityName} ${regionName} districts Philippines`,
        filter: 'countrycode:ph',
        limit: 30
      });

      if (response.results && response.results.length > 0) {
        const districts: PhilippineDistrict[] = response.results
          .filter((place: GeoapifyPlace) => 
            place.country_code === 'ph' && 
            (place.district || place.name.toLowerCase().includes('district'))
          )
          .map((place: GeoapifyPlace) => ({
            name: place.district || place.name,
            municipality: municipalityName,
            region: regionName,
            type: this.getDistrictType(place.district || place.name),
            lat: place.lat,
            lon: place.lon
          }))
          .filter((district: PhilippineDistrict, index: number, self: PhilippineDistrict[]) => 
            index === self.findIndex((d: PhilippineDistrict) => d.name.toLowerCase() === district.name.toLowerCase())
          )
          .sort((a: PhilippineDistrict, b: PhilippineDistrict) => a.name.localeCompare(b.name));

        if (districts.length > 0) {
          return districts;
        }
      }
    } catch (error) {
      if (this.debugMode) {
        console.log('API districts fetch failed:', error);
      }
    }

    // Fallback to static districts data
    return this.getFallbackDistricts(municipalityName, regionName);
  }

  async getBarangaysByMunicipality(municipalityName: string, regionName: string): Promise<PhilippineBarangay[]> {
    try {
      if (this.debugMode) {
        console.log(`Loading barangays for municipality: ${municipalityName}, region: ${regionName}`);
      }

      // First, get fallback data immediately for better UX
      const fallbackBarangays = this.getFallbackBarangays(municipalityName, regionName);
      
      if (fallbackBarangays.length > 0) {
        if (this.debugMode) {
          console.log(`Found ${fallbackBarangays.length} fallback barangays for ${municipalityName}`);
        }
        return fallbackBarangays;
      }

      // If no fallback data, try API
      if (this.isApiKeyConfigured()) {
        try {
          const response = await this.makeRequest('/search', {
            text: `${municipalityName} ${regionName} barangay Philippines`,
            filter: 'countrycode:ph',
            limit: 50
          });

          if (response.results && response.results.length > 0) {
            const barangays: PhilippineBarangay[] = response.results
              .filter((place: GeoapifyPlace) => 
                place.country_code === 'ph' && 
                (place.name.toLowerCase().includes('barangay') || 
                 place.address_line2?.toLowerCase().includes('barangay'))
              )
              .map((place: GeoapifyPlace) => ({
                name: place.name.replace(/^barangay\s+/i, ''),
                municipality: municipalityName,
                region: regionName,
                type: this.getBarangayType(place.name),
                lat: place.lat,
                lon: place.lon,
                postal_code: place.postcode,
                address_line: place.address_line1
              }))
              .filter((barangay: PhilippineBarangay, index: number, self: PhilippineBarangay[]) => 
                index === self.findIndex((b: PhilippineBarangay) => b.name.toLowerCase() === barangay.name.toLowerCase())
              )
              .sort((a: PhilippineBarangay, b: PhilippineBarangay) => a.name.localeCompare(b.name));

            if (barangays.length > 0) {
              if (this.debugMode) {
                console.log(`Found ${barangays.length} API barangays for ${municipalityName}`);
              }
              return barangays;
            }
          }
        } catch (error) {
          if (this.debugMode) {
            console.log('API barangays fetch failed:', error);
          }
        }
      }

      // If no API data and no fallback data, return empty array
      if (this.debugMode) {
        console.log(`No barangays found for ${municipalityName}`);
      }
      return [];
    } catch (error) {
      console.error('Error loading barangays:', error);
      return this.getFallbackBarangays(municipalityName, regionName);
    }
  }

  private getDistrictType(name: string): PhilippineDistrict['type'] {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('poblacion')) return 'poblacion';
    if (nameLower.includes('urban')) return 'urban_district';
    if (nameLower.includes('rural')) return 'rural_district';
    return 'district';
  }

  private getBarangayType(name: string): PhilippineBarangay['type'] {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('poblacion')) return 'poblacion';
    if (nameLower.includes('urban') || nameLower.includes('city')) return 'urban';
    return 'rural';
  }

  private getFallbackDistricts(municipalityName: string, _regionName: string): PhilippineDistrict[] {
    const districtData: Record<string, PhilippineDistrict[]> = {
      'Cebu City': [
        { name: 'North District', municipality: 'Cebu City', region: 'Region VII', type: 'urban_district', lat: 10.3300, lon: 123.8900 },
        { name: 'South District', municipality: 'Cebu City', region: 'Region VII', type: 'urban_district', lat: 10.3000, lon: 123.8800 },
        { name: 'Mountain District', municipality: 'Cebu City', region: 'Region VII', type: 'rural_district', lat: 10.3500, lon: 123.8700 }
      ],
      'Manila': [
        { name: 'District 1', municipality: 'Manila', region: 'NCR', type: 'urban_district', lat: 14.6042, lon: 120.9822 },
        { name: 'District 2', municipality: 'Manila', region: 'NCR', type: 'urban_district', lat: 14.5995, lon: 120.9842 },
        { name: 'District 3', municipality: 'Manila', region: 'NCR', type: 'urban_district', lat: 14.5950, lon: 120.9862 },
        { name: 'District 4', municipality: 'Manila', region: 'NCR', type: 'urban_district', lat: 14.5900, lon: 120.9882 },
        { name: 'District 5', municipality: 'Manila', region: 'NCR', type: 'urban_district', lat: 14.5850, lon: 120.9902 },
        { name: 'District 6', municipality: 'Manila', region: 'NCR', type: 'urban_district', lat: 14.5800, lon: 120.9922 }
      ]
    };
    
    return districtData[municipalityName] || [];
  }

  private getFallbackBarangays(municipalityName: string, _regionName: string): PhilippineBarangay[] {
    const barangayData: Record<string, PhilippineBarangay[]> = {
      // Cebu Province
      'Cebu City': [
        { name: 'Lahug', municipality: 'Cebu City', region: 'Region VII', type: 'urban', lat: 10.3300, lon: 123.8900, postal_code: '6000' },
        { name: 'Capitol Site', municipality: 'Cebu City', region: 'Region VII', type: 'urban', lat: 10.3200, lon: 123.8950, postal_code: '6000' },
        { name: 'Kamputhaw', municipality: 'Cebu City', region: 'Region VII', type: 'urban', lat: 10.3150, lon: 123.8900, postal_code: '6000' },
        { name: 'Guadalupe', municipality: 'Cebu City', region: 'Region VII', type: 'urban', lat: 10.2900, lon: 123.8800, postal_code: '6000' },
        { name: 'Banilad', municipality: 'Cebu City', region: 'Region VII', type: 'urban', lat: 10.3400, lon: 123.9100, postal_code: '6000' },
        { name: 'Talamban', municipality: 'Cebu City', region: 'Region VII', type: 'rural', lat: 10.3600, lon: 123.9200, postal_code: '6000' },
        { name: 'Busay', municipality: 'Cebu City', region: 'Region VII', type: 'rural', lat: 10.3700, lon: 123.8600, postal_code: '6000' },
        { name: 'Sirao', municipality: 'Cebu City', region: 'Region VII', type: 'rural', lat: 10.3800, lon: 123.8500, postal_code: '6000' },
        { name: 'Tisa', municipality: 'Cebu City', region: 'Region VII', type: 'urban', lat: 10.2800, lon: 123.8700, postal_code: '6000' },
        { name: 'Pardo', municipality: 'Cebu City', region: 'Region VII', type: 'urban', lat: 10.2700, lon: 123.8600, postal_code: '6000' }
      ],
      'Dalaguete': [
        { name: 'Poblacion', municipality: 'Dalaguete', region: 'Region VII', type: 'poblacion', lat: 9.7667, lon: 123.5333, postal_code: '6024' },
        { name: 'Ablayan', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7500, lon: 123.5200, postal_code: '6024' },
        { name: 'Babayongan', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7800, lon: 123.5400, postal_code: '6024' },
        { name: 'Banhigan', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7600, lon: 123.5100, postal_code: '6024' },
        { name: 'Bulak', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7900, lon: 123.5500, postal_code: '6024' },
        { name: 'Calidngan', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7400, lon: 123.5000, postal_code: '6024' },
        { name: 'Casay', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7700, lon: 123.5600, postal_code: '6024' },
        { name: 'Consolacion', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7300, lon: 123.4900, postal_code: '6024' },
        { name: 'Coro', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.8000, lon: 123.5700, postal_code: '6024' },
        { name: 'Dugyan', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7200, lon: 123.4800, postal_code: '6024' },
        { name: 'Dumalan', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7800, lon: 123.5300, postal_code: '6024' },
        { name: 'Lanao', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7100, lon: 123.4700, postal_code: '6024' },
        { name: 'Lanas', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7500, lon: 123.5400, postal_code: '6024' },
        { name: 'Langkas', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7600, lon: 123.5200, postal_code: '6024' },
        { name: 'Magtanong', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7000, lon: 123.4600, postal_code: '6024' },
        { name: 'Manlapay', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7900, lon: 123.5600, postal_code: '6024' },
        { name: 'Nalhub', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7400, lon: 123.5100, postal_code: '6024' },
        { name: 'Obong', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7700, lon: 123.5500, postal_code: '6024' },
        { name: 'Salug', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7300, lon: 123.5000, postal_code: '6024' },
        { name: 'Tabon', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7800, lon: 123.5400, postal_code: '6024' },
        { name: 'Tapul', municipality: 'Dalaguete', region: 'Region VII', type: 'rural', lat: 9.7200, lon: 123.4900, postal_code: '6024' }
      ],
      'Argao': [
        { name: 'Poblacion', municipality: 'Argao', region: 'Region VII', type: 'poblacion', lat: 9.8833, lon: 123.6167, postal_code: '6021' },
        { name: 'Alambijud', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8500, lon: 123.5800, postal_code: '6021' },
        { name: 'Apo', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.9200, lon: 123.6500, postal_code: '6021' },
        { name: 'Balaas', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8600, lon: 123.5900, postal_code: '6021' },
        { name: 'Binlod', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.9000, lon: 123.6300, postal_code: '6021' },
        { name: 'Bogo', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8700, lon: 123.6000, postal_code: '6021' },
        { name: 'Bug-ot', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8400, lon: 123.5700, postal_code: '6021' },
        { name: 'Bulasa', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.9100, lon: 123.6400, postal_code: '6021' },
        { name: 'Butong', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8800, lon: 123.6200, postal_code: '6021' },
        { name: 'Calagasan', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8300, lon: 123.5600, postal_code: '6021' },
        { name: 'Canbanua', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.9300, lon: 123.6600, postal_code: '6021' },
        { name: 'Canbantug', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8900, lon: 123.6100, postal_code: '6021' },
        { name: 'Candabong', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8200, lon: 123.5500, postal_code: '6021' },
        { name: 'Cansuje', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.9400, lon: 123.6700, postal_code: '6021' },
        { name: 'Colawin', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8100, lon: 123.5400, postal_code: '6021' },
        { name: 'Guiwang', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.9000, lon: 123.6200, postal_code: '6021' },
        { name: 'Gutlang', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8000, lon: 123.5300, postal_code: '6021' },
        { name: 'Jomgao', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8500, lon: 123.5800, postal_code: '6021' },
        { name: 'Lamacan', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.9100, lon: 123.6300, postal_code: '6021' },
        { name: 'Langtad', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8600, lon: 123.5900, postal_code: '6021' },
        { name: 'Lapay', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8700, lon: 123.6000, postal_code: '6021' },
        { name: 'Lengigon', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8400, lon: 123.5700, postal_code: '6021' },
        { name: 'Linut-od', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8800, lon: 123.6100, postal_code: '6021' },
        { name: 'Mabasa', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8300, lon: 123.5600, postal_code: '6021' },
        { name: 'Mandilikit', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.9200, lon: 123.6400, postal_code: '6021' },
        { name: 'Mompeller', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8900, lon: 123.6200, postal_code: '6021' },
        { name: 'Panadtaran', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8200, lon: 123.5500, postal_code: '6021' },
        { name: 'Sua', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8100, lon: 123.5400, postal_code: '6021' },
        { name: 'Sumaguan', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.9300, lon: 123.6500, postal_code: '6021' },
        { name: 'Talaga', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8000, lon: 123.5300, postal_code: '6021' },
        { name: 'Talaytay', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8500, lon: 123.5800, postal_code: '6021' },
        { name: 'Talo-ot', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.9100, lon: 123.6300, postal_code: '6021' },
        { name: 'Tiguib', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8600, lon: 123.5900, postal_code: '6021' },
        { name: 'Tulang', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8700, lon: 123.6000, postal_code: '6021' },
        { name: 'Tulic', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8400, lon: 123.5700, postal_code: '6021' },
        { name: 'Ubaub', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8800, lon: 123.6100, postal_code: '6021' },
        { name: 'Vega', municipality: 'Argao', region: 'Region VII', type: 'rural', lat: 9.8300, lon: 123.5600, postal_code: '6021' }
      ],
      'Minglanilla': [
        { name: 'Poblacion Ward I', municipality: 'Minglanilla', region: 'Region VII', type: 'poblacion', lat: 10.2446, lon: 123.7958, postal_code: '6046' },
        { name: 'Poblacion Ward II', municipality: 'Minglanilla', region: 'Region VII', type: 'poblacion', lat: 10.2450, lon: 123.7960, postal_code: '6046' },
        { name: 'Calajoan', municipality: 'Minglanilla', region: 'Region VII', type: 'rural', lat: 10.2300, lon: 123.7800, postal_code: '6046' },
        { name: 'Cadulawan', municipality: 'Minglanilla', region: 'Region VII', type: 'rural', lat: 10.2500, lon: 123.8000, postal_code: '6046' },
        { name: 'Cuanos', municipality: 'Minglanilla', region: 'Region VII', type: 'rural', lat: 10.2600, lon: 123.8100, postal_code: '6046' },
        { name: 'Linao', municipality: 'Minglanilla', region: 'Region VII', type: 'rural', lat: 10.2200, lon: 123.7700, postal_code: '6046' },
        { name: 'Pakigne', municipality: 'Minglanilla', region: 'Region VII', type: 'rural', lat: 10.2400, lon: 123.7900, postal_code: '6046' },
        { name: 'Tungkop', municipality: 'Minglanilla', region: 'Region VII', type: 'rural', lat: 10.2350, lon: 123.7850, postal_code: '6046' },
        { name: 'Vito', municipality: 'Minglanilla', region: 'Region VII', type: 'rural', lat: 10.2550, lon: 123.8050, postal_code: '6046' },
        { name: 'Camp 7', municipality: 'Minglanilla', region: 'Region VII', type: 'urban', lat: 10.2480, lon: 123.8000, postal_code: '6046' }
      ],
      // NCR
      'Manila': [
        { name: 'Ermita', municipality: 'Manila', region: 'NCR', type: 'urban', lat: 14.5833, lon: 120.9833, postal_code: '1000' },
        { name: 'Malate', municipality: 'Manila', region: 'NCR', type: 'urban', lat: 14.5667, lon: 120.9833, postal_code: '1004' },
        { name: 'Intramuros', municipality: 'Manila', region: 'NCR', type: 'urban', lat: 14.5917, lon: 120.9750, postal_code: '1002' },
        { name: 'Binondo', municipality: 'Manila', region: 'NCR', type: 'urban', lat: 14.6000, lon: 120.9667, postal_code: '1006' },
        { name: 'Quiapo', municipality: 'Manila', region: 'NCR', type: 'urban', lat: 14.5983, lon: 120.9817, postal_code: '1001' },
        { name: 'San Nicolas', municipality: 'Manila', region: 'NCR', type: 'urban', lat: 14.6083, lon: 120.9750, postal_code: '1010' },
        { name: 'Santa Cruz', municipality: 'Manila', region: 'NCR', type: 'urban', lat: 14.6167, lon: 120.9833, postal_code: '1003' },
        { name: 'Sampaloc', municipality: 'Manila', region: 'NCR', type: 'urban', lat: 14.6167, lon: 121.0000, postal_code: '1008' },
        { name: 'San Miguel', municipality: 'Manila', region: 'NCR', type: 'urban', lat: 14.6083, lon: 121.0083, postal_code: '1005' },
        { name: 'Port Area', municipality: 'Manila', region: 'NCR', type: 'urban', lat: 14.5833, lon: 120.9667, postal_code: '1018' }
      ]
    };
    
    return barangayData[municipalityName] || [];
  }

  private getFallbackRegions(): PhilippineRegion[] {
    return [
      { name: 'NCR', fullName: 'National Capital Region', code: 'NCR', lat: 14.5995, lon: 120.9842 },
      { name: 'CAR', fullName: 'Cordillera Administrative Region', code: 'CAR', lat: 16.4023, lon: 120.5960 },
      { name: 'Region I', fullName: 'Ilocos Region', code: 'Region I', lat: 17.5739, lon: 120.3967 },
      { name: 'Region II', fullName: 'Cagayan Valley', code: 'Region II', lat: 17.6132, lon: 121.7270 },
      { name: 'Region III', fullName: 'Central Luzon', code: 'Region III', lat: 15.4817, lon: 120.7122 },
      { name: 'Region IV-A', fullName: 'CALABARZON', code: 'Region IV-A', lat: 14.1007, lon: 121.0794 },
      { name: 'Region IV-B', fullName: 'MIMAROPA', code: 'Region IV-B', lat: 13.4125, lon: 121.0308 },
      { name: 'Region V', fullName: 'Bicol Region', code: 'Region V', lat: 13.4203, lon: 123.3750 },
      { name: 'Region VI', fullName: 'Western Visayas', code: 'Region VI', lat: 10.7202, lon: 122.5621 },
      { name: 'Region VII', fullName: 'Central Visayas', code: 'Region VII', lat: 10.3157, lon: 123.8854 },
      { name: 'Region VIII', fullName: 'Eastern Visayas', code: 'Region VIII', lat: 11.2421, lon: 124.9750 },
      { name: 'Region IX', fullName: 'Zamboanga Peninsula', code: 'Region IX', lat: 8.0542, lon: 123.2719 },
      { name: 'Region X', fullName: 'Northern Mindanao', code: 'Region X', lat: 8.4542, lon: 124.6319 },
      { name: 'Region XI', fullName: 'Davao Region', code: 'Region XI', lat: 7.0731, lon: 125.6128 },
      { name: 'Region XII', fullName: 'SOCCSKSARGEN', code: 'Region XII', lat: 6.1164, lon: 124.6544 },
      { name: 'Region XIII', fullName: 'Caraga', code: 'Region XIII', lat: 8.9477, lon: 125.5281 },
      { name: 'BARMM', fullName: 'Bangsamoro Autonomous Region in Muslim Mindanao', code: 'BARMM', lat: 7.2906, lon: 124.2922 }
    ];
  }

  private getFallbackMunicipalities(regionName: string): PhilippineMunicipality[] {
    const fallbackData: Record<string, PhilippineMunicipality[]> = {
      'NCR': [
        { name: 'Manila', region: 'NCR', lat: 14.5995, lon: 120.9842, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Quezon City', region: 'NCR', lat: 14.6760, lon: 121.0437, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Makati', region: 'NCR', lat: 14.5547, lon: 121.0244, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Pasig', region: 'NCR', lat: 14.5764, lon: 121.0851, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Taguig', region: 'NCR', lat: 14.5176, lon: 121.0509, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Mandaluyong', region: 'NCR', lat: 14.5794, lon: 121.0359, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'San Juan', region: 'NCR', lat: 14.6019, lon: 121.0355, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Marikina', region: 'NCR', lat: 14.6507, lon: 121.1029, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Caloocan', region: 'NCR', lat: 14.6488, lon: 120.9668, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Malabon', region: 'NCR', lat: 14.6650, lon: 120.9564, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Navotas', region: 'NCR', lat: 14.6691, lon: 120.9472, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Valenzuela', region: 'NCR', lat: 14.7000, lon: 120.9830, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Las Piñas', region: 'NCR', lat: 14.4378, lon: 120.9942, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Muntinlupa', region: 'NCR', lat: 14.3832, lon: 121.0409, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Parañaque', region: 'NCR', lat: 14.4793, lon: 121.0198, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Pasay', region: 'NCR', lat: 14.5378, lon: 120.9896, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Pateros', region: 'NCR', lat: 14.5441, lon: 121.0699, type: 'municipality', income_class: '1st' }
      ],
      'Region VII': [
        // Cities
        { name: 'Cebu City', region: 'Region VII', province: 'Cebu', lat: 10.3157, lon: 123.8854, type: 'highly_urbanized_city', classification: 'highly_urbanized_city', income_class: '1st' },
        { name: 'Mandaue City', region: 'Region VII', province: 'Cebu', lat: 10.3237, lon: 123.9227, type: 'component_city', classification: 'component_city', income_class: '1st' },
        { name: 'Lapu-Lapu City', region: 'Region VII', province: 'Cebu', lat: 10.3103, lon: 123.9494, type: 'component_city', classification: 'component_city', income_class: '1st' },
        { name: 'Talisay City', region: 'Region VII', province: 'Cebu', lat: 10.2449, lon: 123.8492, type: 'component_city', classification: 'component_city', income_class: '3rd' },
        { name: 'Toledo City', region: 'Region VII', province: 'Cebu', lat: 10.3773, lon: 123.6414, type: 'component_city', classification: 'component_city', income_class: '3rd' },
        { name: 'Danao City', region: 'Region VII', province: 'Cebu', lat: 10.5205, lon: 124.0258, type: 'component_city', classification: 'component_city', income_class: '4th' },
        { name: 'Carcar City', region: 'Region VII', province: 'Cebu', lat: 10.1077, lon: 123.6386, type: 'component_city', classification: 'component_city', income_class: '5th' },
        { name: 'Naga City', region: 'Region VII', province: 'Cebu', lat: 10.2088, lon: 123.7568, type: 'component_city', classification: 'component_city', income_class: '4th' },
        { name: 'Bogo City', region: 'Region VII', province: 'Cebu', lat: 11.0488, lon: 124.0061, type: 'component_city', classification: 'component_city', income_class: '4th' },
        
        // Municipalities - Cebu Province
        { name: 'Minglanilla', region: 'Region VII', province: 'Cebu', lat: 10.2446, lon: 123.7958, type: 'municipality', income_class: '1st' },
        { name: 'Consolacion', region: 'Region VII', province: 'Cebu', lat: 10.3783, lon: 123.9572, type: 'municipality', income_class: '1st' },
        { name: 'Liloan', region: 'Region VII', province: 'Cebu', lat: 10.3928, lon: 123.9847, type: 'municipality', income_class: '2nd' },
        { name: 'Compostela', region: 'Region VII', province: 'Cebu', lat: 10.4558, lon: 124.0069, type: 'municipality', income_class: '3rd' },
        { name: 'Cordova', region: 'Region VII', province: 'Cebu', lat: 10.2533, lon: 123.9489, type: 'municipality', income_class: '3rd' },
        { name: 'San Fernando', region: 'Region VII', province: 'Cebu', lat: 10.1639, lon: 123.7086, type: 'municipality', income_class: '2nd' },
        { name: 'Sibonga', region: 'Region VII', province: 'Cebu', lat: 10.1486, lon: 123.6208, type: 'municipality', income_class: '4th' },
        { name: 'Argao', region: 'Region VII', province: 'Cebu', lat: 9.8833, lon: 123.6167, type: 'municipality', income_class: '2nd' },
        { name: 'Dalaguete', region: 'Region VII', province: 'Cebu', lat: 9.7667, lon: 123.5333, type: 'municipality', income_class: '3rd' },
        { name: 'Alcoy', region: 'Region VII', province: 'Cebu', lat: 9.6833, lon: 123.5000, type: 'municipality', income_class: '4th' },
        { name: 'Boljoon', region: 'Region VII', province: 'Cebu', lat: 9.6167, lon: 123.4667, type: 'municipality', income_class: '5th' },
        { name: 'Oslob', region: 'Region VII', province: 'Cebu', lat: 9.5500, lon: 123.3833, type: 'municipality', income_class: '4th' },
        { name: 'Santander', region: 'Region VII', province: 'Cebu', lat: 9.4833, lon: 123.3167, type: 'municipality', income_class: '5th' },
        { name: 'Samboan', region: 'Region VII', province: 'Cebu', lat: 9.5167, lon: 123.3000, type: 'municipality', income_class: '4th' },
        { name: 'Ginatilan', region: 'Region VII', province: 'Cebu', lat: 9.6000, lon: 123.3333, type: 'municipality', income_class: '5th' },
        { name: 'Malabuyoc', region: 'Region VII', province: 'Cebu', lat: 9.6500, lon: 123.3500, type: 'municipality', income_class: '5th' },
        { name: 'Alegria', region: 'Region VII', province: 'Cebu', lat: 9.7667, lon: 123.4000, type: 'municipality', income_class: '4th' },
        { name: 'Badian', region: 'Region VII', province: 'Cebu', lat: 9.8667, lon: 123.3833, type: 'municipality', income_class: '3rd' },
        { name: 'Moalboal', region: 'Region VII', province: 'Cebu', lat: 9.9333, lon: 123.3833, type: 'municipality', income_class: '3rd' },
        { name: 'Alcantara', region: 'Region VII', province: 'Cebu', lat: 10.0167, lon: 123.4167, type: 'municipality', income_class: '4th' },
        { name: 'Ronda', region: 'Region VII', province: 'Cebu', lat: 10.0500, lon: 123.4500, type: 'municipality', income_class: '4th' },
        { name: 'Dumanjug', region: 'Region VII', province: 'Cebu', lat: 10.0833, lon: 123.4333, type: 'municipality', income_class: '3rd' },
        { name: 'Barili', region: 'Region VII', province: 'Cebu', lat: 10.1167, lon: 123.5167, type: 'municipality', income_class: '3rd' },
        { name: 'Aloguinsan', region: 'Region VII', province: 'Cebu', lat: 10.2167, lon: 123.5500, type: 'municipality', income_class: '4th' },
        { name: 'Pinamungajan', region: 'Region VII', province: 'Cebu', lat: 10.2667, lon: 123.5833, type: 'municipality', income_class: '3rd' },
        { name: 'Asturias', region: 'Region VII', province: 'Cebu', lat: 10.5667, lon: 123.7167, type: 'municipality', income_class: '3rd' },
        { name: 'Balamban', region: 'Region VII', province: 'Cebu', lat: 10.4833, lon: 123.7167, type: 'municipality', income_class: '2nd' },
        { name: 'Tuburan', region: 'Region VII', province: 'Cebu', lat: 10.7333, lon: 123.8167, type: 'municipality', income_class: '2nd' },
        { name: 'Tabuelan', region: 'Region VII', province: 'Cebu', lat: 10.8167, lon: 123.8500, type: 'municipality', income_class: '4th' },
        { name: 'Sogod', region: 'Region VII', province: 'Cebu', lat: 10.7500, lon: 124.0167, type: 'municipality', income_class: '3rd' },
        { name: 'Borbon', region: 'Region VII', province: 'Cebu', lat: 10.8333, lon: 124.0333, type: 'municipality', income_class: '4th' },
        { name: 'Tabogon', region: 'Region VII', province: 'Cebu', lat: 10.9167, lon: 124.0500, type: 'municipality', income_class: '3rd' },
        { name: 'San Remigio', region: 'Region VII', province: 'Cebu', lat: 11.0667, lon: 123.9833, type: 'municipality', income_class: '3rd' },
        { name: 'Medellin', region: 'Region VII', province: 'Cebu', lat: 11.1333, lon: 123.9667, type: 'municipality', income_class: '3rd' },
        { name: 'Daanbantayan', region: 'Region VII', province: 'Cebu', lat: 11.2500, lon: 124.0167, type: 'municipality', income_class: '2nd' },
        { name: 'Madridejos', region: 'Region VII', province: 'Cebu', lat: 11.2667, lon: 123.7333, type: 'municipality', income_class: '3rd' },
        { name: 'Bantayan', region: 'Region VII', province: 'Cebu', lat: 11.2000, lon: 123.7167, type: 'municipality', income_class: '3rd' },
        { name: 'Santa Fe', region: 'Region VII', province: 'Cebu', lat: 11.1500, lon: 123.8000, type: 'municipality', income_class: '4th' },
        { name: 'Carmen', region: 'Region VII', province: 'Cebu', lat: 10.5833, lon: 124.0333, type: 'municipality', income_class: '2nd' },
        { name: 'Catmon', region: 'Region VII', province: 'Cebu', lat: 10.6833, lon: 124.0167, type: 'municipality', income_class: '3rd' },
        
        // Bohol Province
        { name: 'Tagbilaran City', region: 'Region VII', province: 'Bohol', lat: 9.6496, lon: 123.8651, type: 'component_city', classification: 'component_city', income_class: '2nd' },
        { name: 'Tubigon', region: 'Region VII', province: 'Bohol', lat: 9.9500, lon: 123.9833, type: 'municipality', income_class: '2nd' },
        { name: 'Loon', region: 'Region VII', province: 'Bohol', lat: 9.8000, lon: 123.8167, type: 'municipality', income_class: '3rd' },
        { name: 'Panglao', region: 'Region VII', province: 'Bohol', lat: 9.5833, lon: 123.7500, type: 'municipality', income_class: '2nd' },
        { name: 'Dauis', region: 'Region VII', province: 'Bohol', lat: 9.6167, lon: 123.8333, type: 'municipality', income_class: '3rd' },
        { name: 'Baclayon', region: 'Region VII', province: 'Bohol', lat: 9.6333, lon: 123.9000, type: 'municipality', income_class: '4th' },
        { name: 'Alburquerque', region: 'Region VII', province: 'Bohol', lat: 9.6667, lon: 123.9500, type: 'municipality', income_class: '4th' },
        { name: 'Loay', region: 'Region VII', province: 'Bohol', lat: 9.6000, lon: 123.9833, type: 'municipality', income_class: '5th' },
        { name: 'Loboc', region: 'Region VII', province: 'Bohol', lat: 9.6333, lon: 124.0333, type: 'municipality', income_class: '4th' },
        { name: 'Sevilla', region: 'Region VII', province: 'Bohol', lat: 9.6833, lon: 124.0167, type: 'municipality', income_class: '5th' },
        { name: 'Calape', region: 'Region VII', province: 'Bohol', lat: 9.8333, lon: 124.0000, type: 'municipality', income_class: '3rd' },
        { name: 'Clarin', region: 'Region VII', province: 'Bohol', lat: 9.9167, lon: 124.0167, type: 'municipality', income_class: '4th' },
        { name: 'Inabanga', region: 'Region VII', province: 'Bohol', lat: 9.9833, lon: 124.0833, type: 'municipality', income_class: '3rd' },
        { name: 'Buenavista', region: 'Region VII', province: 'Bohol', lat: 10.0000, lon: 124.1333, type: 'municipality', income_class: '4th' },
        { name: 'Getafe', region: 'Region VII', province: 'Bohol', lat: 10.1500, lon: 124.1500, type: 'municipality', income_class: '4th' },
        { name: 'Talibon', region: 'Region VII', province: 'Bohol', lat: 10.1167, lon: 124.2833, type: 'municipality', income_class: '2nd' },
        { name: 'Bien Unido', region: 'Region VII', province: 'Bohol', lat: 10.1333, lon: 124.3667, type: 'municipality', income_class: '4th' },
        { name: 'Trinidad', region: 'Region VII', province: 'Bohol', lat: 9.8833, lon: 124.3667, type: 'municipality', income_class: '3rd' },
        { name: 'Ubay', region: 'Region VII', province: 'Bohol', lat: 10.0500, lon: 124.4833, type: 'municipality', income_class: '2nd' },
        { name: 'Carlos P. Garcia', region: 'Region VII', province: 'Bohol', lat: 10.1000, lon: 124.4167, type: 'municipality', income_class: '5th' },
        { name: 'Pilar', region: 'Region VII', province: 'Bohol', lat: 9.8333, lon: 124.3333, type: 'municipality', income_class: '4th' },
        { name: 'San Miguel', region: 'Region VII', province: 'Bohol', lat: 9.7833, lon: 124.2833, type: 'municipality', income_class: '4th' },
        { name: 'Candijay', region: 'Region VII', province: 'Bohol', lat: 9.8167, lon: 124.5167, type: 'municipality', income_class: '3rd' },
        { name: 'Guindulman', region: 'Region VII', province: 'Bohol', lat: 9.7667, lon: 124.4833, type: 'municipality', income_class: '3rd' },
        { name: 'Anda', region: 'Region VII', province: 'Bohol', lat: 9.7333, lon: 124.5833, type: 'municipality', income_class: '4th' },
        { name: 'Duero', region: 'Region VII', province: 'Bohol', lat: 9.6833, lon: 124.4333, type: 'municipality', income_class: '4th' },
        { name: 'Jagna', region: 'Region VII', province: 'Bohol', lat: 9.6500, lon: 124.3667, type: 'municipality', income_class: '2nd' },
        { name: 'Garcia Hernandez', region: 'Region VII', province: 'Bohol', lat: 9.6167, lon: 124.2833, type: 'municipality', income_class: '4th' },
        { name: 'Valencia', region: 'Region VII', province: 'Bohol', lat: 9.6167, lon: 124.2167, type: 'municipality', income_class: '3rd' },
        { name: 'Dimiao', region: 'Region VII', province: 'Bohol', lat: 9.6000, lon: 124.1833, type: 'municipality', income_class: '4th' },
        { name: 'Lila', region: 'Region VII', province: 'Bohol', lat: 9.5833, lon: 124.1167, type: 'municipality', income_class: '5th' },
        { name: 'Cortes', region: 'Region VII', province: 'Bohol', lat: 9.6000, lon: 124.0667, type: 'municipality', income_class: '4th' },
        { name: 'Maribojoc', region: 'Region VII', province: 'Bohol', lat: 9.7333, lon: 123.8333, type: 'municipality', income_class: '4th' },
        { name: 'Antequera', region: 'Region VII', province: 'Bohol', lat: 9.7667, lon: 123.9167, type: 'municipality', income_class: '4th' },
        { name: 'Corella', region: 'Region VII', province: 'Bohol', lat: 9.7000, lon: 123.9333, type: 'municipality', income_class: '4th' },
        { name: 'Sikatuna', region: 'Region VII', province: 'Bohol', lat: 9.7167, lon: 123.9833, type: 'municipality', income_class: '5th' },
        { name: 'Balilihan', region: 'Region VII', province: 'Bohol', lat: 9.7500, lon: 124.0500, type: 'municipality', income_class: '4th' },
        { name: 'Catigbian', region: 'Region VII', province: 'Bohol', lat: 9.8000, lon: 124.1000, type: 'municipality', income_class: '4th' },
        { name: 'Batuan', region: 'Region VII', province: 'Bohol', lat: 9.8167, lon: 124.1500, type: 'municipality', income_class: '5th' },
        { name: 'Carmen', region: 'Region VII', province: 'Bohol', lat: 9.8500, lon: 124.1833, type: 'municipality', income_class: '3rd' },
        { name: 'Sagbayan', region: 'Region VII', province: 'Bohol', lat: 9.9000, lon: 124.1167, type: 'municipality', income_class: '4th' },
        { name: 'San Isidro', region: 'Region VII', province: 'Bohol', lat: 9.9333, lon: 124.1833, type: 'municipality', income_class: '5th' },
        { name: 'Danao', region: 'Region VII', province: 'Bohol', lat: 9.9667, lon: 124.2500, type: 'municipality', income_class: '4th' },
        { name: 'Presidente Carlos P. Garcia', region: 'Region VII', province: 'Bohol', lat: 10.1000, lon: 124.4167, type: 'municipality', income_class: '5th' }
      ],
      'Region I': [
        { name: 'Vigan City', region: 'Region I', lat: 17.5747, lon: 120.3869, type: 'city' },
        { name: 'Laoag City', region: 'Region I', lat: 18.1967, lon: 120.5934, type: 'city' },
        { name: 'San Fernando City', region: 'Region I', lat: 16.6158, lon: 120.3209, type: 'city' },
        { name: 'Dagupan City', region: 'Region I', lat: 16.0433, lon: 120.3340, type: 'city' },
        { name: 'Alaminos City', region: 'Region I', lat: 16.1581, lon: 119.9808, type: 'city' },
        { name: 'Urdaneta City', region: 'Region I', lat: 15.9761, lon: 120.5711, type: 'city' }
      ],
      'Region III': [
        { name: 'Angeles City', region: 'Region III', lat: 15.1450, lon: 120.5950, type: 'city' },
        { name: 'San Jose del Monte City', region: 'Region III', lat: 14.8136, lon: 121.0453, type: 'city' },
        { name: 'Olongapo City', region: 'Region III', lat: 14.8294, lon: 120.2824, type: 'city' },
        { name: 'Tarlac City', region: 'Region III', lat: 15.4817, lon: 120.5979, type: 'city' },
        { name: 'Malolos City', region: 'Region III', lat: 14.8433, lon: 120.8114, type: 'city' },
        { name: 'Meycauayan City', region: 'Region III', lat: 14.7342, lon: 120.9553, type: 'city' }
      ],
      'Region IV-A': [
        { name: 'Antipolo City', region: 'Region IV-A', lat: 14.5873, lon: 121.1759, type: 'city' },
        { name: 'Calamba City', region: 'Region IV-A', lat: 14.2118, lon: 121.1653, type: 'city' },
        { name: 'Dasmarinas City', region: 'Region IV-A', lat: 14.3294, lon: 120.9367, type: 'city' },
        { name: 'San Pablo City', region: 'Region IV-A', lat: 14.0683, lon: 121.3256, type: 'city' },
        { name: 'Lipa City', region: 'Region IV-A', lat: 13.9411, lon: 121.1650, type: 'city' },
        { name: 'Tanauan City', region: 'Region IV-A', lat: 14.0865, lon: 121.1489, type: 'city' }
      ],
      'Region XI': [
        { name: 'Davao City', region: 'Region XI', lat: 7.0731, lon: 125.6128, type: 'city' },
        { name: 'Tagum City', region: 'Region XI', lat: 7.4479, lon: 125.8072, type: 'city' },
        { name: 'Panabo City', region: 'Region XI', lat: 7.3047, lon: 125.6839, type: 'city' },
        { name: 'Island Garden City of Samal', region: 'Region XI', lat: 7.0731, lon: 125.7069, type: 'city' },
        { name: 'Digos City', region: 'Region XI', lat: 6.7497, lon: 125.3572, type: 'city' }
      ]
    };

    return fallbackData[regionName] || [];
  }
}

export const geoapifyService = new GeoapifyService();
// Re-export types for backward compatibility
export type { 
  GeoapifyPlace, 
  PhilippineRegion, 
  PhilippineMunicipality, 
  PhilippineDistrict, 
  PhilippineBarangay 
} from '@/@types/services/geoapify';