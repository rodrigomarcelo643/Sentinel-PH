import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";

interface QRScannerHeaderProps {
  onStartScanning: () => void;
}

export default function QRScannerHeader({ onStartScanning }: QRScannerHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
        <p className="text-gray-600 mt-2">Scan resident QR codes and track visits</p>
      </div>
      <div className="relative group">
        <div className="absolute -inset-1 bg-linear-to-r from-[#1B365D] to-[#2d4a7c] rounded-[2px] blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
        <Button onClick={onStartScanning} className="relative bg-linear-to-r rounded-[2px]! from-[#1B365D] to-[#2d4a7c] hover:from-[#152a4a] hover:to-[#1B365D] text-white px-6 py-6 cursor-pointer shadow-lg">
          <Scan className="mr-2 h-5 w-5" />
          <span className="font-semibold">Start Scanning</span>
        </Button>
      </div>
    </div>
  );
}