import { toast } from '@/hooks/use-toast';

export const showAnnouncementCreatedToast = (title: string) => {
  toast({
    title: "📢 Announcement Created Successfully",
    description: `"${title}" has been published to all residents.`,
    duration: 5000,
  });
};

export const showOutbreakAlertToast = (riskLevel: string, disease: string) => {
  const emoji = riskLevel === 'CRITICAL' ? '🚨' : riskLevel === 'HIGH' ? '⚠️' : '📢';
  
  toast({
    title: `${emoji} Outbreak Alert Generated`,
    description: `${riskLevel} risk pattern detected for ${disease}. Announcement ready for review.`,
    duration: 6000,
  });
};

export const showPatternAnalysisToast = (totalReports: number, riskLevel: string) => {
  toast({
    title: "🧠 Pattern Analysis Complete",
    description: `Analyzed ${totalReports} reports. Risk level: ${riskLevel}`,
    duration: 4000,
  });
};