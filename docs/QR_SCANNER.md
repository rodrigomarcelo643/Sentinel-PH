# QR Scanner Feature

## Overview
The QR Scanner allows BHWs (Barangay Health Workers) to scan resident QR codes and view their complete health records, including personal information, symptom reports, and verification status.

## How to Use

### For BHWs:
1. Navigate to **BHW Dashboard** → **QR Scanner** (in the sidebar)
2. Click **"Start Scanning"** to activate the front camera
3. Position the resident's QR code within the white frame
4. The system will automatically scan and display the resident's information in a modal

### QR Code Format
The QR code should contain the Firestore document ID from the `userQRCodes` collection.

Example: `cvsYAXHulzRpg1FupZ9Y`

## Testing

### Test QR Code
You can test with the existing QR code in your database:
- **Document ID**: `cvsYAXHulzRpg1FupZ9Y`
- **QR ID**: `QR-MM863LR0-U2F476`
- **Resident**: Brazi Reales

### Generate Test QR Code
1. Go to any QR code generator (e.g., https://www.qr-code-generator.com/)
2. Enter the document ID: `cvsYAXHulzRpg1FupZ9Y`
3. Generate and download the QR code
4. Display it on another device or print it
5. Scan using the QR Scanner page

## Features

### Displayed Information:
- ✅ Full Name
- ✅ QR ID
- ✅ Email & Contact Number
- ✅ Community Role
- ✅ Verification Status
- ✅ Complete Address (Region, Municipality, Barangay)
- ✅ ID Type & Selfie Photo
- ✅ All Symptom Reports with:
  - Report Type (self/observed)
  - Status (verified/pending)
  - Symptoms List
  - Description
  - Location
  - Timestamp

### Security Features:
- ✅ Only accessible to authenticated BHWs
- ✅ Front camera for face-to-face verification
- ✅ Real-time Firestore validation
- ✅ Error handling for invalid QR codes

## Technical Details

### Camera Permissions
The scanner requires camera access. Users will be prompted to allow camera permissions on first use.

### Supported Browsers
- Chrome/Edge (Recommended)
- Firefox
- Safari (iOS 11+)

### Firestore Structure
```
userQRCodes/{documentId}
  ├── qrId: string
  ├── userData: object
  │   ├── firstName, lastName, middleInitial
  │   ├── email, contactNumber
  │   ├── communityRole, status
  │   ├── address: { region, municipality, barangay }
  │   └── documents: { idType, validIdUrl, selfieUrl }
  ├── symptomReports: array
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

## Troubleshooting

### Camera Not Working
- Ensure browser has camera permissions
- Check if another app is using the camera
- Try refreshing the page
- Use HTTPS (required for camera access)

### QR Code Not Scanning
- Ensure good lighting
- Hold the QR code steady within the frame
- Make sure the QR code is not damaged or blurry
- Verify the QR code contains the correct document ID

### "Invalid QR Code" Error
- The QR code document doesn't exist in Firestore
- The QR code format is incorrect
- Network connectivity issues

## Future Enhancements
- [ ] Scan history log
- [ ] Offline scanning capability
- [ ] Bulk QR code generation for residents
- [ ] Export resident data to PDF
- [ ] Add new symptom report directly from scanner
