# Symptoms Database

## Overview

Verified symptom descriptions and disease-symptom mappings to help categorize health observations accurately.

## Contents

- Disease-symptom mappings
- Severity indicators
- Differential diagnosis guides
- Common symptom clusters
- Red flag symptoms

## Symptom Categories

### Fever-Related
- High fever (>38.5°C)
- Persistent fever (>3 days)
- Fever with rash
- Fever with headache
- Fever with body pain

### Gastrointestinal
- Diarrhea (watery, bloody)
- Vomiting
- Abdominal pain
- Nausea
- Loss of appetite

### Respiratory
- Cough (dry, productive)
- Difficulty breathing
- Sore throat
- Runny nose
- Chest pain

### Skin & Rash
- Maculopapular rash
- Petechiae
- Itching
- Skin lesions
- Jaundice

## Disease-Symptom Mappings

### Dengue Fever
```json
{
  "primary_symptoms": [
    "high_fever_sudden_onset",
    "severe_headache",
    "pain_behind_eyes",
    "joint_muscle_pain",
    "skin_rash"
  ],
  "warning_signs": [
    "severe_abdominal_pain",
    "persistent_vomiting",
    "bleeding_gums",
    "blood_in_stool",
    "lethargy"
  ],
  "severity": "high"
}
```

### Acute Gastroenteritis
```json
{
  "primary_symptoms": [
    "watery_diarrhea",
    "vomiting",
    "abdominal_cramps",
    "nausea",
    "low_grade_fever"
  ],
  "dehydration_signs": [
    "dry_mouth",
    "decreased_urination",
    "dizziness",
    "sunken_eyes"
  ],
  "severity": "medium"
}
```

### Influenza
```json
{
  "primary_symptoms": [
    "sudden_high_fever",
    "body_aches",
    "fatigue",
    "dry_cough",
    "headache"
  ],
  "complications": [
    "difficulty_breathing",
    "chest_pain",
    "confusion",
    "persistent_fever"
  ],
  "severity": "medium"
}
```

## Observation Translation

Community observations → Medical symptoms:

| Observation | Medical Symptom |
|-------------|----------------|
| "Mainit ang katawan" | Fever |
| "Masakit ang ulo" | Headache |
| "Pagtatae" | Diarrhea |
| "Pagsusuka" | Vomiting |
| "Ubo" | Cough |
| "Pantal" | Rash |
| "Masakit ang tiyan" | Abdominal pain |

## Severity Indicators

### Critical (Immediate Action)
- Difficulty breathing
- Severe dehydration
- Altered consciousness
- Severe bleeding
- Seizures

### High (Urgent)
- Persistent high fever (>3 days)
- Bloody diarrhea
- Severe abdominal pain
- Jaundice
- Severe headache with stiff neck

### Medium (Monitor)
- Mild fever
- Mild diarrhea
- Common cold symptoms
- Mild rash
- Mild body aches

### Low (Self-care)
- Occasional cough
- Mild headache
- Minor skin irritation
- Mild fatigue

## Usage in SentinelPH

When processing observations:
1. Extract symptom keywords from description
2. Query symptom database for matches
3. Retrieve associated diseases
4. Assess severity level
5. Categorize observation appropriately

**Example**:
- Observation: "Maraming bata may lagnat at pantal"
- Extracted: fever + rash
- Matched: Dengue, Measles, Chickenpox
- Context: Rainy season + urban area
- Result: High probability dengue

## Data Sources

- WHO ICD-11 Classification
- DOH Clinical Practice Guidelines
- Medical textbooks
- Peer-reviewed journals
- Local health worker experience

## Maintenance

- Validate with medical professionals
- Update with new disease variants
- Add local symptom terminology
- Refine severity classifications
