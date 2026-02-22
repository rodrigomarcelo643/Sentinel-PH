# Disease Patterns

## Overview

Historical outbreak data and disease patterns in the Philippines to help identify emerging health threats.

## Contents

- Seasonal disease patterns
- Geographic distribution data
- Historical outbreak timelines
- Common symptom clusters
- Transmission patterns

## Key Diseases Tracked

### Vector-Borne Diseases
- **Dengue**: Peak season June-November, urban/semi-urban areas
- **Malaria**: Endemic in Palawan, Mindanao regions
- **Chikungunya**: Similar pattern to dengue

### Waterborne Diseases
- **Cholera**: Post-typhoon outbreaks, poor sanitation areas
- **Typhoid**: Contaminated water sources
- **Leptospirosis**: Flooding, rat exposure

### Respiratory Diseases
- **Influenza**: Rainy season peaks
- **Tuberculosis**: Year-round, urban poor communities
- **COVID-19**: Variant-dependent patterns

### Food-Borne Diseases
- **Hepatitis A**: Contaminated food/water
- **Food poisoning**: Community gatherings, street food

## Data Sources

- DOH Disease Surveillance Reports
- Philippine Statistics Authority (PSA)
- WHO Philippines Country Office
- Local Health Unit Records
- Academic Research Papers

## Pattern Recognition

### Seasonal Indicators
```json
{
  "dengue": {
    "peak_months": ["June", "July", "August", "September", "October"],
    "risk_factors": ["rainfall", "standing_water", "temperature_25-30C"],
    "geographic_hotspots": ["Metro Manila", "Cebu", "Davao"]
  }
}
```

### Outbreak Triggers
- Heavy rainfall + standing water → Dengue/Leptospirosis
- Flooding + poor sanitation → Cholera/Typhoid
- Crowded gatherings → Respiratory diseases
- Food festivals → Food poisoning clusters

## Usage in SentinelPH

When sentinels report observations, RAG retrieves relevant patterns:

**Example Query**: "Multiple fever cases in June"
**Retrieved Context**: Dengue peak season data, typical symptoms, environmental factors

This helps AI categorize observations more accurately based on historical patterns.

## Data Format

```json
{
  "disease": "dengue",
  "season": "rainy",
  "peak_months": [6, 7, 8, 9, 10],
  "common_observations": [
    "increased_fever_cases",
    "paracetamol_sales_spike",
    "mosquito_activity",
    "standing_water_reports"
  ],
  "geographic_patterns": {
    "urban": "high_risk",
    "rural": "moderate_risk"
  }
}
```

## Maintenance

- Update monthly with DOH reports
- Add new outbreak data
- Refine pattern recognition
- Validate with epidemiologists
