import React, { useState, useRef, useEffect } from 'react';
import { Camera, Eye, Video, VideoOff, RefreshCw } from 'lucide-react';
import Card from '../Card';
import Button from '../Button';

export const CameraVerification = ({ node, detection }) => {
  const [useRealWebcam, setUseRealWebcam] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const videoRef = useRef(null);

  const isVerified = detection?.verified || (node && node.sensors && node.sensors.camera && node.sensors.camera.verified);
  const targetLabel = detection?.label || 'HUMAN_PEDESTRIAN';
  const confidence = detection?.confidence ? Math.round(detection.confidence * 100) : (isVerified ? 91 : 0);

  // Handle local webcam activation when toggled
  useEffect(() => {
    let stream = null;
    if (useRealWebcam) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setWebcamActive(true);
          }
        })
        .catch((err) => {
          console.warn('Webcam permission not granted or unavailable:', err);
          setUseRealWebcam(false);
          setWebcamActive(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setWebcamActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useRealWebcam]);

  return (
    <Card 
      title={`▸ OPTICAL VERIFICATION MODALITY : ${node ? node.nodeId : 'SELECT NODE'}`}
      headerAction={
        <button
          onClick={() => setUseRealWebcam(!useRealWebcam)}
          className="text-[10px] font-mono font-bold px-2 py-0.5 border border-terminal-border bg-terminal-black hover:border-terminal-green text-gray-300 transition-colors leading-none"
        >
          {useRealWebcam ? 'USE SIMULATION' : 'ENABLE WEBCAM'}
        </button>
      }
    >
      <div className="space-y-3 font-mono flex-1 flex flex-col justify-between">
        
        {/* Camera Feed Viewport */}
        <div className="relative w-full h-56 bg-terminal-black border border-terminal-border overflow-hidden flex items-center justify-center">
          
          {useRealWebcam ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            /* Tactical Simulated Camera Feed Graphic */
            <div className="relative w-full h-full bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
              {/* Grid Lines */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(to right, #00ff66 1px, transparent 1px), linear-gradient(to bottom, #00ff66 1px, transparent 1px)',
                  backgroundSize: '25px 25px'
                }}
              />

              {/* Crosshair Center */}
              <div className="w-10 h-10 border border-dashed border-terminal-muted/40 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-terminal-green/60 rounded-full" />
              </div>

              {/* Simulated Bounding Box when target verified */}
              {isVerified && (
                <div 
                  className="absolute w-24 h-40 border-2 border-terminal-red bg-terminal-red/10 animate-pulse flex flex-col justify-between p-1 shadow-[0_0_15px_rgba(255,51,68,0.3)]"
                  style={{ top: '15%', left: '38%' }}
                >
                  <div className="text-[8px] font-bold text-terminal-red bg-terminal-black px-1 border border-terminal-red w-fit leading-none py-0.5">
                    [{targetLabel}] {confidence}%
                  </div>
                  <div className="text-[8px] text-gray-200 bg-terminal-black px-1 border border-terminal-red w-fit leading-none py-0.5">
                    OPTICAL VERIFIED
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode Badge in Viewport */}
          <div className="absolute top-2 left-2 z-10">
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border leading-none ${
              useRealWebcam 
                ? 'bg-terminal-cyan/20 text-terminal-cyan border-terminal-cyan' 
                : 'bg-terminal-amber/20 text-terminal-amber border-terminal-amber'
            }`}>
              {useRealWebcam ? 'REAL CAMERA (WEBCAM)' : 'SIMULATION MODE (MOCK HUD)'}
            </span>
          </div>

          <div className="absolute bottom-2 left-2 text-[9px] text-terminal-muted bg-terminal-black/90 px-1.5 py-0.5 border border-terminal-border">
            OPTICAL CONF: {confidence}%
          </div>
        </div>

        {/* Verification Status & Details */}
        <div className="p-2.5 bg-terminal-surface border border-terminal-border text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-terminal-muted flex items-center gap-1.5 text-xs">
              <Camera className="w-3.5 h-3.5 text-terminal-cyan flex-shrink-0" />
              OPTICAL STATUS:
            </span>
            <span className={`font-bold text-xs ${isVerified ? 'text-terminal-green' : 'text-gray-400'}`}>
              {isVerified ? `VERIFIED (${targetLabel})` : 'AWAITING SEISMIC / RADAR'}
            </span>
          </div>
          <div className="text-[10px] text-terminal-muted mt-1 leading-relaxed">
            Acts as secondary optical validation. Radar &amp; dual seismic shockwaves acquire target, followed by camera verification to confirm human vs wildlife vs vehicle.
          </div>
        </div>

      </div>
    </Card>
  );
};

export default CameraVerification;
