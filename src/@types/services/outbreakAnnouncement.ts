// Types from src/services/outbreakAnnouncementService.ts

export interface OutbreakAnnouncementData {
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  recommendations: string[];
}