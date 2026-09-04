import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const AudioAlarm = ({ activeAlertCount = 0 }) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef(null);
  const lastAlertCountRef = useRef(activeAlertCount);

  useEffect(() => {
    // Only beep when a new alert is received and not muted
    if (!isMuted && activeAlertCount > lastAlertCountRef.current) {
      playTacticalSiren();
    }
    lastAlertCountRef.current = activeAlertCount;
  }, [activeAlertCount, isMuted]);

  const playTacticalSiren = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      // Pitch ramp for tactical sentry alert
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.35);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.65);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch (e) {
      console.warn('Audio alarm playback error:', e);
    }
  };

  return (
    <button
      onClick={() => setIsMuted(!isMuted)}
      title={isMuted ? 'Unmute tactical alarms' : 'Mute tactical alarms'}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold uppercase border transition-colors ${
        isMuted
          ? 'border-gray-700 text-gray-500 bg-black/40 hover:text-gray-400'
          : activeAlertCount > 0
          ? 'border-terminal-red text-terminal-red bg-terminal-red/10 animate-pulse'
          : 'border-terminal-green text-terminal-green bg-terminal-green/10'
      }`}
    >
      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      <span>{isMuted ? 'AUDIO: OFF' : 'AUDIO: ON'}</span>
    </button>
  );
};

export default AudioAlarm;
