import type { SymptomReport } from '@/@types/core';

export interface AIAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selfReports: SymptomReport[];
  observedReports: SymptomReport[];
  patientInfo: {
    name: string;
    uid: string;
    age?: number;
    gender?: string;
    location?: string;
  };
}