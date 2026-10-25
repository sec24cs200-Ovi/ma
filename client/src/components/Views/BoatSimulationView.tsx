import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import {
  Compass,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  PhoneCall,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Activity,
  History,
  Check,
  ChevronRight,
  Clock,
} from 'lucide-react';
import {
  OFFICIAL_IMBL_POINTS,
  IMBL_LEAFLET_COORDS,
  REGISTERED_SAFETY_STATIONS,
  SIMULATION_ROUTES,
  calculateBoatTelemetry,
  computeEarlySafetyBoundaryLine,
  marineSound,
  SimulationRoute,
} from '../../utils/geospatial';
import { triggerEmergencyCall } from '../../utils/callHelper';
import { BorderBreachCallModal } from '../Modals/BorderBreachCallModal';
import {
  BoatTelemetry,
  GeofenceSettings,
  SimulationAlert,
  SimulationRiskStatus,
} from '../../types';

interface BoatSimulationViewProps {
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'error') => void;
  onExitSimulation?: () => void;
  isEmbedded?: boolean;
}

export const BoatSimulationView: React.FC<BoatSimulationViewProps> = ({
  onShowToast,
  onExitSimulation,
  isEmbedded = false,
}) => {
  // Map References
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const boatMarkerRef = useRef<L.Marker | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const stationLineRef = useRef<L.Polyline | null>(null);

  // Geofence Settings
  const [settings, setSettings] = useState<GeofenceSettings>({
    warningDistanceKm: 5.0,
    criticalDistanceKm: 1.5,
    gpsAccuracyMarginMeters: 200,
  });

  // Boat State
  // Initial boat position: Rameswaram Fishing Fairway (Open waters)
  const [boatPosition, setBoatPosition] = useState<[number, number]>([9.2850, 79.3250]);
  const [boatSpeedKnots, setBoatSpeedKnots] = useState<number>(10);
  const [boatHeading, setBoatHeading] = useState<number>(115); // ESE

  // Simulation Controls State
  const [simulationState, setSimulationState] = useState<'STOPPED' | 'RUNNING' | 'PAUSED'>('STOPPED');
  const [selectedRoute, setSelectedRoute] = useState<SimulationRoute>(SIMULATION_ROUTES[1]);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number>(0);
  const animationTimerRef = useRef<number | null>(null);

  // Sound Mute State
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Live Telemetry
  const [telemetry, setTelemetry] = useState<BoatTelemetry>(() =>
    calculateBoatTelemetry(boatPosition[0], boatPosition[1], boatSpeedKnots, boatHeading, settings)
  );

  // Previous Risk Status (for transition de-duplication)
  const lastRiskStatusRef = useRef<SimulationRiskStatus>('SAFE');

  // Alert History & Emergency
  const [alerts, setAlerts] = useState<SimulationAlert[]>([]);
  const [selectedTab, setSelectedTab] = useState<'map' | 'settings' | 'officer' | 'alerts'>('map');
  const [isBorderCallModalOpen, setIsBorderCallModalOpen] = useState<boolean>(false);
  const hasAutoTriggeredCallRef = useRef<boolean>(false);
  const emergencyNumber = '8122566828';
  const [selectedAlertForAck, setSelectedAlertForAck] = useState<SimulationAlert | null>(null);
  const [ackOfficerName, setAckOfficerName] = useState<string>('Inspector S. Vignesh (Duty Officer)');
  const [ackResponseAction, setAckResponseAction] = useState<string>('Course correction advisory issued via VHF Ch 16');
  const [ackNotes, setAckNotes] = useState<string>('');

  // Map Layer Toggles
  const [activeLayers, setActiveLayers] = useState({
    imbl: true,
    safetyBoundary: true,
    geofenceZones: true,
    stations: true,
    route: true,
  });

  // Toggle layer helper
  const toggleLayer = (key: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Sound Mute Toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    marineSound.setMuted(nextMuted);
    onShowToast(
      nextMuted ? 'Sound Alerts Muted' : 'Sound Alerts Unmuted',
      nextMuted ? 'Audio warning beeps disabled.' : 'Audio sirens and warning chimes active.',
      'info'
    );
  };

  // Fetch initial alerts from backend
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/simulation/alerts');
      const data = await res.json();
      if (data.success && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      }
    } catch {
      // Fallback to local state if backend route unreachable
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Log alert event to backend API and local state
  const logAlertToBackend = useCallback(
    async (
      telem: BoatTelemetry,
      riskStatus: SimulationRiskStatus | 'SAFE_RECOVERY',
      note: string
    ) => {
      const alertPayload = {
        vesselId: 'IND-TN-10-MM-4421',
        captain: 'K. Rameshan',
        lat: telem.lat,
        lng: telem.lng,
        distanceToImblKm: telem.distanceToImblKm,
        distanceToImblNM: telem.distanceToImblNM,
        riskStatus,
        heading: telem.headingCompass,
        speedKnots: telem.speedKnots,
        note,
      };

      try {
        const res = await fetch('/api/simulation/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertPayload),
        });
        const data = await res.json();
        if (data.success && data.alert) {
          setAlerts((prev) => [data.alert, ...prev]);
        }
      } catch {
        // Local fallback
        const localAlert: SimulationAlert = {
          id: `SIM-LOCAL-${Date.now()}`,
          timestamp: new Date().toISOString(),
          displayTime: new Date().toLocaleTimeString(),
          vesselId: 'IND-TN-10-MM-4421',
          captain: 'K. Rameshan',
          lat: telem.lat,
          lng: telem.lng,
          coords: telem.coords,
          distanceToImblKm: telem.distanceToImblKm,
          distanceToImblNM: telem.distanceToImblNM,
          riskStatus,
          heading: telem.headingCompass,
          speedKnots: telem.speedKnots,
          note,
          acknowledged: false,
          isMockSimulation: true,
        };
        setAlerts((prev) => [localAlert, ...prev]);
      }
    },
    []
  );

  // Recalculate telemetry whenever boat position, heading, speed, or settings change
  useEffect(() => {
    const nextTelem = calculateBoatTelemetry(
      boatPosition[0],
      boatPosition[1],
      boatSpeedKnots,
      boatHeading,
      settings
    );
    setTelemetry(nextTelem);

    // Check for zone transitions to trigger automatic alerts with de-duplication
    const prevStatus = lastRiskStatusRef.current;
    const currentStatus = nextTelem.riskStatus;

    if (prevStatus !== currentStatus) {
      lastRiskStatusRef.current = currentStatus;

      if (currentStatus === 'EARLY_WARNING') {
        if (!isMuted) marineSound.playWarningChime();
        onShowToast(
          '⚠️ Early Safety Boundary Crossed',
          `Vessel entered warning zone (${nextTelem.distanceToImblNM} NM from IMBL). Steer West (270°) to return to safety.`,
          'info'
        );
        logAlertToBackend(nextTelem, 'EARLY_WARNING', 'Vessel entered early safety buffer zone.');
      } else if (currentStatus === 'CRITICAL_PROXIMITY') {
        if (!isMuted) marineSound.playCriticalSiren();
        onShowToast(
          '🚨 CRITICAL IMBL PROXIMITY ALERT',
          `Danger of crossing border! Proximity: ${nextTelem.distanceToImblNM} NM. Emergency Safety Contacts notified.`,
          'error'
        );
        logAlertToBackend(nextTelem, 'CRITICAL_PROXIMITY', 'Immediate border breach danger (< 1.5 km).');
      } else if (currentStatus === 'CRITICAL_BREACH' || nextTelem.isCrossedIMBL) {
        if (!isMuted) marineSound.playCriticalSiren();
        onShowToast(
          '🚨 BORDER BREACHED: CROSSED IMBL',
          `Vessel crossed into Sri Lankan waters! Auto-triggering Emergency Call to ${emergencyNumber}...`,
          'error'
        );
        logAlertToBackend(
          nextTelem,
          'CRITICAL_BREACH',
          'Vessel crossed the International Maritime Boundary Line. Emergency call automatically triggered.'
        );

        // Automatically trigger emergency call when the boat crosses the boundary
        if (!hasAutoTriggeredCallRef.current) {
          hasAutoTriggeredCallRef.current = true;
          setIsBorderCallModalOpen(true);
          triggerEmergencyCall(emergencyNumber, 'Auto IMBL Border Crossing');
          fetch('/api/emergency/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: emergencyNumber,
              coords: nextTelem.coords,
              network: 'NavIC Autonomous Border Incursion Dispatch',
            }),
          }).catch(() => {});
        }
      } else if (
        currentStatus === 'SAFE' &&
        (prevStatus === 'EARLY_WARNING' ||
          prevStatus === 'CRITICAL_PROXIMITY' ||
          prevStatus === 'CRITICAL_BREACH')
      ) {
        hasAutoTriggeredCallRef.current = false;
        if (!isMuted) marineSound.playRecoveryChime();
        onShowToast(
          '✅ Safe Recovery Recorded',
          'Vessel has safely returned to designated national waters. Risk de-escalated.',
          'success'
        );
        logAlertToBackend(nextTelem, 'SAFE_RECOVERY', 'Course corrected. Vessel safely back inside Indian waters.');
      }
    }

    // Direct check: if crossed IMBL at any moment and not yet triggered for this incursion
    if (nextTelem.isCrossedIMBL && !hasAutoTriggeredCallRef.current) {
      hasAutoTriggeredCallRef.current = true;
      setIsBorderCallModalOpen(true);
      triggerEmergencyCall(emergencyNumber, 'Direct IMBL Incursion Detection');
    } else if (!nextTelem.isCrossedIMBL && nextTelem.riskStatus === 'SAFE') {
      hasAutoTriggeredCallRef.current = false;
    }
  }, [boatPosition, boatSpeedKnots, boatHeading, settings, isMuted, onShowToast, logAlertToBackend]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Rameswaram, Palk Strait, and Gulf of Mannar
    const map = L.map(mapContainerRef.current, {
      center: [9.2500, 79.4000],
      zoom: 10,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Base Marine Carto Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | Indo-Sri Lanka IMBL (UNCLOS 1974/76)',
      maxZoom: 18,
    }).addTo(map);

    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;

    // Allow user to click on the map to relocate the boat marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setBoatPosition([lat, lng]);
      onShowToast(
        'Boat Relocated',
        `Marker moved to ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E. Geofence recalculated.`,
        'info'
      );
    });

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      // Cleanup on unmount
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onShowToast]);

  // Update Map Layers (IMBL, Early Warning Line, Geofence Polygons, Boat Marker, Stations)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    layersGroup.clearLayers();

    // 1. Geofence Zones Visual Fills (Safe, Warning, Critical)
    if (activeLayers.geofenceZones) {
      const warningLineCoords = computeEarlySafetyBoundaryLine(settings.warningDistanceKm);

      // Warning Zone Corridor (between Early Safety Line and IMBL)
      const warningPolygonCoords = [
        ...warningLineCoords,
        ...[...IMBL_LEAFLET_COORDS].reverse(),
      ];

      const warningZone = L.polygon(warningPolygonCoords, {
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.18,
        weight: 1.5,
        dashArray: '4, 4',
      }).bindTooltip('⚠️ Early Safety Warning Zone (Adjust Course Westward)', {
        sticky: true,
        className: 'custom-map-tooltip',
      });
      layersGroup.addLayer(warningZone);

      // Critical Proximity Zone (Immediate 1.5 km strip along IMBL)
      const criticalLineCoords = computeEarlySafetyBoundaryLine(settings.criticalDistanceKm);
      const criticalPolygonCoords = [
        ...criticalLineCoords,
        ...[...IMBL_LEAFLET_COORDS].reverse(),
      ];

      const criticalZone = L.polygon(criticalPolygonCoords, {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.28,
        weight: 1.5,
      }).bindTooltip('🚨 Critical IMBL Proximity Zone (High Border Breach Risk)', {
        sticky: true,
        className: 'custom-map-tooltip',
      });
      layersGroup.addLayer(criticalZone);
    }

    // 2. Early Safety Warning Boundary Line
    if (activeLayers.safetyBoundary) {
      const warningLineCoords = computeEarlySafetyBoundaryLine(settings.warningDistanceKm);

      const safetyLine = L.polyline(warningLineCoords, {
        color: '#f59e0b',
        weight: 2.5,
        dashArray: '6, 6',
        opacity: 0.9,
      }).bindPopup(`
        <div style="font-family:sans-serif; padding:4px;">
          <strong style="color:#f59e0b;">🛡️ Early Safety Warning Boundary Line</strong>
          <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">
            Buffer Distance: <strong>${settings.warningDistanceKm} km</strong> from IMBL
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:3px;">
            Vessels crossing this line receive early automated warnings before approaching the international border.
          </div>
        </div>
      `);
      layersGroup.addLayer(safetyLine);
    }

    // 3. Officially Sourced IMBL Boundary Line
    if (activeLayers.imbl) {
      const imblLine = L.polyline(IMBL_LEAFLET_COORDS, {
        color: '#ef4444',
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.95,
      }).bindPopup(`
        <div style="font-family:sans-serif; padding:4px;">
          <strong style="color:#ef4444;">🚨 International Maritime Boundary Line (IMBL)</strong>
          <div style="font-size:11px; color:#f87171; margin-top:3px;">
            Indo-Sri Lanka Maritime Treaty (1974 & 1976)
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">
            Crossing is strictly prohibited by international law.
          </div>
        </div>
      `);
      layersGroup.addLayer(imblLine);

      // Official Treaty Position Markers
      OFFICIAL_IMBL_POINTS.forEach((pt) => {
        const treatyIcon = L.divIcon({
          className: 'custom-treaty-marker',
          html: `
            <div style="background:#ef4444; color:#fff; font-size:9px; font-weight:bold; border-radius:4px; padding:1px 4px; border:1px solid #ffffff; box-shadow:0 0 6px rgba(239,68,68,0.8); white-space:nowrap; text-align:center;">
              ${pt.id}
            </div>
          `,
          iconSize: [36, 16],
          iconAnchor: [18, 8],
        });

        const marker = L.marker([pt.lat, pt.lng], { icon: treatyIcon }).bindPopup(`
          <div style="font-family:sans-serif; padding:4px;">
            <strong style="color:#ef4444; font-size:12px;">${pt.name}</strong>
            <div style="font-size:11px; color:#e2e8f0; margin-top:2px;">${pt.desc}</div>
            <div style="font-size:10px; color:#94a3b8; margin-top:2px;">
              Lat: ${pt.lat.toFixed(4)}° N, Lng: ${pt.lng.toFixed(4)}° E
            </div>
          </div>
        `);
        layersGroup.addLayer(marker);
      });
    }

    // 4. Simulated Route Path (if selected)
    if (activeLayers.route && selectedRoute) {
      const routePolyline = L.polyline(selectedRoute.waypoints, {
        color: '#06b6d4',
        weight: 3,
        dashArray: '4, 4',
        opacity: 0.7,
      }).bindTooltip(`Simulation Route: ${selectedRoute.name}`, { sticky: true });
      layersGroup.addLayer(routePolyline);

      // Add small dots for route waypoints
      selectedRoute.waypoints.forEach((wp, idx) => {
        const dot = L.circleMarker(wp, {
          radius: 4,
          color: '#06b6d4',
          fillColor: '#0891b2',
          fillOpacity: 0.9,
          weight: 1,
        }).bindTooltip(`WP ${idx + 1}: ${wp[0].toFixed(3)}°N, ${wp[1].toFixed(3)}°E`);
        layersGroup.addLayer(dot);
      });
    }

    // 5. Registered Safety Officer Stations
    if (activeLayers.stations) {
      REGISTERED_SAFETY_STATIONS.forEach((station) => {
        const stationIcon = L.divIcon({
          className: 'custom-station-icon',
          html: `
            <div style="display:flex; align-items:center; justify-content:center; width:28px; height:28px; background:#0f172a; border:2px solid #38bdf8; border-radius:8px; box-shadow:0 0 10px rgba(56,189,248,0.5);">
              <span style="font-size:14px;">📡</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([station.lat, station.lng], { icon: stationIcon }).bindPopup(`
          <div style="font-family:sans-serif; padding:4px;">
            <strong style="color:#38bdf8; font-size:12px;">${station.name}</strong>
            <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">Officer: ${station.officer}</div>
            <div style="font-size:11px; color:#10b981; margin-top:2px;">Phone: <strong>${station.displayPhone}</strong></div>
            <div style="font-size:10px; color:#94a3b8; margin-top:2px;">Comm Channel: ${station.channel}</div>
            <a href="tel:${station.phone}" style="display:inline-block; margin-top:6px; background:#0284c7; color:#fff; font-size:11px; font-weight:bold; padding:3px 8px; border-radius:4px; text-decoration:none;">
              📞 Call Station (${station.phone})
            </a>
          </div>
        `);
        layersGroup.addLayer(marker);
      });
    }

    // 6. Movable Boat Marker
    const statusColor =
      telemetry.riskStatus === 'SAFE'
        ? '#10b981'
        : telemetry.riskStatus === 'EARLY_WARNING'
        ? '#f59e0b'
        : '#ef4444';

    const boatIcon = L.divIcon({
      className: 'custom-sim-boat-marker',
      html: `
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
          <!-- Sonar pulse ring -->
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; border:2px solid ${statusColor}; animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite; opacity:0.8;"></div>
          
          <!-- Boat container with rotation -->
          <div style="width:36px; height:36px; border-radius:50%; background:#0f172a; border:2.5px solid ${statusColor}; box-shadow:0 0 16px ${statusColor}; display:flex; align-items:center; justify-content:center; transform:rotate(${boatHeading}deg); transition:transform 0.3s ease;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L19 21L12 17L5 21L12 2Z" fill="${statusColor}33" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const boatMarker = L.marker(boatPosition, {
      icon: boatIcon,
      draggable: true,
    });

    boatMarker.on('dragend', (e) => {
      const newPos = (e.target as L.Marker).getLatLng();
      setBoatPosition([newPos.lat, newPos.lng]);
      onShowToast(
        'Vessel Moved',
        `New position: ${newPos.lat.toFixed(4)}° N, ${newPos.lng.toFixed(4)}° E`,
        'info'
      );
    });

    boatMarker.bindPopup(`
      <div style="font-family:sans-serif; padding:4px;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
          <strong style="color:#38bdf8; font-size:13px;">Vessel IND-TN-10-MM-4421</strong>
          <span style="background:${statusColor}25; color:${statusColor}; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px;">
            ${telemetry.riskStatus}
          </span>
        </div>
        <div style="font-size:11px; color:#cbd5e1; margin-top:3px;">Captain: K. Rameshan | Speed: ${boatSpeedKnots} kn</div>
        <div style="font-size:11px; color:#cbd5e1; margin-top:1px;">Heading: <strong>${telemetry.headingCompass}</strong></div>
        <div style="font-size:11px; color:#f87171; margin-top:2px;">Distance to IMBL: <strong>${telemetry.distanceToImblNM} NM (${telemetry.distanceToImblKm} km)</strong></div>
        <div style="font-size:10px; color:#94a3b8; font-family:monospace; margin-top:4px;">
          ${telemetry.coords}
        </div>
        <div style="margin-top:6px; font-size:10px; color:#10b981;">
          💡 Tip: Click and drag this marker anywhere to simulate real-time movement!
        </div>
      </div>
    `);

    layersGroup.addLayer(boatMarker);
    boatMarkerRef.current = boatMarker;

    // 7. Dynamic Proximity Line to Nearest Safety Station
    if (telemetry.closestStation && activeLayers.stations) {
      const station = telemetry.closestStation;
      const line = L.polyline([boatPosition, [station.lat, station.lng]], {
        color: '#38bdf8',
        weight: 1.5,
        dashArray: '3, 5',
        opacity: 0.65,
      }).bindTooltip(
        `Nearest Station: ${station.name} (${station.distanceNM} NM)`,
        { sticky: true }
      );
      layersGroup.addLayer(line);
      stationLineRef.current = line;
    }
  }, [
    boatPosition,
    boatHeading,
    boatSpeedKnots,
    telemetry,
    activeLayers,
    settings,
    selectedRoute,
    onShowToast,
  ]);

  // Simulation Animation Engine
  useEffect(() => {
    if (simulationState !== 'RUNNING') {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
      return;
    }

    const intervalMs = Math.max(250, 1500 - boatSpeedKnots * 40);

    animationTimerRef.current = window.setInterval(() => {
      setCurrentWaypointIndex((prevIndex) => {
        const waypoints = selectedRoute.waypoints;
        const nextIndex = prevIndex + 1;

        if (nextIndex >= waypoints.length) {
          // Route completed
          setSimulationState('STOPPED');
          onShowToast(
            'Simulation Route Completed',
            `Finished simulated route: ${selectedRoute.name}`,
            'success'
          );
          return 0;
        }

        const currentPt = waypoints[prevIndex];
        const nextPt = waypoints[nextIndex];

        // Calculate heading between waypoints
        const dLng = nextPt[1] - currentPt[1];
        const dLat = nextPt[0] - currentPt[0];
        const rad = Math.atan2(dLng, dLat);
        const deg = ((rad * 180) / Math.PI + 360) % 360;

        setBoatHeading(Math.round(deg));
        setBoatPosition(nextPt);

        return nextIndex;
      });
    }, intervalMs);

    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [simulationState, selectedRoute, boatSpeedKnots, onShowToast]);

  // Simulation Control Handlers
  const handleStartSimulation = () => {
    if (selectedRoute.waypoints.length === 0) return;
    setSimulationState('RUNNING');
    setCurrentWaypointIndex(0);
    setBoatPosition(selectedRoute.waypoints[0]);
    onShowToast(
      'Simulation Started',
      `Executing route: ${selectedRoute.name} @ ${boatSpeedKnots} knots`,
      'info'
    );
  };

  const handlePauseSimulation = () => {
    setSimulationState('PAUSED');
    onShowToast('Simulation Paused', 'Boat trajectory paused.', 'info');
  };

  const handleResumeSimulation = () => {
    setSimulationState('RUNNING');
    onShowToast('Simulation Resumed', 'Boat movement resumed.', 'info');
  };

  const handleResetSimulation = () => {
    setSimulationState('STOPPED');
    setCurrentWaypointIndex(0);
    // Reset boat back to Rameswaram Harbor waters
    const initialCoords: [number, number] = [9.2850, 79.3250];
    setBoatPosition(initialCoords);
    setBoatHeading(115);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(initialCoords, 10, { animate: true });
    }
    onShowToast(
      'Simulation Reset',
      'Boat returned to Rameswaram Jetty safe coordinates.',
      'info'
    );
  };

  // Safety Officer Alert Acknowledgement Handler
  const handleAcknowledgeAlert = async () => {
    if (!selectedAlertForAck) return;

    try {
      const res = await fetch(`/api/simulation/alerts/${selectedAlertForAck.id}/ack`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerName: ackOfficerName,
          responseAction: ackResponseAction,
          notes: ackNotes,
        }),
      });
      const data = await res.json();
      if (data.success && data.alert) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === selectedAlertForAck.id ? data.alert : a))
        );
        onShowToast(
          'Alert Acknowledged',
          `Response logged by ${ackOfficerName}: ${ackResponseAction}`,
          'success'
        );
      }
    } catch {
      // Local state fallback
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === selectedAlertForAck.id
            ? {
                ...a,
                acknowledged: true,
                acknowledgedBy: ackOfficerName,
                acknowledgedAt: new Date().toISOString(),
                responseAction: ackResponseAction,
                officerNotes: ackNotes,
              }
            : a
        )
      );
      onShowToast('Alert Acknowledged', 'Logged in local simulation session.', 'success');
    }

    setSelectedAlertForAck(null);
    setAckNotes('');
  };

  // Course correction helper to return boat back safely
  const handleSteerBackToSafety = () => {
    setBoatHeading(270);
    const safeCoord: [number, number] = [9.2850, 79.3250];
    setBoatPosition(safeCoord);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(safeCoord, 10, { animate: true });
    }
    setIsBorderCallModalOpen(false);
    onShowToast(
      'Course Corrected',
      'Vessel turned 180° back into Indian territorial fairway.',
      'success'
    );
  };

  // Emergency Call Handler
  const handleEmergencyCall = () => {
    setIsBorderCallModalOpen(true);
    triggerEmergencyCall(emergencyNumber, 'Manual Emergency Call Action');
  };

  // Clear / Reset Alert Logs
  const handleClearAlertHistory = async () => {
    try {
      await fetch('/api/simulation/reset', { method: 'POST' });
    } catch {
      // Ignore
    }
    setAlerts([]);
    onShowToast('Alert History Cleared', 'Audit trail has been reset.', 'info');
  };

  return (
    <div
      className={`flex flex-col gap-4 ${
        isEmbedded
          ? 'w-full p-1 sm:p-2'
          : 'p-3 md:p-5 max-w-[1600px] mx-auto min-h-[calc(100vh-75px)]'
      }`}
    >
      {/* Top Banner: SIMULATION MODE Watermark & Controls Header */}
      <div className="p-4 rounded-2xl bg-[#091424] border border-cyan-900/60 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/10">
            <Compass className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black text-white tracking-tight">
                Boat Movement Simulation & Maritime Geofencing
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                SIMULATION MODE ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Rameswaram, Palk Strait & Gulf of Mannar • Indo-Sri Lanka IMBL (UNCLOS 1974 & 1976 Treaties)
            </p>
          </div>
        </div>

        {/* View Switcher Tabs & Optional Exit Button */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0 overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setSelectedTab('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              selectedTab === 'map'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Simulation Map</span>
          </button>

          <button
            onClick={() => setSelectedTab('officer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              selectedTab === 'officer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Safety Officer Dashboard</span>
          </button>

          <button
            onClick={() => setSelectedTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              selectedTab === 'settings'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Geofence Parameters</span>
          </button>

          <button
            onClick={() => setSelectedTab('alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              selectedTab === 'alerts'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Alert Audit Log</span>
            {alerts.length > 0 && (
              <span className="text-[10px] bg-rose-500/30 text-rose-300 px-1.5 py-0.2 rounded-full font-mono">
                {alerts.length}
              </span>
            )}
          </button>

          {onExitSimulation && (
            <button
              onClick={onExitSimulation}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/30 transition-all shadow-sm ml-1"
              title="Return to Standard Live GIS Map"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Standard Map</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container: Map & Status HUD */}
      {selectedTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Left Column: Interactive Map (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {/* Map Container */}
            <div className="relative w-full h-[520px] lg:h-[600px] rounded-2xl overflow-hidden border border-cyan-950/80 shadow-2xl bg-[#060c17]">
              {/* Map Floating Header Badges */}
              <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-lg text-xs font-bold text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>Vessel IND-TN-10-MM-4421</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-cyan-300 font-mono">{telemetry.headingCompass}</span>
                </div>

                {/* Risk Alert Pill */}
                <div
                  className={`pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-lg text-xs font-bold transition-all ${
                    telemetry.riskStatus === 'SAFE'
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                      : telemetry.riskStatus === 'EARLY_WARNING'
                      ? 'bg-amber-950/90 text-amber-300 border-amber-500/50 animate-pulse'
                      : 'bg-rose-950/95 text-rose-200 border-rose-500/60 animate-bounce'
                  }`}
                >
                  {telemetry.riskStatus === 'SAFE' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {telemetry.riskStatus === 'EARLY_WARNING' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {telemetry.riskStatus === 'CRITICAL_PROXIMITY' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                  {telemetry.riskStatus === 'CRITICAL_BREACH' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                  <span>
                    {telemetry.riskStatus === 'SAFE' && 'SAFE ZONE — Within National Corridor'}
                    {telemetry.riskStatus === 'EARLY_WARNING' && 'WARNING: Early Safety Line Crossed!'}
                    {telemetry.riskStatus === 'CRITICAL_PROXIMITY' && 'CRITICAL: Dangerously Close to IMBL!'}
                    {telemetry.riskStatus === 'CRITICAL_BREACH' && 'IMBL BREACHED: Entered Sri Lankan Waters!'}
                  </span>
                </div>
              </div>

              {/* Map Floating Right Controls (Layers & Sound) */}
              <div className="absolute top-3 right-3 z-[1000] flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-lg">
                <button
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute siren' : 'Mute siren'}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                    isMuted
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                </button>

                <button
                  onClick={() => toggleLayer('imbl')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeLayers.imbl
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  IMBL Line
                </button>

                <button
                  onClick={() => toggleLayer('safetyBoundary')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeLayers.safetyBoundary
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Safety Line
                </button>

                <button
                  onClick={() => toggleLayer('geofenceZones')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeLayers.geofenceZones
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Zones Tint
                </button>

                <button
                  onClick={() => toggleLayer('stations')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeLayers.stations
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Stations
                </button>
              </div>

              {/* Map Leaflet Container */}
              <div ref={mapContainerRef} className="w-full h-full z-0" />

              {/* Bottom Interactive Legend */}
              <div className="absolute bottom-3 left-3 z-[1000] hidden md:flex items-center gap-4 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-lg text-[11px] text-slate-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400"></span>
                  <span>Safe Zone</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-0 border-t-2 border-dashed border-amber-400"></span>
                  <span>Safety Line ({settings.warningDistanceKm} km)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-0 border-t-2 border-dashed border-rose-500"></span>
                  <span>Treaty IMBL (UNCLOS)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-sky-400"></span>
                  <span>Safety Stations</span>
                </div>
              </div>
            </div>

            {/* Simulation Route & Trajectory Controls Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  Preset Drills:
                </span>
                <select
                  value={selectedRoute.id}
                  onChange={(e) => {
                    const r = SIMULATION_ROUTES.find((item) => item.id === e.target.value);
                    if (r) {
                      setSelectedRoute(r);
                      setBoatPosition(r.waypoints[0]);
                      setSimulationState('STOPPED');
                      setCurrentWaypointIndex(0);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white outline-none cursor-pointer max-w-[280px] md:max-w-none truncate"
                >
                  {SIMULATION_ROUTES.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Speed:</span>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={boatSpeedKnots}
                  onChange={(e) => setBoatSpeedKnots(parseInt(e.target.value, 10))}
                  className="w-24 accent-cyan-400 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-cyan-300 w-12 text-right">
                  {boatSpeedKnots} kn
                </span>
              </div>

              {/* Action Buttons: Start, Pause, Resume, Reset */}
              <div className="flex items-center gap-2">
                {simulationState === 'STOPPED' && (
                  <button
                    onClick={handleStartSimulation}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Drill</span>
                  </button>
                )}

                {simulationState === 'RUNNING' && (
                  <button
                    onClick={handlePauseSimulation}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-900/30 transition-all active:scale-95"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </button>
                )}

                {simulationState === 'PAUSED' && (
                  <button
                    onClick={handleResumeSimulation}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-900/30 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume</span>
                  </button>
                )}

                <button
                  onClick={handleResetSimulation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Real-time Telemetry HUD & Emergency Controls (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Live NavIC Vessel Telemetry
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  REAL-TIME SYNC
                </span>
              </div>

              {/* Coordinates Grid */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Position:</span>
                  <span className="font-mono font-bold text-cyan-300 text-[11px] truncate">
                    {telemetry.coords}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Latitude / Longitude:</span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {telemetry.lat}° N, {telemetry.lng}° E
                  </span>
                </div>
              </div>

              {/* Telemetry Meters Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Distance to IMBL */}
                <div
                  className={`p-3 rounded-xl border flex flex-col gap-0.5 ${
                    telemetry.riskStatus === 'SAFE'
                      ? 'bg-slate-950/70 border-slate-800'
                      : telemetry.riskStatus === 'EARLY_WARNING'
                      ? 'bg-amber-950/30 border-amber-500/40'
                      : 'bg-rose-950/40 border-rose-500/60'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Distance to IMBL
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span
                      className={`text-xl font-black font-mono ${
                        telemetry.riskStatus === 'SAFE'
                          ? 'text-emerald-400'
                          : telemetry.riskStatus === 'EARLY_WARNING'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {telemetry.distanceToImblNM}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">NM</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({telemetry.distanceToImblKm} km)
                  </span>
                </div>

                {/* Distance to Safety Warning Line */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Safety Line Buffer
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black font-mono text-cyan-300">
                      {telemetry.distanceToWarningNM}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">NM</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({telemetry.distanceToWarningKm} km clear)
                  </span>
                </div>

                {/* Heading */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Heading
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-black font-mono text-white">
                      {telemetry.heading}°
                    </span>
                    <span className="text-xs text-cyan-400 font-bold">
                      {telemetry.headingCompass.split(' ')[1] || ''}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Gyro Course Track
                  </span>
                </div>

                {/* Speed */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Vessel Speed
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-black font-mono text-white">
                      {boatSpeedKnots}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">knots</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ~{(boatSpeedKnots * 1.852).toFixed(1)} km/h SOG
                  </span>
                </div>
              </div>

              {/* Safety Recommendation Banner */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  telemetry.riskStatus === 'SAFE'
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : telemetry.riskStatus === 'EARLY_WARNING'
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {telemetry.riskStatus === 'SAFE' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {telemetry.riskStatus === 'EARLY_WARNING' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {(telemetry.riskStatus === 'CRITICAL_PROXIMITY' || telemetry.riskStatus === 'CRITICAL_BREACH') && (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  )}
                </div>
                <div className="text-xs leading-relaxed">
                  {telemetry.riskStatus === 'SAFE' && (
                    <span>
                      <strong>Safe Navigation:</strong> Vessel is well within Indian territorial waters (&gt; {settings.warningDistanceKm} km from IMBL). Keep course.
                    </span>
                  )}
                  {telemetry.riskStatus === 'EARLY_WARNING' && (
                    <span>
                      <strong>Early Safety Action:</strong> You have crossed the early warning boundary line. <strong>Steer 270° West</strong> immediately to return to safety.
                    </span>
                  )}
                  {telemetry.riskStatus === 'CRITICAL_PROXIMITY' && (
                    <span>
                      <strong>High Collision / Detention Danger:</strong> Distance to international boundary is under {settings.criticalDistanceKm} km! Reverse engines or alter course westward.
                    </span>
                  )}
                  {telemetry.riskStatus === 'CRITICAL_BREACH' && (
                    <span>
                      <strong>CRITICAL BREACH:</strong> Vessel has crossed the IMBL into Sri Lankan waters! Initiate emergency contact and turn back 180°.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Nearest Safety Station & Direct Emergency Call Card */}
            <div className="p-4 rounded-2xl bg-[#0b192c] border border-red-900/60 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Emergency Maritime Response
                </span>
                <span className="text-[10px] text-red-300 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/40 font-bold">
                  AUTO-TRIGGER ACTIVE
                </span>
              </div>

              {/* Nearest Contact Information */}
              {telemetry.closestStation && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Nearest Station:</span>
                    <span className="font-bold text-white text-right">
                      {telemetry.closestStation.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Officer:</span>
                    <span className="text-slate-300">{telemetry.closestStation.officer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Proximity:</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {telemetry.closestStation.distanceNM} NM ({telemetry.closestStation.distanceKm} km)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-1">
                    * Proximity computed via GPS. Officer availability subject to duty shift.
                  </p>
                </div>
              )}

              {/* Emergency Call Button */}
              <button
                onClick={handleEmergencyCall}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm tracking-wide shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 transition-all active:scale-95 border border-red-400/50"
              >
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>📞 Call Person ({emergencyNumber})</span>
              </button>
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Direct Safety Line:</span>
                <span className="text-cyan-300 font-mono font-bold">+91 {emergencyNumber}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Geofence Settings & Administration */}
      {selectedTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl max-w-4xl mx-auto w-full flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                Geofencing Thresholds & GPS Error Calibration
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure early safety warning zones on the safe (Indian) side of the IMBL.
              </p>
            </div>
            <button
              onClick={() => {
                setSettings({
                  warningDistanceKm: 5.0,
                  criticalDistanceKm: 1.5,
                  gpsAccuracyMarginMeters: 200,
                });
                onShowToast('Settings Reset', 'Restored recommended maritime standards.', 'info');
              }}
              className="text-xs font-bold text-cyan-400 hover:underline"
            >
              Reset to Recommended
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Warning Buffer Slider */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">Early Safety Warning Distance</span>
                <span className="font-mono text-sm font-bold text-white bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                  {settings.warningDistanceKm} km (~{(settings.warningDistanceKm * 0.54).toFixed(1)} NM)
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="15.0"
                step="0.5"
                value={settings.warningDistanceKm}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    warningDistanceKm: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Buffer zone on the safe side of the IMBL where the vessel receives an orange advisory warning to reverse heading before reaching international waters.
              </p>
            </div>

            {/* Critical Proximity Threshold */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300">Critical Proximity Threshold</span>
                <span className="font-mono text-sm font-bold text-white bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
                  {settings.criticalDistanceKm} km (~{(settings.criticalDistanceKm * 0.54).toFixed(1)} NM)
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.25"
                value={settings.criticalDistanceKm}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    criticalDistanceKm: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-rose-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Critical red zone where siren alarms sound continuously and emergency rescue teams are primed for interception.
              </p>
            </div>

            {/* GPS Accuracy Margin */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300">GPS HDOP Accuracy Margin</span>
                <span className="font-mono text-sm font-bold text-white bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/40">
                  ±{settings.gpsAccuracyMarginMeters} meters
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={settings.gpsAccuracyMarginMeters}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    gpsAccuracyMarginMeters: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Accounts for ionospheric delays, satellite geometry dilution (HDOP), and coastal wave drift. The effective warning boundary expands by this margin so alerts trigger conservatively before true breach.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Safety Officer Dashboard & Station Management */}
      {selectedTab === 'officer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Registered Safety Stations */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  Registered Coastal Safety Contacts & Outposts
                </h2>
                <span className="text-xs text-slate-400">
                  {REGISTERED_SAFETY_STATIONS.length} Stations Verified
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {REGISTERED_SAFETY_STATIONS.map((stn) => {
                  const isNearest = telemetry.closestStation?.id === stn.id;
                  return (
                    <div
                      key={stn.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isNearest
                          ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-950/40'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{stn.name}</span>
                            {isNearest && (
                              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/40">
                                NEAREST CONTACT
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{stn.officer}</span>
                        </div>
                        <a
                          href={`tel:${stn.phone}`}
                          className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 shrink-0"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{stn.phone}</span>
                        </a>
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                        <div>
                          <span>Comm: </span>
                          <strong className="text-slate-300">{stn.channel}</strong>
                        </div>
                        <div>
                          <span>Sector: </span>
                          <strong className="text-slate-300">{stn.jurisdiction}</strong>
                        </div>
                        <div>
                          <span>Proximity: </span>
                          <strong className="text-cyan-300">
                            {stn.distanceNM !== undefined ? `${stn.distanceNM} NM` : 'Live Calculated'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Officer Alert Acknowledgement Workflow */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Incident Acknowledgement Queue
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">
                  {alerts.filter((a) => !a.acknowledged).length} Pending
                </span>
              </div>

              {alerts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No simulation incidents logged yet. Start a simulation drill to test.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {alerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border flex flex-col gap-2 ${
                        alert.acknowledged
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                          : 'bg-rose-950/20 border-rose-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            alert.riskStatus === 'SAFE_RECOVERY'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : alert.riskStatus === 'EARLY_WARNING'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {alert.riskStatus}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {alert.displayTime}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        {alert.note || `Vessel proximity to IMBL: ${alert.distanceToImblNM} NM`}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px] text-slate-400">
                        <span>Coord: {alert.coords}</span>
                        {alert.acknowledged ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Ack by {alert.acknowledgedBy?.split(' ')[1] || 'Officer'}
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedAlertForAck(alert)}
                            className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition-all"
                          >
                            Acknowledge & Respond
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Alert History Audit Log */}
      {selectedTab === 'alerts' && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                Simulation Alert History & Verification Log
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Timestamped incident records stored in database with coordinates, risk level, and response status.
              </p>
            </div>
            {alerts.length > 0 && (
              <button
                onClick={handleClearAlertHistory}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 text-xs font-bold border border-slate-700 transition-all"
              >
                Clear History
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Coordinates</th>
                  <th className="py-2.5 px-3">IMBL Proximity</th>
                  <th className="py-2.5 px-3">Details / Note</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No simulation alerts logged. Start a simulation drill to generate mock events.
                    </td>
                  </tr>
                ) : (
                  alerts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-all">
                      <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {item.displayTime}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                            item.riskStatus === 'SAFE_RECOVERY'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : item.riskStatus === 'EARLY_WARNING'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {item.riskStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {item.coords}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <strong className="text-white">{item.distanceToImblNM} NM</strong>{' '}
                        <span className="text-slate-500">({item.distanceToImblKm} km)</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate">
                        {item.note || 'Safety geofence boundary monitored.'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {item.acknowledged ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Acknowledged
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Response
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {!item.acknowledged && (
                          <button
                            onClick={() => setSelectedAlertForAck(item)}
                            className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                          >
                            Respond
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Officer Alert Acknowledgement Form */}
      {selectedAlertForAck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#091424] border border-cyan-500/50 shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Acknowledge Maritime Incident
              </h3>
              <button
                onClick={() => setSelectedAlertForAck(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex flex-col gap-1">
              <div>
                Incident ID: <strong className="font-mono text-cyan-300">{selectedAlertForAck.id}</strong>
              </div>
              <div>
                Risk Level: <strong className="text-amber-400">{selectedAlertForAck.riskStatus}</strong>
              </div>
              <div>
                Coordinates: <span className="font-mono text-slate-300">{selectedAlertForAck.coords}</span>
              </div>
            </div>

            {/* Officer Name Field */}
            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400 font-semibold">Authorized Officer Name:</label>
              <input
                type="text"
                value={ackOfficerName}
                onChange={(e) => setAckOfficerName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-400 text-xs"
              />
            </div>

            {/* Response Action Selector */}
            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400 font-semibold">Response Action Taken:</label>
              <select
                value={ackResponseAction}
                onChange={(e) => setAckResponseAction(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-400 text-xs"
              >
                <option value="Course correction advisory issued via VHF Ch 16">
                  Course correction advisory issued via VHF Ch 16
                </option>
                <option value="NavIC Transceiver digital warning ping transmitted">
                  NavIC Transceiver digital warning ping transmitted
                </option>
                <option value="Dispatched Marine Police Fast Interceptor Boat">
                  Dispatched Marine Police Fast Interceptor Boat
                </option>
                <option value="Escalated to Indian Coast Guard Mandapam MRCC">
                  Escalated to Indian Coast Guard Mandapam MRCC
                </option>
                <option value="Logged Training Simulation / Drill Test">
                  Logged Training Simulation / Drill Test
                </option>
              </select>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400 font-semibold">Officer Log Notes:</label>
              <textarea
                rows={2}
                value={ackNotes}
                onChange={(e) => setAckNotes(e.target.value)}
                placeholder="Enter response notes or confirmation of trawler contact..."
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-400 text-xs resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSelectedAlertForAck(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledgeAlert}
                className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-900/40"
              >
                Submit Acknowledgement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automated Emergency Call on Border Breach Modal */}
      <BorderBreachCallModal
        isOpen={isBorderCallModalOpen}
        onClose={() => setIsBorderCallModalOpen(false)}
        coords={telemetry.coords}
        distanceNM={telemetry.distanceToImblNM.toString()}
        headingCompass={telemetry.headingCompass}
        onCorrectCourse={handleSteerBackToSafety}
      />
    </div>
  );
};
