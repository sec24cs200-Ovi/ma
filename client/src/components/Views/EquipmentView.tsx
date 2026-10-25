import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Play,
  Square,
  Copy,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Code,
  Terminal,
  RotateCcw,
  ShieldAlert,
  Download,
  Volume2,
  VolumeX,
  Send,
  ArrowRightLeft,
  Pause,
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

  // Unit settings: default to grams ('g') as requested by user
  const [displayUnit, setDisplayUnit] = useState<'g' | 'kg'>('g');
  const [convertKgToGInMonitor, setConvertKgToGInMonitor] = useState(true);

  // Safety & Emergency Stop states
  const [autoStopOnTangle, setAutoStopOnTangle] = useState(true);
  const [isStopped, setIsStopped] = useState(false);
  const isStoppedRef = useRef(false);
  isStoppedRef.current = isStopped;

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customCmd, setCustomCmd] = useState('');

  const [telemetry, setTelemetry] = useState<McuTelemetry>({
    loadKg: 0.45,
    loadG: 450,
    tensionKn: 1.45,
    tangleRisk: 'LOW',
    stressPercent: 29,
    isHalted: false,
  });

  const [logs, setLogs] = useState<string[]>([
    '[INIT] Marine AI MCU Serial Subsystem Initialized.',
    '[PORT] Monitoring 9600 baud stream. Unit mode: Grams (g). Auto-Stop: Active.',
    '[RX] SAFE',
    '[RX] Weight: 450 g',
  ]);

  const [autoScroll, setAutoScroll] = useState(true);
  const [activeTab, setActiveTab] = useState<'monitor' | 'firmware'>('monitor');
  const terminalRef = useRef<HTMLDivElement>(null);
  const serialPortRef = useRef<any>(null);

  // Audio synthesizer warning alarm
  const playAlarmTone = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext error handling (e.g. autoplay policy)
    }
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Transmit command to MCU over Web Serial
  const sendSerialCmd = async (cmd: string) => {
    if (!cmd.trim()) return;
    const cleanCmd = cmd.trim();
    setLogs((prev) => [...prev.slice(-150), `[TX] ${cleanCmd}`]);

    if (serialPortRef.current && serialPortRef.current.writable) {
      try {
        const textEncoder = new TextEncoder();
        const writer = serialPortRef.current.writable.getWriter();
        await writer.write(textEncoder.encode(cleanCmd + '\r\n'));
        writer.releaseLock();
      } catch (err: any) {
        console.error('Serial TX error:', err);
        setLogs((prev) => [...prev.slice(-150), `[ERR] TX Failed: ${err.message || err}`]);
      }
    } else if (isSimulating) {
      setTimeout(() => {
        if (cleanCmd === 'TARE') {
          setLogs((prev) => [...prev.slice(-150), '[SYS] Tare scale calibrated to 0.0 g']);
          setTelemetry((prev) => ({ ...prev, loadKg: 0, loadG: 0 }));
        } else if (cleanCmd === 'STOP') {
          setLogs((prev) => [...prev.slice(-150), '[SYS] MCU ACK: Measurement loop suspended']);
        } else if (cleanCmd === 'RESUME') {
          setLogs((prev) => [...prev.slice(-150), '[SYS] MCU ACK: Measurement loop resumed']);
        } else {
          setLogs((prev) => [...prev.slice(-150), `[SYS] Simulated ACK for '${cleanCmd}'`]);
        }
      }, 200);
    }
  };

  // Resume Measurement handler
  const handleResumeMeasurement = () => {
    setIsStopped(false);
    isStoppedRef.current = false;
    sendSerialCmd('RESUME');
    setLogs((prev) => [
      ...prev.slice(-150),
      `[SYS] Measurement resumed by operator at ${new Date().toLocaleTimeString()}. Live stream re-engaged.`,
    ]);
    setTelemetry((prev) => ({ ...prev, isHalted: false, tangleRisk: 'LOW' }));
    onShowToast('Measurement Resumed', 'Live telemetry monitoring re-engaged.', 'success');
  };

  // Manual Stop handler
  const handleManualStopMeasurement = () => {
    setIsStopped(true);
    isStoppedRef.current = true;
    sendSerialCmd('STOP');
    playAlarmTone();
    setLogs((prev) => [
      ...prev.slice(-150),
      `[SYS] Emergency Stop triggered by operator at ${new Date().toLocaleTimeString()}. Telemetry halted.`,
    ]);
    setTelemetry((prev) => ({ ...prev, isHalted: true }));
    onShowToast('Measurement Halted', 'Telemetry stream safely paused.', 'info');
  };

  // Simulation loop (realistic grams output matching user test: 350g, 400g, 450g, 800g)
  useEffect(() => {
    let interval: any;
    if (isSimulating && !isConnected && !isStopped) {
      interval = setInterval(() => {
        // Occasionally simulate a high load tangle test (800g) or normal readings (350g-480g)
        const isTangleEvent = Math.random() < 0.15;
        const loadG = isTangleEvent ? 800 : Math.round(350 + Math.random() * 150);
        const loadKg = parseFloat((loadG / 1000).toFixed(2));
        const tension = parseFloat(((loadG / 1000) * 1.8 + 0.4).toFixed(2));
        const stress = Math.min(100, Math.floor((loadG / 1000) * 60));
        const tangleStatus: 'LOW' | 'MODERATE' | 'HIGH' = isTangleEvent ? 'HIGH' : 'LOW';

        // Check if Auto-Stop condition is met: Tangle + Load
        if (isTangleEvent && autoStopOnTangle) {
          setIsStopped(true);
          isStoppedRef.current = true;
          playAlarmTone();

          const stopLines = [
            `[RX] TANGLE DETECTED`,
            `[RX] Weight: ${displayUnit === 'g' ? `${loadG} g` : `${loadKg.toFixed(2)} kg`}`,
            `[ALARM] ⚠️ MEASUREMENT AUTO-STOPPED: Net Tangle detected with ${loadG} g active load!`,
            `[SAFETY] Winch safety lock engaged. Press 'Resume Measurement' to reset.`,
          ];

          setTelemetry({
            loadKg,
            loadG,
            tensionKn: tension,
            tangleRisk: 'HIGH',
            stressPercent: stress,
            isHalted: true,
            rawLine: `TANGLE DETECTED, Weight: ${loadG}g`,
          });

          setLogs((prev) => [...prev.slice(-150), ...stopLines]);
          onShowToast(
            'Safety Stop Engaged',
            `Net tangle detected under ${loadG} g load! Measurement halted.`,
            'error'
          );
          return;
        }

        const lines = [
          `[RX] ${tangleStatus === 'HIGH' ? 'TANGLE DETECTED' : 'SAFE'}`,
          `[RX] Weight: ${displayUnit === 'g' ? `${loadG} g` : `${loadKg.toFixed(2)} kg`}`,
        ];

        setTelemetry({
          loadKg,
          loadG,
          tensionKn: tension,
          tangleRisk: tangleStatus,
          stressPercent: stress,
          isHalted: false,
          rawLine: `Weight: ${loadG}g`,
        });

        setLogs((prev) => [...prev.slice(-150), ...lines]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isSimulating, isConnected, isStopped, displayUnit, autoStopOnTangle]);

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
      setIsStopped(false);
      isStoppedRef.current = false;
      setPortName('USB Serial (Connected)');
      onShowToast('MCU Connected', `Web Serial port opened at ${baudRate} baud.`, 'success');

      readSerialData(port);
    } catch (err: any) {
      console.warn('Serial connection error:', err);
      onShowToast('Connection Cancelled', err.message || 'No port selected', 'info');
    }
  };

  // Web Serial Stream Reader
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

            // 1. Process line display for Serial Monitor:
            // Convert any 'X kg' mentions to grams if convertKgToGInMonitor is enabled
            let displayLine = clean;
            if (convertKgToGInMonitor) {
              displayLine = clean.replace(/([0-9.]+)\s*kg\b/gi, (_match, val) => {
                const num = parseFloat(val);
                return !isNaN(num) ? `${Math.round(num * 1000)} g` : _match;
              });
            }

            setLogs((prev) => [...prev.slice(-150), `[RX] ${displayLine}`]);

            // 2. Extract telemetry variables
            const upper = clean.toUpperCase();
            let parsedTangle: 'LOW' | 'MODERATE' | 'HIGH' | null = null;
            let parsedLoadKg: number | null = null;
            let parsedLoadG: number | null = null;
            let parsedTension: number | null = null;
            let parsedStress: number | null = null;

            // Tangle detection from standalone words or flags
            if (
              upper.includes('TANGLE DETECTED') ||
              upper.includes('SNAG DETECTED') ||
              upper.includes('TANGLE:HIGH') ||
              upper.includes('SNAG') ||
              upper.includes('DANGER')
            ) {
              parsedTangle = 'HIGH';
            } else if (
              upper.includes('SAFE') ||
              upper.includes('NORMAL') ||
              upper.includes('TANGLE:LOW')
            ) {
              parsedTangle = 'LOW';
            } else if (upper.includes('MODERATE') || upper.includes('TANGLE:MODERATE')) {
              parsedTangle = 'MODERATE';
            }

            // Weight detection: "Weight: 0.80 kg" or "Weight: 800 g" or "Weight: 800"
            const weightMatch = clean.match(/Weight:\s*([0-9.]+)\s*(kg|g)?/i);
            if (weightMatch) {
              const val = parseFloat(weightMatch[1]);
              const unit = (weightMatch[2] || '').toLowerCase();
              if (unit === 'kg') {
                parsedLoadKg = val;
                parsedLoadG = Math.round(val * 1000);
              } else if (unit === 'g') {
                parsedLoadG = Math.round(val);
                parsedLoadKg = parseFloat((val / 1000).toFixed(3));
              } else {
                // If value < 50, assume kg, else assume grams
                if (val < 50) {
                  parsedLoadKg = val;
                  parsedLoadG = Math.round(val * 1000);
                } else {
                  parsedLoadG = Math.round(val);
                  parsedLoadKg = parseFloat((val / 1000).toFixed(3));
                }
              }
            }

            // Format: LOAD:340.2,TENSION:1.55,TANGLE:LOW,STRESS:35
            if (clean.includes(':') || clean.includes(',')) {
              clean.split(',').forEach((part) => {
                const [kRaw, vRaw] = part.split(':');
                if (!kRaw || !vRaw) return;
                const k = kRaw.trim().toUpperCase();
                const v = vRaw.trim();

                if (k === 'LOAD' || k === 'WEIGHT') {
                  const num = parseFloat(v);
                  if (!isNaN(num)) {
                    if (v.toLowerCase().includes('g') && !v.toLowerCase().includes('kg')) {
                      parsedLoadG = Math.round(num);
                      parsedLoadKg = parseFloat((num / 1000).toFixed(3));
                    } else if (num > 50 && !v.toLowerCase().includes('kg')) {
                      parsedLoadG = Math.round(num);
                      parsedLoadKg = parseFloat((num / 1000).toFixed(3));
                    } else {
                      parsedLoadKg = num;
                      parsedLoadG = Math.round(num * 1000);
                    }
                  }
                }
                if (k === 'TENSION') parsedTension = parseFloat(v);
                if (k === 'TANGLE') {
                  const vUpper = v.toUpperCase();
                  if (vUpper.includes('HIGH')) parsedTangle = 'HIGH';
                  else if (vUpper.includes('MOD')) parsedTangle = 'MODERATE';
                  else if (vUpper.includes('LOW')) parsedTangle = 'LOW';
                }
                if (k === 'STRESS') parsedStress = parseInt(v, 10);
              });
            }

            // 3. Auto-Stop on Tangle & Load trigger
            const currentLoadG = parsedLoadG !== null ? parsedLoadG : (telemetry.loadG || 0);
            const isHighTangle = parsedTangle === 'HIGH';

            if (isHighTangle && currentLoadG > 50 && autoStopOnTangle && !isStoppedRef.current) {
              isStoppedRef.current = true;
              setIsStopped(true);
              playAlarmTone();

              setLogs((prev) => [
                ...prev.slice(-150),
                `[ALARM] ⚠️ MEASUREMENT AUTO-STOPPED: Net tangle detected under active load (${currentLoadG} g)!`,
                `[SAFETY] Winch safety lock engaged. Click 'Resume Measurement' to reset.`,
              ]);

              // Transmit emergency stop to MCU
              sendSerialCmd('STOP');

              onShowToast(
                'Safety Stop Engaged',
                `Net tangle detected with active load (${currentLoadG} g)! Measurement halted.`,
                'error'
              );

              setTelemetry((prev) => ({
                ...prev,
                loadKg: parsedLoadKg !== null ? parsedLoadKg : prev.loadKg,
                loadG: currentLoadG,
                tangleRisk: 'HIGH',
                isHalted: true,
                rawLine: clean,
              }));
              continue;
            }

            // If system is stopped by safety lock, hold previous values and skip updating
            if (isStoppedRef.current) {
              continue;
            }

            // Update telemetry state
            setTelemetry((prev) => {
              const updatedKg = parsedLoadKg !== null ? parsedLoadKg : prev.loadKg;
              const updatedG = parsedLoadG !== null ? parsedLoadG : (prev.loadG || Math.round(updatedKg * 1000));
              const updatedTension =
                parsedTension !== null
                  ? parsedTension
                  : parseFloat(((updatedKg * 9.81) / 1000).toFixed(2));
              const updatedStress =
                parsedStress !== null
                  ? parsedStress
                  : Math.min(100, Math.round((updatedKg / 500) * 100));
              const updatedTangle = parsedTangle !== null ? parsedTangle : prev.tangleRisk;

              return {
                loadKg: updatedKg,
                loadG: updatedG,
                tensionKn: updatedTension,
                tangleRisk: updatedTangle,
                stressPercent: updatedStress,
                isHalted: false,
                rawLine: clean,
              };
            });
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
    setIsStopped(false);
    isStoppedRef.current = false;
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

  // Arduino firmware C++ sketch
  const arduinoSketchCode = `// ========================================================
// Marine AI – Smart Net Load Cell & Tension Tangle Monitor
// Hardware: Arduino Uno / Nano / ESP32 + HX711 Load Cell
// Output Format: Grams (g) + Tangle Safety Diagnostics
// Baud Rate: 9600
// ========================================================

#include <Arduino.h>
#include "HX711.h"

#define LOADCELL_DOUT_PIN   2   // HX711 DOUT Pin
#define LOADCELL_SCK_PIN    3   // HX711 SCK Pin
#define TANGLE_ANALOG_PIN   A0  // Optional strain gauge / flex wire

HX711 scale;

// Calibration factor calibrated for GRAMS (g):
// Example: If 100g test weight reads raw count 228, factor is 2.28
float calibrationFactor = 2.28;

// Safety settings
const float TANGLE_THRESHOLD_GRAMS = 500.0; // Trigger tangle if load exceeds 500g
bool isMeasurementActive = true;

void setup() {
  Serial.begin(9600);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(calibrationFactor);
  scale.tare(); // Zero the scale at boot

  Serial.println("[SYS] Smart Net Load Cell MCU Online (Grams mode).");
  Serial.println("[SYS] Supported Commands: STOP, RESUME, TARE");
}

void loop() {
  // 1. Listen for commands from Marine AI Web Serial Console
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    if (cmd.equalsIgnoreCase("STOP")) {
      isMeasurementActive = false;
      Serial.println("[SYS] MEASUREMENT STOPPED BY OPERATOR");
    } else if (cmd.equalsIgnoreCase("RESUME")) {
      isMeasurementActive = true;
      Serial.println("[SYS] MEASUREMENT RESUMED");
    } else if (cmd.equalsIgnoreCase("TARE")) {
      scale.tare();
      Serial.println("[SYS] SCALE ZEROED (TARE OK)");
    }
  }

  // If paused/stopped by safety stop, wait and do not spam
  if (!isMeasurementActive) {
    delay(500);
    return;
  }

  // 2. Non-blocking HX711 check to ensure wires never hang the loop
  if (scale.is_ready()) {
    float weightG = scale.get_units(5); // Direct weight in GRAMS (g)
    if (weightG < 0) weightG = 0;

    int strainAdc = analogRead(TANGLE_ANALOG_PIN);
    bool isTangled = (weightG >= TANGLE_THRESHOLD_GRAMS) || (strainAdc > 750);

    if (isTangled) {
      Serial.println("TANGLE DETECTED");
      Serial.print("Weight: ");
      Serial.print(weightG, 1);
      Serial.println(" g");
    } else {
      Serial.println("SAFE");
      Serial.print("Weight: ");
      Serial.print(weightG, 1);
      Serial.println(" g");
    }
  } else {
    // Sensor settling or DOUT pulse check
    Serial.println("SYS: HX711 reading in progress...");
  }

  delay(1000);
}`;

  const copyFirmwareCode = () => {
    navigator.clipboard.writeText(arduinoSketchCode);
    onShowToast('Firmware Copied', 'Arduino C++ sketch copied to clipboard.', 'success');
  };

  const downloadFirmwareIno = () => {
    const blob = new Blob([arduinoSketchCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SmartNet_Tangle_Monitor.ino';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('File Downloaded', 'SmartNet_Tangle_Monitor.ino saved.', 'success');
  };

  const currentDisplayLoad =
    displayUnit === 'g'
      ? `${(telemetry.loadG || Math.round(telemetry.loadKg * 1000))} g`
      : `${telemetry.loadKg.toFixed(2)} kg`;

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Title & Connection Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
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
              {isStopped && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-red-400" />
                  MEASUREMENT HALTED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Live strain gauge telemetry, tangle risk diagnostics, and winch safety control streamed via Web Serial API.
            </p>
          </div>
        </div>

        {/* Global Action & Safety Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Unit Toggle: Grams vs Kilograms */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDisplayUnit('g')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                displayUnit === 'g'
                  ? 'bg-teal-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Display values in grams"
            >
              Grams (g)
            </button>
            <button
              onClick={() => setDisplayUnit('kg')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                displayUnit === 'kg'
                  ? 'bg-teal-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Display values in kilograms"
            >
              Kilograms (kg)
            </button>
          </div>

          {/* Auto-Stop on Tangle Toggle */}
          <label
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer select-none hover:border-slate-700"
            title="Automatically halt measurement when tangle & active load are detected"
          >
            <input
              type="checkbox"
              checked={autoStopOnTangle}
              onChange={(e) => setAutoStopOnTangle(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0 cursor-pointer"
            />
            <span className="font-semibold text-[11px]">Auto-Stop on Tangle</span>
          </label>

          {/* Audio Alarm Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-slate-950 border-slate-800 text-teal-400 hover:bg-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Mute Buzzer Alarm' : 'Enable Buzzer Alarm'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Baud Rate Selector */}
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

          {/* Connect / Disconnect */}
          {isConnected ? (
            <button
              onClick={handleDisconnectSerial}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Square className="w-3.5 h-3.5" />
              Disconnect MCU
            </button>
          ) : (
            <button
              onClick={handleConnectSerial}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Play className="w-3.5 h-3.5" />
              Connect USB / COM
            </button>
          )}

          {/* Manual Emergency Stop or Resume Button */}
          {isStopped ? (
            <button
              onClick={handleResumeMeasurement}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-900/50 animate-bounce"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resume Measurement
            </button>
          ) : (
            <button
              onClick={handleManualStopMeasurement}
              className="px-3 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Pause measurement & lock winch"
            >
              <Pause className="w-3.5 h-3.5" />
              Halt Measurement
            </button>
          )}
        </div>
      </div>

      {/* Emergency Stop Warning Banner */}
      {isStopped && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-red-900/40 to-slate-900 border-2 border-red-500/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/60 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  ⚠️ SAFETY INTERLOCK: MEASUREMENT AUTOMATICALLY HALTED
                </span>
                <span className="text-[10px] bg-red-500 text-black px-2 py-0.5 rounded font-black tracking-widest uppercase">
                  TANGLE & ACTIVE LOAD DETECTED
                </span>
              </div>
              <p className="text-xs text-red-200/90 mt-1">
                Net snag strain exceeded safe threshold under active load (Held reading:{' '}
                <strong>{currentDisplayLoad}</strong>). Winch motor locked to prevent net tearing.
              </p>
            </div>
          </div>
          <button
            onClick={handleResumeMeasurement}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Clear Safety Halt & Resume
          </button>
        </div>
      )}

      {/* 4 Sensor Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Metric 1: Net Load Weight (Grams or Kg) */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Net Biomass Load</span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase">
              {displayUnit === 'g' ? 'HX711 (GRAMS)' : 'HX711 (KG)'}
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
              <span>{currentDisplayLoad}</span>
              {displayUnit === 'g' && (
                <span className="text-xs text-slate-400 font-normal">
                  ({telemetry.loadKg.toFixed(2)} kg)
                </span>
              )}
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    displayUnit === 'g'
                      ? ((telemetry.loadG || telemetry.loadKg * 1000) / 1000) * 100
                      : (telemetry.loadKg / 800) * 100
                  )}%`,
                }}
                className={`h-full rounded-full transition-all duration-300 ${
                  isStopped
                    ? 'bg-red-500'
                    : telemetry.tangleRisk === 'HIGH'
                    ? 'bg-amber-500'
                    : 'bg-cyan-500'
                }`}
              ></div>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-2">
            {displayUnit === 'g' ? 'Bench Rated Limit: 1,000 g' : 'Marine Capacity: 800.0 kg'}
          </span>
        </div>

        {/* Metric 2: Net Tension Strain Gauge */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Tension Force</span>
            <span className="text-[10px] text-teal-400 font-bold">STRAIN SENSOR</span>
          </div>
          <div>
            <div className="text-2xl font-black text-teal-300 font-mono">
              {telemetry.tensionKn.toFixed(2)} kN
            </div>
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
            <span className="text-[10px] text-emerald-400 font-bold">AI DETECTOR</span>
          </div>
          <div>
            <div
              className={`text-xl font-black uppercase mt-1 flex items-center gap-1.5 ${
                telemetry.tangleRisk === 'HIGH'
                  ? 'text-red-400 animate-pulse'
                  : telemetry.tangleRisk === 'MODERATE'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {telemetry.tangleRisk === 'HIGH' ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
              {telemetry.tangleRisk} RISK
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {telemetry.tangleRisk === 'HIGH'
                ? 'Underwater snag detected! Tangle alert active.'
                : telemetry.tangleRisk === 'MODERATE'
                ? 'Minor net distortion. Keep winch speed steady.'
                : 'Net opening geometry normal. Zero reef snags.'}
            </p>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            Status: {isStopped ? 'SAFETY STOPPED' : 'MONITORING ACTIVE'}
          </div>
        </div>

        {/* Metric 4: Winch Stress % */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Winch Motor Stress</span>
            <span className="text-[10px] text-cyan-400 font-bold">TELEMETRY</span>
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
          <span className="text-[10px] text-slate-400 mt-2">
            Motor Status: {isStopped ? 'LOCKED (SAFETY STOP)' : 'NOMINAL (42°C)'}
          </span>
        </div>
      </div>

      {/* Terminal vs Firmware Code Tabs */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
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
              Arduino C++ Firmware Sketch (Grams)
            </button>
          </div>

          {activeTab === 'monitor' && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Convert kg to g toggle */}
              <label
                className="text-[11px] text-slate-400 flex items-center gap-1.5 cursor-pointer select-none"
                title="Automatically convert any incoming kg measurements to grams in terminal"
              >
                <input
                  type="checkbox"
                  checked={convertKgToGInMonitor}
                  onChange={(e) => setConvertKgToGInMonitor(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-teal-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <ArrowRightLeft className="w-3 h-3 text-teal-400" />
                  Convert kg → g in Monitor
                </span>
              </label>

              <label className="text-[11px] text-slate-400 flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-teal-500 cursor-pointer"
                />
                Auto-scroll
              </label>

              <button
                onClick={copyLogs}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title="Copy Terminal Logs"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={clearLogs}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title="Clear Terminal Buffer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeTab === 'firmware' && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyFirmwareCode}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Code
              </button>
              <button
                onClick={downloadFirmwareIno}
                className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <Download className="w-3.5 h-3.5" />
                Download .ino Sketch
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Terminal Console */}
        {activeTab === 'monitor' ? (
          <div className="flex flex-col gap-2">
            <div
              ref={terminalRef}
              className="h-64 overflow-y-auto p-4 rounded-xl bg-black font-mono text-[11px] leading-relaxed border border-slate-950 flex flex-col gap-1 select-text"
            >
              {logs.map((log, index) => {
                const isTx = log.startsWith('[TX]');
                const isErr = log.includes('ERR') || log.includes('ALARM') || log.includes('TANGLE DETECTED');
                const isSys = log.startsWith('[SYS]') || log.startsWith('[PORT]') || log.startsWith('[SAFETY]');
                return (
                  <div
                    key={index}
                    className={`hover:bg-slate-900/40 px-1 rounded ${
                      isTx
                        ? 'text-cyan-400 font-bold'
                        : isErr
                        ? 'text-red-400 font-bold animate-pulse'
                        : isSys
                        ? 'text-amber-300'
                        : 'text-emerald-400'
                    }`}
                  >
                    {log}
                  </div>
                );
              })}
            </div>

            {/* Quick MCU Command Action Bar */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                MCU Commands:
              </span>
              <button
                onClick={() => sendSerialCmd('TARE')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold transition-all border border-slate-700"
              >
                Zero / Tare Scale
              </button>
              <button
                onClick={handleManualStopMeasurement}
                className="px-2.5 py-1 rounded-lg bg-red-900/40 hover:bg-red-800/60 text-xs text-red-300 font-semibold transition-all border border-red-700/50"
              >
                Emergency Stop
              </button>
              <button
                onClick={handleResumeMeasurement}
                className="px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-xs text-emerald-300 font-semibold transition-all border border-emerald-700/50"
              >
                Resume Loop
              </button>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customCmd.trim()) {
                    sendSerialCmd(customCmd.trim());
                    setCustomCmd('');
                  }
                }}
                className="flex items-center gap-1.5 ml-auto flex-1 min-w-[200px]"
              >
                <input
                  type="text"
                  placeholder="Send raw command (e.g. TARE, STOP, RESUME)..."
                  value={customCmd}
                  onChange={(e) => setCustomCmd(e.target.value)}
                  className="flex-1 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-teal-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Send className="w-3 h-3" />
                  Send
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Tab 2: Arduino/ESP32 C++ Code in Grams */
          <div className="relative p-4 rounded-xl bg-black font-mono text-[11px] leading-relaxed text-cyan-300 border border-slate-950 overflow-x-auto select-text">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Updated C++ Firmware – Outputs Directly in Grams (g) + Tangle Safety Stop
              </span>
              <span>Target: Arduino Uno / Nano / ESP32 (Baud: 9600)</span>
            </div>
            <pre>{arduinoSketchCode}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
