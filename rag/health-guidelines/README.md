# Health Guidelines

## Overview

Official health guidelines from DOH Philippines and WHO for community-based health surveillance and outbreak detection.

## Contents

This folder contains:
- Disease surveillance protocols
- Community health guidelines
- Outbreak response procedures
- Prevention and control measures
- Health worker training materials

## Sources

- **Department of Health (DOH) Philippines**
- **World Health Organization (WHO)**
- **Philippine Health Insurance Corporation (PhilHealth)**
- **Local Government Unit (LGU) Health Offices**

## Document Format

Each document includes:
- Title and source
- Publication date
- Category tags
- Verified status
- Last updated date

## Example Documents

### Dengue Surveillance Guidelines
- Early warning signs for community sentinels
- Environmental indicators
- When to alert health workers
- Prevention reminders

### COVID-19 Community Protocols
- Symptom monitoring
- Isolation guidelines
- Contact tracing procedures
- Vaccination information

### Tuberculosis Detection
- Common symptoms
- Risk factors
- Referral procedures
- Treatment adherence

## Usage

These guidelines are:
1. Processed into embeddings
2. Stored in vector database
3. Retrieved during observation categorization
4. Used to enhance AI responses with verified context

## Adding New Guidelines

1. Upload PDF/document to Supabase Storage
2. Add entry to `uploaded_textbooks` table
3. Set category: `health-guidelines`
4. Run `npm run rag:prepare` in backend
5. Document will be processed and embedded

## Maintenance

- Review quarterly for updates
- Archive outdated versions
- Update with new DOH advisories
- Verify source authenticity
