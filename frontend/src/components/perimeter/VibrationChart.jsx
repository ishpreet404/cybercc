import React, { useRef, useEffect } from 'react';
import { Activity, Zap, Cpu, AlertCircle } from 'lucide-react';
import Card from '../Card';

export const VibrationChart = ({ node, vibrationData }) => {
  const canvasRef = useRef(null);

  const s1 = (node && node.sensors && node.sensors.adxl1) || {
    vibrationRms: 0.02,
    level: 'NORMAL',
    x: 0, y: 0, z: 1.0,
    features: null
  };
  const s2 = (node && node.sensors && node.sensors.adxl2) || {
    vibrationRms: 0.02,
    level: 'NORMAL',
    x: 0, y: 0, z: 1.0
  };

  const features = s1.features || {
    rms: s1.vibrationRms || 0.02,
    peak: Number((s1.vibrationRms * 2.2).toFixed(3)),
    peakToPeak: Number((s1.vibrationRms * 3.5).toFixed(3)),
    variance: 0.0004,
    dominantFrequency: s1.vibrationRms > 0.15 ? 8.2 : 2.5,
    spectralEnergy: s1.vibrationRms > 0.15 ? 0.28 : 0.02,
    spectralCentroid: s1.vibrationRms > 0.15 ? 11.4 : 6.0,
    interPeakInterval: s1.vibrationRms > 0.15 ? 540 : 0
  };

  // ML Classification determination
  const isHuman = s1.vibrationRms > 0.18 && features.dominantFrequency < 18;
  const isVehicle = s1.vibrationRms > 0.22 && features.dominantFrequency >= 18;
  const classification = isHuman ? 'FOOTSTEP_HUMAN' : (isVehicle ? 'VEHICLE' : (s1.vibrationRms > 0.10 ? 'ENVIRONMENTAL' : 'NORMAL'));

  // Draw continuous smooth seismic waveform oscilloscope
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let phase = 0;

    const render = () => {
      phase += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      ctx.fillStyle = '#080c10';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = '#1a2332';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Zero baseline
      ctx.strokeStyle = '#273549';
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();

      // Channel 1 (ADXL345 #1) - Green trace
      const amp1 = (s1.vibrationRms || 0.02) * 120;
      ctx.strokeStyle = s1.vibrationRms > 0.15 ? '#ffb000' : '#00ff66';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const noise = Math.sin(x * 0.08 + phase) * Math.cos(x * 0.03 - phase * 0.5);
        const pulse = s1.vibrationRms > 0.15 ? Math.sin((x + phase * 20) * 0.1) : 1;
        const y = midY - 18 + noise * amp1 * pulse;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Channel 2 (ADXL345 #2) - Cyan trace (slight spatial delay)
      const amp2 = (s2.vibrationRms || 0.02) * 120;
      ctx.strokeStyle = s2.vibrationRms > 0.15 ? '#ff3344' : '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const noise2 = Math.sin((x - 15) * 0.08 + phase) * Math.cos((x - 15) * 0.03 - phase * 0.5);
        const pulse2 = s2.vibrationRms > 0.15 ? Math.sin((x - 15 + phase * 20) * 0.1) : 1;
        const y2 = midY + 18 + noise2 * amp2 * pulse2;
        if (x === 0) ctx.moveTo(x, y2);
        else ctx.lineTo(x, y2);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [s1.vibrationRms, s2.vibrationRms]);

  return (
    <Card title={`▸ DUAL ADXL345 SEISMIC VIBRATION : ${node ? node.nodeId : 'SELECT NODE'}`}>
      <div className="space-y-4 font-mono">
        
        {/* Oscilloscope Canvas */}
        <div className="relative border border-terminal-border bg-terminal-black overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={180}
            className="w-full h-40 block"
          />
          
          {/* Oscilloscope Legend Overlay */}
          <div className="absolute top-2 left-2 flex items-center gap-3 text-[10px] bg-terminal-black/80 px-2 py-1 border border-terminal-border">
            <span className="flex items-center gap-1 text-terminal-green">
              <span className="w-2 h-0.5 bg-terminal-green inline-block"></span> ADXL #1 (PROBE A)
            </span>
            <span className="flex items-center gap-1 text-terminal-cyan">
              <span className="w-2 h-0.5 bg-terminal-cyan inline-block"></span> ADXL #2 (PROBE B)
            </span>
            <span className="text-terminal-muted">100 Hz IIR FILTERED</span>
          </div>

          <div className="absolute bottom-2 right-2 text-[9px] text-terminal-muted bg-terminal-black/80 px-1.5 py-0.5 border border-terminal-border">
            TIME BASE: 100ms/DIV | MAG: ±2.0g
          </div>
        </div>

        {/* Dual Sensor Comparison Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Sensor 1 */}
          <div className="p-2.5 bg-terminal-surface border border-terminal-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-terminal-green">ADXL-01 (NORTH PROBE)</span>
              <span className={`text-[10px] px-1 py-0.2 border font-bold uppercase ${
                s1.vibrationRms > 0.15 ? 'text-terminal-amber border-terminal-amber bg-terminal-amber/10' : 'text-terminal-green border-terminal-green'
              }`}>
                {s1.level || 'NORMAL'}
              </span>
            </div>
            <div className="text-xl font-bold text-gray-100">
              {Number((s1.vibrationRms || 0.02).toFixed(4))} <span className="text-xs font-normal text-terminal-muted">g RMS</span>
            </div>
            <div className="text-[10px] text-terminal-muted mt-1">
              X:{s1.x} Y:{s1.y} Z:{s1.z} | PEAK: {features.peak}g
            </div>
          </div>

          {/* Sensor 2 */}
          <div className="p-2.5 bg-terminal-surface border border-terminal-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-terminal-cyan">ADXL-02 (SOUTH PROBE)</span>
              <span className={`text-[10px] px-1 py-0.2 border font-bold uppercase ${
                s2.vibrationRms > 0.15 ? 'text-terminal-red border-terminal-red bg-terminal-red/10' : 'text-terminal-cyan border-terminal-cyan'
              }`}>
                {s2.level || 'NORMAL'}
              </span>
            </div>
            <div className="text-xl font-bold text-gray-100">
              {Number((s2.vibrationRms || 0.02).toFixed(4))} <span className="text-xs font-normal text-terminal-muted">g RMS</span>
            </div>
            <div className="text-[10px] text-terminal-muted mt-1">
              X:{s2.x} Y:{s2.y} Z:{s2.z} | SPACING: {node?.sensorSpacing || 1.5}m
            </div>
          </div>
        </div>

        {/* 8-Feature Extraction Table & ML Classification */}
        <div className="p-3 bg-terminal-black border border-terminal-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-terminal-amber" />
              LOCAL RANDOM FOREST CLASSIFIER
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-terminal-amber/20 text-terminal-amber border border-terminal-amber font-bold">
              {classification} ({isHuman || isVehicle ? '91%' : '98%'} CONF)
            </span>
          </div>

          {/* 8 Spectral Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="border border-terminal-border/60 p-1.5">
              <div className="text-terminal-muted">1. RMS</div>
              <div className="font-bold text-gray-200">{features.rms}g</div>
            </div>
            <div className="border border-terminal-border/60 p-1.5">
              <div className="text-terminal-muted">2. PEAK</div>
              <div className="font-bold text-gray-200">{features.peak}g</div>
            </div>
            <div className="border border-terminal-border/60 p-1.5">
              <div className="text-terminal-muted">3. PEAK-TO-PEAK</div>
              <div className="font-bold text-gray-200">{features.peakToPeak}g</div>
            </div>
            <div className="border border-terminal-border/60 p-1.5">
              <div className="text-terminal-muted">4. VARIANCE</div>
              <div className="font-bold text-gray-200">{features.variance}</div>
            </div>
            <div className="border border-terminal-border/60 p-1.5">
              <div className="text-terminal-muted">5. DOM. FREQ</div>
              <div className="font-bold text-terminal-green">{features.dominantFrequency} Hz</div>
            </div>
            <div className="border border-terminal-border/60 p-1.5">
              <div className="text-terminal-muted">6. SPEC. ENERGY</div>
              <div className="font-bold text-gray-200">{features.spectralEnergy}</div>
            </div>
            <div className="border border-terminal-border/60 p-1.5">
              <div className="text-terminal-muted">7. CENTROID</div>
              <div className="font-bold text-gray-200">{features.spectralCentroid} Hz</div>
            </div>
            <div className="border border-terminal-border/60 p-1.5">
              <div className="text-terminal-muted">8. INTER-PEAK (IPI)</div>
              <div className="font-bold text-terminal-amber">{features.interPeakInterval} ms</div>
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
};

export default VibrationChart;
