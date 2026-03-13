import type { PatternAnalysisResult } from '@/@types/services/patternAnalysis';
import type { OutbreakAnnouncementData } from '@/@types/services/outbreakAnnouncement';

export interface PatternAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: PatternAnalysisResult | null;
  isLoading: boolean;
  onSaveOutbreakAlert?: (analysis: PatternAnalysisResult) => void;
  onCreateAnnouncement?: (announcementData: OutbreakAnnouncementData, analysisData: PatternAnalysisResult) => void;
}