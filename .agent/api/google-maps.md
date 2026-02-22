# Google Maps API Integration

## Overview

Google Maps API provides visualization, geocoding, and heatmap capabilities for observation mapping.

## Location
`src/services/googleMapService/index.ts`

## API Key Setup

### Environment Variable
```env
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

### Required APIs (Enable in Google Cloud Console)
- Maps JavaScript API
- Places API
- Geocoding API
- Visualization Library (Heatmap)

## Functions

### 1. Load Google Maps Script

Dynamically loads the Google Maps JavaScript API.

```typescript
export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,visualization`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
};
```

### 2. Create Observation Heatmap

Visualizes observation density with trust score weighting.

```typescript
export const createHeatmap = (
  map: google.maps.Map,
  data: google.maps.LatLng[]
) => {
  return new google.maps.visualization.HeatmapLayer({
    data,
    map,
    radius: 20,
    opacity: 0.6,
  });
};
```

#### With Trust Score Weighting

```typescript
export const createWeightedHeatmap = (
  map: google.maps.Map,
  observations: Observation[]
) => {
  const weightedData = observations.map(obs => ({
    location: new google.maps.LatLng(obs.location.lat, obs.location.lng),
    weight: obs.trustScore / 100, // Normalize to 0-1
  }));

  return new google.maps.visualization.HeatmapLayer({
    data: weightedData,
    map,
    radius: 20,
    opacity: 0.6,
    gradient: [
      'rgba(0, 255, 255, 0)',
      'rgba(0, 255, 255, 1)',
      'rgba(0, 191, 255, 1)',
      'rgba(0, 127, 255, 1)',
      'rgba(0, 63, 255, 1)',
      'rgba(0, 0, 255, 1)',
      'rgba(0, 0, 223, 1)',
      'rgba(0, 0, 191, 1)',
      'rgba(0, 0, 159, 1)',
      'rgba(0, 0, 127, 1)',
      'rgba(63, 0, 91, 1)',
      'rgba(127, 0, 63, 1)',
      'rgba(191, 0, 31, 1)',
      'rgba(255, 0, 0, 1)'
    ]
  });
};
```

### 3. Geocode Address

Convert landmark/address to coordinates.

```typescript
export const geocodeAddress = async (address: string) => {
  const geocoder = new google.maps.Geocoder();
  return geocoder.geocode({ address });
};
```

## Component Usage

### BHW Dashboard Map Component

```typescript
import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript, createWeightedHeatmap } from '@/services/googleMapService';

export function ObservationMap({ observations }: { observations: Observation[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      if (mapRef.current) {
        const newMap = new google.maps.Map(mapRef.current, {
          center: { lat: 14.5995, lng: 120.9842 }, // Manila
          zoom: 13,
          mapTypeId: 'roadmap',
        });
        setMap(newMap);
      }
    });
  }, []);

  useEffect(() => {
    if (map && observations.length > 0) {
      createWeightedHeatmap(map, observations);
    }
  }, [map, observations]);

  return <div ref={mapRef} className="w-full h-96" />;
}
```

### Sentinel Location Picker

```typescript
export function LocationPicker({ onLocationSelect }: Props) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      const newMap = new google.maps.Map(mapRef.current!, {
        center: { lat: 14.5995, lng: 120.9842 },
        zoom: 15,
      });

      newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
        const lat = e.latLng!.lat();
        const lng = e.latLng!.lng();
        
        if (marker) marker.setMap(null);
        
        const newMarker = new google.maps.Marker({
          position: { lat, lng },
          map: newMap,
        });
        
        setMarker(newMarker);
        onLocationSelect({ lat, lng });
      });

      setMap(newMap);
    });
  }, []);

  return <div ref={mapRef} className="w-full h-64" />;
}
```

## Heatmap Customization

### Color Gradients by Severity

```typescript
const SEVERITY_GRADIENTS = {
  low: [
    'rgba(0, 255, 0, 0)',
    'rgba(0, 255, 0, 1)',
    'rgba(127, 255, 0, 1)',
    'rgba(255, 255, 0, 1)',
  ],
  medium: [
    'rgba(255, 255, 0, 0)',
    'rgba(255, 255, 0, 1)',
    'rgba(255, 191, 0, 1)',
    'rgba(255, 127, 0, 1)',
  ],
  high: [
    'rgba(255, 127, 0, 0)',
    'rgba(255, 127, 0, 1)',
    'rgba(255, 63, 0, 1)',
    'rgba(255, 0, 0, 1)',
  ],
};
```

### Dynamic Radius Based on Zoom

```typescript
map.addListener('zoom_changed', () => {
  const zoom = map.getZoom();
  const radius = zoom! >= 15 ? 30 : zoom! >= 13 ? 20 : 10;
  heatmap.setOptions({ radius });
});
```

## Cost Estimation

### Google Maps Pricing (as of 2024)
- **Maps JavaScript API**: $7 per 1,000 loads
- **Geocoding API**: $5 per 1,000 requests
- **Free Tier**: $200 credit per month

### Monthly Cost Projection
```
Scenario: 100 BHWs × 20 map loads/day × 30 days = 60,000 loads
Cost: 60 × $7 = $420/month
With $200 credit: $220/month (₱12,320)
```

### Optimization Strategies
1. **Cache Map Instances**: Reuse loaded maps
2. **Lazy Loading**: Load maps only when needed
3. **Static Maps API**: Use for thumbnails (cheaper)
4. **Batch Geocoding**: Geocode landmarks once, cache results

## Security

### API Key Restrictions
1. **HTTP Referrer**: Restrict to your domain
   ```
   https://sentinelph.web.app/*
   https://sentinelph.firebaseapp.com/*
   ```

2. **API Restrictions**: Enable only required APIs
   - Maps JavaScript API
   - Places API
   - Geocoding API

3. **Usage Quotas**: Set daily limits to prevent abuse

## TypeScript Types

```typescript
declare global {
  interface Window {
    google: typeof google;
  }
}

interface ObservationLocation {
  lat: number;
  lng: number;
}

interface WeightedLocation {
  location: google.maps.LatLng;
  weight: number;
}
```

## Future Enhancements

1. **Clustering**: Use MarkerClusterer for many observations
2. **Custom Markers**: Different icons for observation types
3. **Info Windows**: Show observation details on click
4. **Drawing Tools**: Let BHWs draw affected areas
5. **Offline Maps**: Cache map tiles for offline use
6. **Directions API**: Route health workers to affected areas
