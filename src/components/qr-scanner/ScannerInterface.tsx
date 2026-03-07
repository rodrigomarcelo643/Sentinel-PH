import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Settings, X, Maximize2, RotateCcw } from "lucide-react";

interface ScannerInterfaceProps {
  error: string | null;
  onStopScanning: () => void;
  onCameraChange?: (deviceId: string) => void;
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

export default function ScannerInterface({ error, onStopScanning, onCameraChange }: ScannerInterfaceProps) {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState<number>(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Get available cameras
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices
          .filter(device => device.kind === 'videoinput')
          .map((device, index) => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${index + 1}`
          }));
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          // Prefer back camera if available
          const backCameraIndex = videoDevices.findIndex(cam => 
            cam.label.toLowerCase().includes('back') || 
            cam.label.toLowerCase().includes('rear')
          );
          const defaultIndex = backCameraIndex !== -1 ? backCameraIndex : 0;
          setSelectedCameraIndex(defaultIndex);
          onCameraChange?.(videoDevices[defaultIndex].deviceId);
        }
      } catch (error) {
        console.error('Error getting cameras:', error);
      }
    };

    getCameras();
  }, []);

  const switchCamera = () => {
    if (cameras.length > 1) {
      const nextIndex = (selectedCameraIndex + 1) % cameras.length;
      setSelectedCameraIndex(nextIndex);
      onCameraChange?.(cameras[nextIndex].deviceId);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Prevent accidental navigation and browser actions
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Scanner is active. Are you sure you want to leave?';
      return 'Scanner is active. Are you sure you want to leave?';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common browser shortcuts that could close the scanner
      if (
        e.key === 'F5' ||
        (e.ctrlKey && (e.key === 'r' || e.key === 'R')) ||
        (e.altKey && e.key === 'F4') ||
        (e.ctrlKey && (e.key === 'w' || e.key === 'W')) ||
        (e.ctrlKey && (e.key === 't' || e.key === 'T')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 't' || e.key === 'T')) ||
        e.key === 'F11'
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Allow Escape to stop scanning
      if (e.key === 'Escape') {
        onStopScanning();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Optionally pause scanner when tab becomes hidden
        console.log('Scanner paused - tab hidden');
      } else {
        console.log('Scanner resumed - tab visible');
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Disable context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onStopScanning]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col qr-scanner-container">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold">QR Scanner Active</span>
              <div className="text-xs text-gray-300">SentinelPH Health System</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <img src="/sentinel_ph_logo.png" alt="SentinelPH" className="h-10 w-auto" />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Camera Switch Button */}
          {cameras.length > 1 && (
            <Button 
              onClick={switchCamera} 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-gray-700 transition-colors"
              title="Switch Camera"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          
          {/* Settings Button */}
          <Button 
            onClick={() => setShowSettings(!showSettings)} 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-gray-700 transition-colors"
            title="Camera Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          {/* Fullscreen Button */}
          <Button 
            onClick={toggleFullscreen} 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-gray-700 transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          
          {/* Stop Button */}
          <Button 
            onClick={onStopScanning} 
            variant="destructive" 
            size="sm" 
            className="bg-red-600 hover:bg-red-700 transition-colors font-medium"
          >
            <X className="h-4 w-4 mr-1" />
            Stop
          </Button>
        </div>
      </div>

      {/* Camera Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800 text-white p-4 border-b border-gray-700 qr-settings">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <Camera className="h-4 w-4 text-blue-400" />
              <span className="font-medium text-gray-200">Active Camera:</span>
              <span className="text-blue-300">{cameras[selectedCameraIndex]?.label || 'Default'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>{cameras.length} camera(s) detected</span>
            </div>
            {cameras.length > 1 && (
              <div className="text-xs text-gray-400">
                Click the rotate button to switch cameras
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scanner Area */}
      <div className="flex-1 relative overflow-hidden bg-gray-900">
        <div id="qr-reader" className="w-full h-full flex items-center justify-center"></div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-8 left-4 right-4 bg-red-600 text-white rounded-xl p-4 shadow-2xl border border-red-500">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-red-700 rounded-full">
              <X className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Scanner Error</p>
              <p className="text-xs text-red-100">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Status Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3 border-t border-gray-700">
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">Scanner Active</span>
          </div>
          <div className="text-gray-400">•</div>
          <div className="flex items-center gap-1">
            <Camera className="h-3 w-3" />
            <span>{cameras[selectedCameraIndex]?.label || 'Default Camera'}</span>
          </div>
          <div className="text-gray-400">•</div>
          <div className="font-medium text-blue-300">SentinelPH Health System</div>
        </div>
      </div>
    </div>
  );
}