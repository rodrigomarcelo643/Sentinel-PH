const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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

export const createHeatmap = (map: google.maps.Map, data: google.maps.LatLng[]) => {
  return new google.maps.visualization.HeatmapLayer({
    data,
    map,
    radius: 20,
  });
};

export const geocodeAddress = async (address: string) => {
  const geocoder = new google.maps.Geocoder();
  return geocoder.geocode({ address });
};
