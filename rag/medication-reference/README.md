# Medication Reference

## Overview

Common over-the-counter medications sold in sari-sari stores and pharmacies, used as indicators for potential health issues in communities.

## Purpose

Increased medication purchases can signal emerging health problems before people visit clinics. This database helps sentinels recognize patterns.

## Common Medications

### Fever & Pain Relief

#### Paracetamol (Acetaminophen)
- **Brands**: Biogesic, Tempra, Paracetamol
- **Uses**: Fever, headache, body pain
- **Indicator**: High sales = possible fever outbreak
- **Normal Pattern**: 1-2 boxes/week per store
- **Alert Threshold**: 5+ purchases/day

#### Ibuprofen
- **Brands**: Advil, Medicol
- **Uses**: Pain, inflammation, fever
- **Indicator**: Similar to paracetamol
- **Normal Pattern**: Occasional
- **Alert Threshold**: 3+ purchases/day

### Gastrointestinal

#### Loperamide
- **Brands**: Imodium, Diatabs
- **Uses**: Diarrhea, stomach upset
- **Indicator**: Waterborne disease outbreak
- **Normal Pattern**: Rare
- **Alert Threshold**: 3+ purchases/day

#### Oral Rehydration Salts (ORS)
- **Brands**: Oresol, Hydrite
- **Uses**: Dehydration from diarrhea
- **Indicator**: Gastroenteritis outbreak
- **Normal Pattern**: 1-2/week
- **Alert Threshold**: 5+ purchases/day

#### Antacids
- **Brands**: Kremil-S, Gaviscon
- **Uses**: Heartburn, indigestion
- **Indicator**: Food poisoning if clustered
- **Normal Pattern**: Regular
- **Alert Threshold**: 10+ purchases/day

### Respiratory

#### Cough Syrup
- **Brands**: Robitussin, Solmux
- **Uses**: Cough, phlegm
- **Indicator**: Respiratory illness spread
- **Normal Pattern**: 2-3/week
- **Alert Threshold**: 7+ purchases/day

#### Antihistamines
- **Brands**: Alnix, Allerkid, Benadryl
- **Uses**: Allergies, colds, itching
- **Indicator**: Allergic reactions or colds
- **Normal Pattern**: Regular
- **Alert Threshold**: 5+ purchases/day

### Topical

#### Calamine Lotion
- **Brands**: Caladryl
- **Uses**: Itching, rashes, insect bites
- **Indicator**: Skin conditions, chickenpox
- **Normal Pattern**: Occasional
- **Alert Threshold**: 4+ purchases/day

#### Antiseptics
- **Brands**: Betadine, Alcohol
- **Uses**: Wound cleaning
- **Indicator**: Injuries, skin infections
- **Normal Pattern**: Regular
- **Alert Threshold**: Significant increase

## Purchase Pattern Analysis

### Normal vs. Alert Patterns

```json
{
  "paracetamol": {
    "normal_daily": 2,
    "alert_threshold": 5,
    "critical_threshold": 10,
    "seasonal_variation": "slight_increase_rainy_season"
  },
  "ors": {
    "normal_daily": 0.5,
    "alert_threshold": 3,
    "critical_threshold": 7,
    "seasonal_variation": "increase_summer_flooding"
  }
}
```

### Combination Patterns

Certain medication combinations indicate specific diseases:

| Combination | Likely Condition |
|-------------|-----------------|
| Paracetamol + ORS | Dengue, Gastroenteritis |
| Cough syrup + Paracetamol | Flu, Respiratory infection |
| Loperamide + ORS | Acute diarrhea |
| Antihistamine + Calamine | Chickenpox, Allergic reaction |

## Sentinel Observations

### What to Report

✅ **Report These**:
- Sudden increase in specific medication sales
- Multiple people buying same medication
- Unusual combinations being purchased
- Customers mentioning similar symptoms
- Stock running out faster than usual

❌ **Don't Report**:
- Normal daily sales
- Single purchases
- Regular customers buying usual items
- Seasonal expected increases

## Data Format

```json
{
  "medication": "paracetamol",
  "generic_name": "acetaminophen",
  "common_brands": ["Biogesic", "Tempra", "Paracetamol"],
  "uses": ["fever", "pain", "headache"],
  "observation_relevance": "high",
  "indicator_notes": "Increased sales may indicate fever outbreak",
  "typical_purchase_pattern": "1-2 boxes per week per store",
  "alert_threshold": "5+ purchases per day",
  "associated_diseases": ["dengue", "flu", "typhoid"],
  "price_range": "5-50 pesos"
}
```

## Usage in SentinelPH

When sentinel reports medication purchases:
1. Identify medication from description
2. Check against normal patterns
3. Assess if threshold exceeded
4. Cross-reference with other observations
5. Determine if alert warranted

## Training for Sentinels

### Key Questions
- What medication is being purchased more?
- How many people bought it today?
- Are they from the same area?
- Did they mention any symptoms?
- Is this unusual for your store?

### Recording Tips
- Note brand names
- Estimate quantity increase
- Mention customer comments
- Include time period (today, this week)
- Specify location (purok, sitio)

## Maintenance

- Update with new medications
- Adjust thresholds based on data
- Add local brand names
- Validate with pharmacists
- Review seasonal patterns
