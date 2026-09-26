import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Radio,
  Play,
  Square,
  Copy,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Code,
  Sliders,
  Terminal,
} from 'lucide-react';
import { McuTelemetry } from '../../types';

interface EquipmentViewProps {
  onShowToast: (title: string, msg: string, type: 'info' | 'success' | 'error') => void;
}

export const EquipmentView: React.FC<EquipmentViewProps> = ({ onShowToast }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [baudRate, setBaudRate] = useState(9600);
  const [portName, setPortName] = useState('COM Port (Simulated)');

  const [telemetry, setTelemetry] = useState<McuTelemetry>({
    loadKg: 312.4,
    tensionKn: 1.45,
    tangleRisk: 'LOW',
    stressPercent: 29,
  });

  const [logs, setLogs] = useState<string[]>([
    '[INIT] Marine AI MCU Serial Subsystem Initialized.',
    '[PORT] Streaming 9600 baud packet: LOAD:312.4,TENSION:1.45,TANGLE:LOW,STRESS:29',
  ]);

  const [autoScroll, setAutoScroll] = useState(true);
  const [activeTab, setActiveTab] = useState<'monitor' | 'firmware'>('monitor');
  const terminalRef = useRef<HTMLDivElement>(null);
  const serialPortRef = useRef<any>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Simulation interval
  useEffect(() => {
    let interval: any;
    if (isSimulating && !isConnected) {
      interval = setInterval(() => {
        const load = parseFloat((280 + Math.random() * 70).toFixed(1));
        const tension = parseFloat((1.2 + Math.random() * 0.6).toFixed(2));
        const stress = Math.min(100, Math.floor(load / 10 + tension * 12));
        const tangle: 'LOW' | 'MODERATE' | 'HIGH' =
          tension > 3.0 ? 'HIGH' : tension > 2.2 ? 'MODERATE' : 'LOW';

        const line = `LOAD:${load},TENSION:${tension},TANGLE:${tangle},STRESS:${stress}`;

        setTelemetry({
          loadKg: load,
          tensionKn: tension,
          tangleRisk: tangle,
          stressPercent: stress,
          rawLine: line,
        });

        setLogs((prev) => [...prev.slice(-100), `[${new Date().toLocaleTimeString()}] ${line}`]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isSimulating, isConnected]);

  // Web Serial API Connect
  const handleConnectSerial = async () => {
    if (!('serial' in navigator)) {
      onShowToast(
        'Web Serial Not Supported',
        'Your browser does not support the Web Serial API. Running in realistic simulation mode.',
        'info'
      );
      setIsSimulating(true);
      return;
    }

    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate });

      if (port.setSignals) {
        await port.setSignals({ dataTerminalReady: true, requestToSend: true });
      }

      serialPortRef.current = port;
      setIsConnected(true);
      setIsSimulating(false);
      setPortName('USB Serial (Connected)');
      onShowToast('MCU Connected', `Web Serial port opened at ${baudRate} baud.`, 'success');

      readSerialData(port);
    } catch (err: any) {
      console.warn('Serial connection error:', err);
      onShowToast('Connection Cancelled', err.message || 'No port selected', 'info');
    }
  };

  const readSerialData = async (port: any) => {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    let buffer = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const clean = line.trim();
            if (!clean) continue;

            // Parse LOAD:340.2,TENSION:1.55,TANGLE:LOW,STRESS:35
            let parsedLoad = telemetry.loadKg;
            let parsedTension = telemetry.tensionKn;
            let parsedTangle = telemetry.tangleRisk;
            let parsedStress = telemetry.stressPercent;

            clean.split(',').forEach((part) => {
              const [k, v] = part.split(':');
              if (k === 'LOAD') parsedLoad = parseFloat(v);
              if (k === 'TENSION') parsedTension = parseFloat(v);
              if (k === 'TANGLE') parsedTangle = v as any;
              if (k === 'STRESS') parsedStress = parseInt(v, 10);
            });

            setTelemetry({
              loadKg: parsedLoad,
              tensionKn: parsedTension,
              tangleRisk: parsedTangle,
              stressPercent: parsedStress,
              rawLine: clean,
            });

            setLogs((prev) => [...prev.slice(-100), `[RX] ${clean}`]);
          }
        }
      }
    } catch (err) {
      console.error('Serial read error:', err);
    } finally {
      reader.releaseLock();
    }
  };

  const handleDisconnectSerial = async () => {
    if (serialPortRef.current) {
      try {
        await serialPortRef.current.close();
      } catch (e) {
        console.error(e);
      }
      serialPortRef.current = null;
    }
    setIsConnected(false);
    setIsSimulating(true);
    setPortName('COM Port (Simulated)');
    onShowToast('MCU Disconnected', 'Switched back to simulation telemetry stream.', 'info');
  };

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    onShowToast('Logs Copied', 'All serial terminal lines copied to clipboard.', 'success');
  };

  const clearLogs = () => {
    setLogs([]);
    onShowToast('Terminal Cleared', 'Serial log buffer emptied.', 'info');
  };

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Title & Connection Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Equipment Monitoring & MCU WebSerial Telemetry
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  isConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                }`}
              >
                {isConnected ? 'HARDWARE ONLINE' : 'SIMULATION ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live strain gauge telemetry, tangle risk diagnostics, and winch stress monitoring streamed via Web Serial API.
            </p>
          </div>
        </div>

        {/* Connect Controls */}
        <div className="flex items-center gap-2.5">
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(Number(e.target.value))}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none cursor-pointer"
          >
            <option value={9600}>9600 Baud</option>
            <option value={19200}>19200 Baud</option>
            <option value={57600}>57600 Baud</option>
            <option value={115200}>115200 Baud</option>
          </select>

          {isConnected ? (
            <button
              onClick={handleDisconnectSerial}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Square className="w-3.5 h-3.5" />
              Disconnect MCU
            </button>
          ) : (
            <button
              onClick={handleConnectSerial}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Play className="w-3.5 h-3.5" />
              Connect USB / COM Port
            </button>
          )}
        </div>
      </div>

      {/* 4 Sensor Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Metric 1: Net Load Weight */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Net Biomass Load</span>
            <span className="text-[10px] text-emerald-400">HX711 LOAD CELL</span>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{telemetry.loadKg} kg</div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2">
              <div
                style={{ width: `${Math.min(100, (telemetry.loadKg / 800) * 100)}%` }}
                className="bg-cyan-500 h-full rounded-full transition-all duration-300"
              ></div>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-2">Rated Capacity: 800.0 kg</span>
        </div>

        {/* Metric 2: Net Tension Strain Gauge */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Tension Force</span>
            <span className="text-[10px] text-teal-400">STRAIN SENSOR</span>
          </div>
          <div>
            <div className="text-2xl font-black text-teal-300 font-mono">{telemetry.tensionKn} kN</div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2">
              <div
                style={{ width: `${Math.min(100, (telemetry.tensionKn / 5.0) * 100)}%` }}
                className="bg-teal-500 h-full rounded-full transition-all duration-300"
              ></div>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-2">Max Safety Limit: 5.0 kN</span>
        </div>

        {/* Metric 3: Tangle Risk */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Tangle Risk Diagnostic</span>
            <span className="text-[10px] text-emerald-400">AI DETECTOR</span>
          </div>
          <div>
            <div
              className={`text-xl font-black uppercase mt-1 ${
                telemetry.tangleRisk === 'HIGH'
                  ? 'text-red-400 animate-pulse'
                  : telemetry.tangleRisk === 'MODERATE'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {telemetry.tangleRisk} RISK
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {telemetry.tangleRisk === 'HIGH'
                ? 'Underwater reef snag detected! Winch torque peaking.'
                : telemetry.tangleRisk === 'MODERATE'
                ? 'Minor net distortion. Keep winch speed steady.'
                : 'Net opening geometry normal. Zero reef snags.'}
            </p>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">Snag Detection: ACTIVE</div>
        </div>

        {/* Metric 4: Winch Stress % */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Winch Motor Stress</span>
            <span className="text-[10px] text-cyan-400">TELEMETRY</span>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{telemetry.stressPercent}%</div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2">
              <div
                style={{ width: `${telemetry.stressPercent}%` }}
                className={`h-full rounded-full transition-all duration-300 ${
                  telemetry.stressPercent > 80
                    ? 'bg-red-500'
                    : telemetry.stressPercent > 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              ></div>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-2">Operating Temp: 42°C (Optimal)</span>
        </div>
      </div>

      {/* Terminal vs Firmware Code Tabs */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('monitor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'monitor'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Live Serial Monitor Stream
            </button>

            <button
              onClick={() => setActiveTab('firmware')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'firmware'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Arduino / ESP32 Firmware Sketch
            </button>
          </div>

          {activeTab === 'monitor' && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700"
                />
                Auto-scroll
              </label>

              <button
                onClick={copyLogs}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title="Copy Terminal"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={clearLogs}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title="Clear Terminal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Terminal Console */}
        {activeTab === 'monitor' ? (
          <div
            ref={terminalRef}
            className="h-64 overflow-y-auto p-4 rounded-xl bg-black font-mono text-[11px] leading-relaxed text-emerald-400 border border-slate-950 flex flex-col gap-1 select-text"
          >
            {logs.map((log, index) => (
              <div key={index} className="hover:bg-slate-900/40 px-1 rounded">
                {log}
              </div>
            ))}
          </div>
        ) : (
          /* Tab 2: Arduino/ESP32 C++ Code */
          <div className="relative p-4 rounded-xl bg-black font-mono text-[11px] leading-relaxed text-cyan-300 border border-slate-950 overflow-x-auto select-text">
            <pre>
{`// ========================================================
// Marine AI – Smart Net Load Cell & Tension Strain Monitor
// Target MCU: Arduino Uno / Nano / ESP32 (Baud: 9600)
// ========================================================

#include "HX711.h"

#define LOADCELL_DOUT_PIN  2
#define LOADCELL_SCK_PIN   3
#define STRAIN_ADC_PIN     A0

HX711 scale;

void setup() {
  Serial.begin(9600);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(2280.f); // Calibration factor
  scale.tare();
}

void loop() {
  float loadKg = scale.get_units(5);
  if (loadKg < 0) loadKg = 0;

  int rawStrain = analogRead(STRAIN_ADC_PIN);
  float tensionKn = (rawStrain / 1023.0) * 5.0; // 0 to 5.0 kN

  int stressPercent = map(rawStrain, 0, 1023, 0, 100);

  // Packet format: LOAD:val,TENSION:val,TANGLE:state,STRESS:val
  Serial.print("LOAD:"); Serial.print(loadKg, 1);
  Serial.print(",TENSION:"); Serial.print(tensionKn, 2);
  Serial.print(",TANGLE:LOW,STRESS:"); Serial.println(stressPercent);

  delay(1000);
}`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
