// Core domain types used across the application

export interface Sentinel {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  middleInitial?: string;
  communityRole: string;
  address: {
    barangay: string;
    municipality: string;
    region: string;
  };
  email: string;
  contactNumber: string;
  status: string;
  documents: {
    selfieUrl: string;
    validIdUrl: string;
    idType: string;
  };
  uid: string;
  createdAt: any;
}

export interface DashboardStats {
  totalSentinels: number;
  activeSentinels: number;
  pendingReports: number;
  verifiedToday: number;
}

export interface RecentReport {
  id: string;
  userName: string;
  description: string;
  status: string;
  createdAt: any;
  userSelfieUrl?: string;
  userId?: string;
}

export interface ObservationDataPoint {
  day: string;
  observations: number;
  verified: number;
}

export interface SymptomDataPoint {
  name: string;
  value: number;
}

// Base SymptomReport interface
export interface SymptomReport {
  id: string;
  symptoms: string[];
  description: string;
  reportType: 'self' | 'observed';
  status: string;
  createdAt: any;
  userName?: string;
  userId?: string;
}

// Extended SymptomReport for map usage
export interface MapSymptomReport extends SymptomReport {
  latitude: number;
  longitude: number;
  location: string;
  userSelfieUrl?: string;
  proofImageUrl?: string;
  barangay?: string;
  customSymptom?: string;
}

// Announcement types
export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  customType?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: any;
  createdBy: string;
  imageUrl?: string;
}

export interface AnnouncementType {
  value: string;
  label: string;
  icon: any;
}

// Outbreak types
export interface OutbreakAlert {
  id: string;
  disease: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  cases: number;
  residents: string[] | number;
  trend: 'increasing' | 'stable' | 'decreasing';
  detectedAt: any;
  status: 'pending' | 'ongoing' | 'resolved';
  respondedAt?: any;
  respondedBy?: string;
  title?: string;
  riskScore?: number;
  clusters?: number;
  recommendations?: string[];
  analysisData?: any;
}

// User types
export interface UserData {
  firstName: string;
  lastName: string;
  middleInitial: string;
  email: string;
  contactNumber: string;
  communityRole: string;
  address: {
    region: string;
    municipality: string;
    barangay: string;
  };
  documents: {
    idType: string;
    validIdUrl: string;
    selfieUrl: string;
  };
  status: string;
  uid: string;
}

export interface QRCodeData {
  qrId: string;
  userData: UserData;
  symptomReports: SymptomReport[];
  createdAt: any;
  updatedAt: any;
}

export interface SavedAnalysis {
  id: string;
  patientUid: string;
  patientName: string;
  patientLocation: string;
  analysisResult: any;
  selfReportsCount: number;
  observedReportsCount: number;
  totalReports: number;
  analyzedBy: string;
  createdAt: any;
  reportDate: string;
}

export interface Visit {
  id: string;
  residentName: string;
  qrId: string;
  selfieUrl?: string;
  visitDate: any;
  scannedBy: string;
}

// Common utility types
export type Severity = 'low' | 'medium' | 'high';

export interface UserLocation {
  lat: number;
  lng: number;
}

// Observation stats types
export interface ObservationStats {
  totalReports: number;
  activeSentinels: number;
  pendingCases: number;
  verifiedCases: number;
  trendData: TrendDataPoint[];
  symptomRadar: SymptomRadarPoint[];
  severityData: SeverityDataPoint[];
  reportTypeData: ReportTypeDataPoint[];
  topReporters: TopReporter[];
}

export interface TrendDataPoint {
  day: string;
  reports: number;
  verified: number;
  repeats: number;
}

export interface SymptomRadarPoint {
  symptom: string;
  count: number;
  fullMark: number;
}

export interface SeverityDataPoint {
  name: string;
  value: number;
  fill: string;
}

export interface ReportTypeDataPoint {
  day: string;
  selfReported: number;
  observed: number;
}

export interface TopReporter {
  name: string;
  reports: number;
}