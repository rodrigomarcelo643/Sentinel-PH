import { Button } from "@/components/ui/button";

interface ScannerInterfaceProps {
  error: string | null;
  onStopScanning: () => void;
}

export default function ScannerInterface({ error, onStopScanning }: ScannerInterfaceProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col p-4">
      <div className="flex justify-between items-center p-4 bg-gray-900 text-white rounded-t-lg">
        <div className="text-sm">Point QR code to the camera</div>
        <div className="flex items-center gap-3">
          <img src="/sentinel_ph_logo.png" alt="SentinelPH" className="h-8" />
        </div>
        <Button onClick={onStopScanning} variant="destructive" size="sm" className="rounded-[2px]!">
          Stop Scanning
        </Button>
      </div>
      <div className="flex-1 overflow-hidden rounded-b-lg">
        <div id="qr-reader" className="w-full h-full"></div>
      </div>
      {error && (
        <div className="absolute bottom-8 left-8 right-8 bg-red-500 text-white rounded-lg p-3">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}