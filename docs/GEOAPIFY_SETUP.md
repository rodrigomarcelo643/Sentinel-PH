# Geoapify API Integration Setup

## Overview
The SentinelPH registration form now uses the Geoapify API to dynamically load Philippine regions and municipalities, providing accurate and up-to-date location data.

## Getting Your Geoapify API Key

1. **Sign up for Geoapify**
   - Go to [https://www.geoapify.com/](https://www.geoapify.com/)
   - Click "Sign Up" and create a free account
   - Verify your email address

2. **Get Your API Key**
   - Log in to your Geoapify dashboard
   - Navigate to "API Keys" section
   - Copy your API key (it should look like: `abcd1234efgh5678ijkl9012mnop3456`)

3. **Add API Key to Environment**
   - Open your `.env` file in the project root
   - Add or update the line: `VITE_GEOAPIFY_API_KEY=your_actual_api_key_here`
   - Replace `your_actual_api_key_here` with your actual API key

## Features

### Dynamic Region Loading
- Loads all Philippine regions from Geoapify API
- Falls back to static data if API is unavailable
- Shows loading indicators during data fetch

### Municipality Loading by Region
- Dynamically loads municipalities when a region is selected
- Filters municipalities by the selected region
- Displays city badges for cities vs municipalities
- Shows loading states and empty states

### Error Handling
- Graceful fallback to static data if API fails
- User-friendly error messages
- Loading indicators for better UX

## API Usage Limits

**Free Tier:**
- 3,000 requests per day
- Rate limit: 5 requests per second

**Paid Tiers:**
- Higher request limits available
- Better rate limits
- Priority support

## Implementation Details

### Service Structure
```typescript
// src/services/geoapifyService.ts
export interface PhilippineRegion {
  name: string;        // e.g., "NCR", "Region VII"
  fullName: string;    // e.g., "National Capital Region"
  code: string;        // Region code
  lat: number;         // Latitude
  lon: number;         // Longitude
}

export interface PhilippineMunicipality {
  name: string;        // Municipality/City name
  region: string;      // Parent region
  province?: string;   // Province (if available)
  lat: number;         // Latitude
  lon: number;         // Longitude
  type: 'city' | 'municipality';
}
```

### Key Methods
- `getPhilippineRegions()` - Fetches all Philippine regions
- `getMunicipalitiesByRegion(regionName)` - Fetches municipalities for a specific region
- `searchMunicipalities(query)` - Search municipalities by name

### Fallback Data
The service includes fallback data for:
- All 17 Philippine regions
- Major cities and municipalities for NCR and Region VII
- Ensures the form works even without API access

## Testing

1. **With API Key:**
   - Set your API key in `.env`
   - Run the application
   - Navigate to registration page
   - Select regions and see municipalities load dynamically

2. **Without API Key:**
   - Remove or comment out the API key
   - The form will use fallback data
   - Limited municipalities will be available

## Troubleshooting

### Common Issues

1. **"Loading regions..." never finishes**
   - Check if your API key is correct
   - Verify internet connection
   - Check browser console for errors

2. **No municipalities loading**
   - Ensure region is selected first
   - Check API key validity
   - Verify region name matches expected format

3. **API quota exceeded**
   - You've hit the daily limit
   - Wait for reset or upgrade plan
   - Fallback data will be used

### Debug Mode
Enable debug logging by adding to your `.env`:
```
VITE_DEBUG_GEOAPIFY=true
```

## Future Enhancements

1. **Caching**
   - Implement local storage caching
   - Reduce API calls for repeated data

2. **Search Functionality**
   - Add municipality search/filter
   - Autocomplete for better UX

3. **Barangay Support**
   - Extend to load barangays within municipalities
   - More granular location selection

## Support

For Geoapify API issues:
- [Geoapify Documentation](https://apidocs.geoapify.com/)
- [Geoapify Support](https://www.geoapify.com/contact)

For implementation issues:
- Check the browser console for errors
- Verify API key format and permissions
- Test with fallback data first