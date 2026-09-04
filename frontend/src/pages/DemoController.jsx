import React, { useState } from 'react';
import { Terminal, Play, Square, Zap, Shield, Eye, Activity, Cpu, AlertTriangle, Radio } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

export const DemoController = ({ onStartDemo, onStopDemo, onApplyScenario }) => {
  const [selectedScenario, setSelectedScenario] = useState('SCENARIO_4_HIGH_CONFIDENCE');
  const [targetNode, setTargetNode] = useState('NODE-001');
  const [statusMsg, setStatusMsg] = useState('');
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const demoSteps = [
    { t: 'T+00', title: 'Radar Movement Detection', desc: '24GHz mmWave radar acquires moving target at 4.8m range gate.', icon: Radio },
    { t: 'T+01', title: 'ADXL #1 Shockwave', desc: 'Ground probe A registers first footstep mechanical vibration (RMS 0.22g).', icon: Activity },
    { t: 'T+02', title: 'ADXL #2 Spatial Corroboration', desc: 'Ground probe B captures delayed wave (RMS 0.18g), confirming ground wave.', icon: Activity },
    { t: 'T+03', title: 'Random Forest Inference', desc: '8-feature extractor calculates cadence (520ms, 8.4Hz). ML classifies FOOTSTEP_HUMAN.', icon: Cpu },
    { t: 'T+04', title: 'Optical Verification', desc: 'Camera verification modality confirms target: HUMAN_PEDESTRIAN with bounding box.', icon: Eye },
    { t: 'T+05', title: 'Sensor Fusion Surge', desc: 'Multi-modal engine synthesizes evidence: confidence surges to 94%.', icon: Shield },
    { t: 'T+06', title: 'Priority Comms Transmission', desc: 'Node transmits priority alert packet over LoRa/WiFi gateway.', icon: Zap },
    { t: 'T+07', title: 'Critical Operator Alarm', desc: 'Command Center sounds tactical siren and locks 2D coordinates on property map.', icon: AlertTriangle }
  ];

  const handleStart7Step = async () => {
    setIsDemoRunning(true);
    setStatusMsg('Running 7-step sequence (T+00 to T+07)... Check Command Center tab!');
    try {
      if (onStartDemo) {
        await onStartDemo(targetNode);
      } else {
        await api.startDemo(targetNode);
      }
      setTimeout(() => setIsDemoRunning(false), 14000);
    } catch (e) {
      setStatusMsg(`Error: ${e.message}`);
      setIsDemoRunning(false);
    }
  };

  const handleStopDemo = async () => {
    setIsDemoRunning(false);
    setStatusMsg('Demo halted.');
    try {
      if (onStopDemo) await onStopDemo();
      else await api.stopDemo();
    } catch (e) {
      // ignore
    }
  };

  const handleScenarioTrigger = async () => {
    setStatusMsg(`Applying ${selectedScenario} on ${targetNode}...`);
    try {
      if (onApplyScenario) {
        await onApplyScenario(selectedScenario, targetNode);
      } else {
        await api.applyScenario(selectedScenario, targetNode);
      }
      setStatusMsg(`Scenario ${selectedScenario} active on ${targetNode}!`);
    } catch (e) {
      setStatusMsg(`Error: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      
      {/* Header Banner */}
      <div className="pb-4 border-b border-terminal-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-terminal-amber flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            <span>HACKATHON LIVE DEMONSTRATION CONTROLLER</span>
          </h1>
          <p className="text-xs text-terminal-muted">
            Deterministic scenario injector and sequential multi-modal pipeline validator. Clearly tagged as [DEMO MODE].
          </p>
        </div>

        {/* Demo Mode Badge */}
        <div className="px-3 py-1 bg-terminal-amber/20 border border-terminal-amber text-terminal-amber text-xs font-bold uppercase tracking-wider self-start sm:self-center">
          DEMO / SIMULATION SUITE
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-terminal-black border border-terminal-green text-terminal-green text-xs font-bold animate-pulse">
          $ SYSTEM_MSG: {statusMsg}
        </div>
      )}

      {/* 7-Step Hackathon Demo Controller Card */}
      <Card title="▸ 7-STEP MULTI-MODAL LIVE FUSION PIPELINE">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-terminal-black border border-terminal-border">
            <div>
              <div className="text-sm font-bold text-gray-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-terminal-amber" />
                AUTOMATED INTRUSION & SENSOR FUSION DEMONSTRATION
              </div>
              <div className="text-xs text-terminal-muted mt-1">
                Steps through radar target detection, dual ADXL345 ground shockwave analysis, local Random Forest ML inference, camera verification, and confidence surge.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="warning"
                onClick={handleStart7Step}
                disabled={isDemoRunning}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isDemoRunning ? 'DEMO IN PROGRESS...' : '[ START 7-STEP DEMO ]'}
              </Button>
              {isDemoRunning && (
                <Button variant="danger" onClick={handleStopDemo} className="flex items-center gap-1">
                  <Square className="w-3.5 h-3.5" /> STOP
                </Button>
              )}
            </div>
          </div>

          {/* 7-Step Timeline Stepper Visualizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {demoSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="p-3 bg-terminal-surface border border-terminal-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-terminal-amber">{step.t}</span>
                    <Icon className="w-3.5 h-3.5 text-terminal-muted" />
                  </div>
                  <div className="text-xs font-bold text-gray-200">{step.title}</div>
                  <div className="text-[10px] text-terminal-muted leading-tight">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Deterministic Scenarios Selector Card */}
      <Card title="▸ DETERMINISTIC TEST SCENARIOS">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-terminal-muted block mb-1">SELECT TARGET NODE:</label>
              <select
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                className="w-full bg-terminal-black border border-terminal-border p-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-terminal-green"
              >
                <option value="NODE-001">NODE-001 (North Perimeter Gate)</option>
                <option value="NODE-002">NODE-002 (East Fence Boundary)</option>
                <option value="NODE-003">NODE-003 (South Forest Approach)</option>
                <option value="NODE-004">NODE-004 (West Driveway Access)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-terminal-muted block mb-1">SELECT PRESET SCENARIO:</label>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="w-full bg-terminal-black border border-terminal-border p-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-terminal-amber"
              >
                <option value="SCENARIO_1_NORMAL">Scenario 1: Normal Environment (Ambient noise floor)</option>
                <option value="SCENARIO_2_ENVIRONMENTAL">Scenario 2: Environmental Noise (Wind/Rain, no radar)</option>
                <option value="SCENARIO_3_HUMAN_MOVEMENT">Scenario 3: Suspicious Human Movement (Radar active)</option>
                <option value="SCENARIO_4_HIGH_CONFIDENCE">Scenario 4: High-Confidence Intrusion Event</option>
                <option value="SCENARIO_5_NODE_OFFLINE">Scenario 5: Node Offline Simulation</option>
                <option value="SCENARIO_6_LOW_BATTERY">Scenario 6: Low Battery Trigger (&lt;15%)</option>
              </select>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleScenarioTrigger}
            className="w-full"
          >
            INJECT SELECTED SCENARIO TO SENSORS
          </Button>
        </div>
      </Card>

    </div>
  );
};

export default DemoController;
