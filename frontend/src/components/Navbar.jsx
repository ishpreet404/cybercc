import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity, AlertTriangle, Database, Terminal, Cpu } from 'lucide-react';
import AudioAlarm from './AudioAlarm';

export const Navbar = ({ activeTab, setActiveTab, systemStatus, alertCount = 0, wsConnected = false }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString() + ' UTC' + (now.getTimezoneOffset() > 0 ? '-' : '+') + Math.abs(now.getTimezoneOffset() / 60));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'command', label: 'COMMAND CENTER', icon: Radio },
    { id: 'nodes', label: 'NODE INSPECTION', icon: Cpu },
    { id: 'events', label: 'INCIDENT LOG', icon: Activity, badge: alertCount },
    { id: 'threat', label: 'THREAT INTEL (OSINT)', icon: Database },
    { id: 'demo', label: 'HACKATHON DEMO', icon: Terminal, highlight: true }
  ];

  return (
    <header className="border-b border-terminal-border bg-terminal-black sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-terminal-green/10 border border-terminal-green flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-terminal-green animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-sm sm:text-base tracking-wider text-terminal-green text-shadow-terminal leading-none">
                  CYBER CHAUKIDAAR
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-terminal-green/20 text-terminal-green border border-terminal-green/40 leading-none">
                  v1.2.0
                </span>
              </div>
              <div className="text-[9px] font-mono text-terminal-muted tracking-widest uppercase mt-0.5 leading-none">
                CYBER-PHYSICAL PERIMETER DEFENSE SENTRY
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border transition-all select-none ${
                    isActive
                      ? item.highlight
                        ? 'bg-terminal-amber/20 text-terminal-amber border-terminal-amber shadow-[0_0_12px_rgba(255,176,0,0.3)]'
                        : 'bg-terminal-green/20 text-terminal-green border-terminal-green shadow-[0_0_12px_rgba(0,255,102,0.3)]'
                      : item.highlight
                      ? 'border-terminal-amber/40 text-terminal-amber/80 hover:border-terminal-amber hover:text-terminal-amber'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-terminal-border'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] leading-none bg-terminal-red text-white font-bold rounded-none animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-3">
            {/* WS Live Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono border border-terminal-border px-2 py-1 bg-terminal-surface">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${wsConnected ? 'bg-terminal-green animate-pulse' : 'bg-terminal-red'}`} />
              <span className={`font-bold ${wsConnected ? 'text-terminal-green' : 'text-terminal-red'}`}>
                {wsConnected ? 'LIVE GRID' : 'OFFLINE'}
              </span>
            </div>

            {/* Audio Alarm Beeper Toggle */}
            <AudioAlarm activeAlertCount={alertCount} />

            {/* Time */}
            <div className="hidden lg:block text-[11px] font-mono text-terminal-muted px-2 py-1 border border-terminal-border bg-black/40">
              {timeStr}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-1 py-2 border-t border-terminal-border/50 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 text-[10px] font-mono uppercase whitespace-nowrap border flex items-center gap-1.5 ${
                activeTab === item.id ? 'border-terminal-green text-terminal-green bg-terminal-green/10 font-bold' : 'border-terminal-border text-gray-400'
              }`}
            >
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="px-1 text-[9px] bg-terminal-red text-white font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
