import React, { useState, useEffect, useRef } from 'react';
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from 'axios';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiShield, FiClock, FiActivity, FiNavigation } from 'react-icons/fi';

const MAP_KEY = import.meta.env.VITE_MAPTILER_KEY;
console.log("Using Map Key:", MAP_KEY);

const isValidKey = (key) => key && key !== "your_key_here" && !key.includes("token");

const RouteSafetyMap = ({ 
  startCoords = [77.209, 28.6139], 
  destination, 
  showRoutes = false, 
  nightSafetyPoint = null, 
  userLocation = null, 
  onLocateMe = null, 
  startName = "Origin", 
  destName = "Destination",
  fastRoute = null,
  safeRoute = null,
  isFullscreen = false,
  onToggleFullscreen = null
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const originMarker = useRef(null);
  const destMarker = useRef(null);
  const animationRef = useRef(null);
  const nightMarker = useRef(null);
  const userMarker = useRef(null);
  const vehicleMarker = useRef(null);

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [styleError, setStyleError] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [safeRouteCoords, setSafeRouteCoords] = useState([]);
  const [csvData, setCsvData] = useState([]);

  // Telemetry HUD States
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [show3DBuildings, setShow3DBuildings] = useState(true);
  const [activeSimulationRoute, setActiveSimulationRoute] = useState('safe');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(2);

  // Inject High-Tech HUD & Map Marker Animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse-ring {
        0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7); }
        70% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(0, 255, 136, 0); }
        100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
      }
      .marker-origin {
        width: 18px;
        height: 18px;
        background: #00ff88;
        border-radius: 50%;
        border: 3px solid #060913;
        box-shadow: 0 0 20px #00ff88;
        animation: pulse-ring 2.2s infinite ease-in-out;
        cursor: pointer;
      }
      .marker-dest {
        font-size: 32px;
        filter: drop-shadow(0 0 12px rgba(255, 0, 85, 0.8));
        animation: float 2.5s ease-in-out infinite;
        cursor: pointer;
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-8px) rotate(4deg); }
      }
      @keyframes pulse-marker {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
        70% { transform: scale(1.15); box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
      }
      @keyframes pulse-user {
        0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7); }
        70% { transform: scale(1.1); box-shadow: 0 0 0 18px rgba(6, 182, 212, 0); }
        100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
      }
      .user-marker {
        width: 16px;
        height: 16px;
        background: #06b6d4;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 15px rgba(6, 182, 212, 0.8);
        animation: pulse-user 2s infinite ease-in-out;
        cursor: pointer;
      }
      .glass-panel {
        background: rgba(6, 9, 22, 0.8) !important;
        backdrop-filter: blur(18px) !important;
        -webkit-backdrop-filter: blur(18px) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        box-shadow: 0 10px 40px 0 rgba(0, 0, 0, 0.6) !important;
      }
      .glass-popup .maplibregl-popup-content {
        background: rgba(6, 9, 22, 0.92) !important;
        backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: white !important;
        border-radius: 16px !important;
        padding: 14px !important;
        font-family: 'Inter', sans-serif !important;
        box-shadow: 0 15px 30px rgba(0,0,0,0.7) !important;
      }
      .glass-popup .maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
        border-top-color: rgba(6, 9, 22, 0.92) !important;
      }
      .glass-popup .maplibregl-popup-anchor-top .maplibregl-popup-tip {
        border-bottom-color: rgba(6, 9, 22, 0.92) !important;
      }
      .maplibregl-ctrl-group {
        background: rgba(6, 9, 22, 0.8) !important;
        backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4) !important;
      }
      .maplibregl-ctrl-group button {
        fill: #94a3b8 !important;
      }
      .maplibregl-ctrl-group button:hover {
        background-color: rgba(255, 255, 255, 0.05) !important;
        fill: white !important;
      }
      
      /* Vehicle Pulse */
      .vehicle-marker {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        z-index: 150;
      }
      .vehicle-icon {
        width: 28px;
        height: 28px;
        transition: transform 0.1s linear;
      }
      .vehicle-pulse {
        position: absolute;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid;
        animation: vehicle-ripple 1.6s infinite ease-out;
        pointer-events: none;
      }
      @keyframes vehicle-ripple {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(1.8); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const fallbackStyle = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
    const mTileStyle = isValidKey(MAP_KEY) 
      ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAP_KEY}`
      : fallbackStyle;
      
    if (!isValidKey(MAP_KEY) && !styleError) {
      setStyleError(true);
    }

    const initialStyle = (!styleError && isValidKey(MAP_KEY)) ? mTileStyle : fallbackStyle;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: initialStyle,
        center: [startCoords[0], startCoords[1]],
        zoom: 4,
        attributionControl: false,
        pitch: 50,
        bearing: -15
      });

      map.current.addControl(new maplibregl.AttributionControl(), 'bottom-right');
      map.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);
        map.current.flyTo({
          center: [startCoords[0], startCoords[1]],
          zoom: 13.5,
          duration: 2500,
          essential: true,
          curve: 1.4,
          pitch: 60
        });
      });

      // 3D Buildings
      map.current.on('styledata', () => {
        if (!map.current) return;
        const style = map.current.getStyle();
        if (!style || !style.layers) return;
        
        const layers = style.layers;
        const buildingLayer = layers.find(l => l['source-layer'] === 'building' || l.id.includes('building'));
        
        if (buildingLayer && !map.current.getLayer('3d-buildings')) {
          map.current.addLayer({
            'id': '3d-buildings',
            'source': buildingLayer.source,
            'source-layer': buildingLayer['source-layer'],
            'type': 'fill-extrusion',
            'minzoom': 14.5,
            'paint': {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', 'height'], 20],
                0, '#0a0d16',
                30, '#111827',
                70, '#1f2937',
                120, '#374151'
              ],
              'fill-extrusion-height': ['coalesce', ['get', 'height'], ['get', 'render_height'], 20],
              'fill-extrusion-base': ['coalesce', ['get', 'min_height'], ['get', 'render_min_height'], 0],
              'fill-extrusion-opacity': 0.65
            }
          });
        }
      });

      map.current.on('error', (e) => {
        if (!styleError && (e.error?.status === 403 || e.error?.status === 401 || e.error?.status === 404)) {
          setStyleError(true);
          map.current.setStyle(fallbackStyle);
        }
      });
    } catch (err) {
      console.error("[RouteSafetyMap] Init Exception:", err);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (vehicleMarker.current) {
        vehicleMarker.current.remove();
        vehicleMarker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Load Heatmap Data
  useEffect(() => {
    fetch('/safety_data.csv')
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            setCsvData(results.data.filter(d => d.latitude && d.longitude));
          }
        });
      })
      .catch(err => console.error("CSV Loading Error:", err));
  }, []);

  // Add Heatmap Layer
  useEffect(() => {
    if (!map.current || !mapLoaded || csvData.length === 0) return;

    const sourceId = 'safety-heatmap-source';
    const layerId = 'safety-heatmap-layer';

    if (map.current.getSource(sourceId)) {
        if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
        map.current.removeSource(sourceId);
    }

    const geojson = {
        type: 'FeatureCollection',
        features: csvData.map(point => ({
            type: 'Feature',
            properties: { intensity: point.safety_score / 100 },
            geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] }
        }))
    };

    map.current.addSource(sourceId, { type: 'geojson', data: geojson });
    
    const firstSymbolId = map.current.getStyle()?.layers.find(l => l.type === 'symbol')?.id;
    
    map.current.addLayer({
        id: layerId,
        type: 'heatmap',
        source: sourceId,
        maxzoom: 15,
        layout: {
          'visibility': showHeatmap ? 'visible' : 'none'
        },
        paint: {
            'heatmap-weight': ['get', 'intensity'],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1.2, 15, 3.5],
            'heatmap-color': [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(0,0,0,0)',
                0.25, 'rgba(239, 68, 68, 0.45)', 
                0.55, 'rgba(245, 158, 11, 0.55)', 
                0.85, 'rgba(16, 185, 129, 0.65)', 
                1, 'rgba(0, 255, 136, 0.85)'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 5, 15, 35],
            'heatmap-opacity': 0.65
        }
    }, firstSymbolId); 
  }, [csvData, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    if (map.current.getLayer('safety-heatmap-layer')) {
      map.current.setLayoutProperty('safety-heatmap-layer', 'visibility', showHeatmap ? 'visible' : 'none');
    }
  }, [showHeatmap, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    if (map.current.getLayer('3d-buildings')) {
      map.current.setLayoutProperty('3d-buildings', 'visibility', show3DBuildings ? 'visible' : 'none');
    }
  }, [show3DBuildings, mapLoaded]);

  const fetchRoutesAndSafety = async (start, end) => {
    if (!mapLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const coords = [start, end];
      const apiUrl = import.meta.env.VITE_API_URL || "https://greenpath-3.onrender.com";
      
      const response = await axios.post(`${apiUrl}/api/route`, {
        coordinates: coords,
        preference: "dual" 
      });

      if (response.data.fastRoute && response.data.safeRoute) {
        const fast = response.data.fastRoute;
        const safe = response.data.safeRoute;

        setRouteCoords(fast.coordinates);
        setSafeRouteCoords(safe.coordinates);

        const crimeReduction = Math.round(((safe.safetyScore - fast.safetyScore) / (100 - fast.safetyScore)) * 100) || 0;

        const finalized = [
          {
            id: 'fast',
            label: "Fastest Route",
            coordinates: fast.coordinates,
            duration: fast.duration,
            distance: fast.distance,
            score: fast.safetyScore,
            color: '#ff0055', 
            crimeReduction: 0
          },
          {
            id: 'safe',
            label: "Safest Route",
            coordinates: safe.coordinates,
            duration: safe.duration,
            distance: safe.distance,
            score: safe.safetyScore,
            color: '#00ff88', 
            crimeReduction: crimeReduction > 0 ? crimeReduction : 0
          }
        ];

        setRoutes(finalized);
        updateMap(finalized, start, end);
      } else {
        throw new Error("Invalid dual route data structure");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Routing pipeline failure");
    } finally {
      setLoading(false);
    }
  };

  const updateMap = (routeData, start, end) => {
    if (!map.current) return;

    // Draw Markers
    const startCoord = routeData[0].coordinates[0];
    const endCoord = routeData[0].coordinates[routeData[0].coordinates.length - 1];

    if (originMarker.current) originMarker.current.remove();
    if (destMarker.current) destMarker.current.remove();

    const originEl = document.createElement('div');
    originEl.className = "marker-origin";
    originMarker.current = new maplibregl.Marker({ element: originEl })
      .setLngLat(startCoord)
      .setPopup(new maplibregl.Popup({ offset: 20, className: 'glass-popup' }).setHTML(`<div class="text-white text-xs font-bold">${startName} (Source)</div>`))
      .addTo(map.current);

    const destEl = document.createElement('div');
    destEl.innerHTML = `🏁`;
    destEl.className = "marker-dest";
    destMarker.current = new maplibregl.Marker({ element: destEl })
      .setLngLat(endCoord)
      .setPopup(new maplibregl.Popup({ offset: 20, className: 'glass-popup' }).setHTML(`<div class="text-white text-xs font-bold">${destName} (Destination)</div>`))
      .addTo(map.current);

    // Setup Route Layers
    routeData.forEach(route => {
      const sourceId = `route-source-${route.id}`;
      const layerId = `route-layer-${route.id}`;
      const midLayerId = `route-mid-${route.id}`;
      const bgLayerId = `route-bg-${route.id}`;

      if (map.current.getSource(sourceId)) {
        if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
        if (map.current.getLayer(midLayerId)) map.current.removeLayer(midLayerId);
        if (map.current.getLayer(bgLayerId)) map.current.removeLayer(bgLayerId);
        map.current.removeSource(sourceId);
      }

      map.current.addSource(sourceId, {
        type: 'geojson',
        lineMetrics: true, 
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] } 
        }
      });

      if (route.id === 'safe') {
        // Safe Route: Under glow
        map.current.addLayer({
          id: bgLayerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#00ff88',
            'line-width': 18,
            'line-opacity': 0.22,
            'line-blur': 12
          }
        });

        // Safe Route: Mid glow
        map.current.addLayer({
          id: midLayerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#00ff88',
            'line-width': 9,
            'line-opacity': 0.45,
            'line-blur': 4
          }
        });

        // Safe Route: Core
        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-width': 4.5,
            'line-color': '#ffffff',
            'line-opacity': 0.95
          }
        });
      } else {
        // Fast Route: Under glow
        map.current.addLayer({
          id: bgLayerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ff0055',
            'line-width': 12,
            'line-opacity': 0.18,
            'line-blur': 9
          }
        });

        // Fast Route: Mid glow
        map.current.addLayer({
          id: midLayerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ff0055',
            'line-width': 6,
            'line-opacity': 0.35,
            'line-blur': 3
          }
        });

        // Fast Route: Dashed core
        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ff80a0',
            'line-width': 3,
            'line-dasharray': [2, 3],
            'line-opacity': 0.9
          }
        });
      }

      // Hover tooltip
      map.current.on('mouseenter', layerId, (e) => {
        map.current.getCanvas().style.cursor = 'pointer';
        const coordinates = e.lngLat;
        const html = `
          <div class="flex flex-col gap-1.5">
            <span class="text-xs font-black uppercase tracking-wider" style="color: ${route.color}">${route.label}</span>
            <span class="text-[11px] text-slate-300 font-bold">⏱️ ${route.duration} min • 🛣️ ${route.distance} km</span>
            <span class="text-[11px] font-black text-white mt-0.5">AI Safety Index: ${route.score}/100</span>
            ${route.crimeReduction > 0 ? `<span class="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 text-center mt-1">Crime Threat -${route.crimeReduction}%</span>` : ''}
          </div>
        `;
        new maplibregl.Popup({ closeButton: false, className: 'glass-popup' })
          .setLngLat(coordinates)
          .setHTML(html)
          .addTo(map.current);
      });
      
      map.current.on('mouseleave', layerId, () => {
        map.current.getCanvas().style.cursor = '';
        const popups = document.getElementsByClassName('maplibregl-popup');
        if (popups.length) popups[0].remove();
      });
    });

    // Breathing pulse
    let progress = 0;
    const maxSteps = 100;

    const animate = () => {
      progress += 1;
      
      const safeGlowWidth = Math.sin(Date.now() / 400) * 4 + 18;
      const fastGlowWidth = Math.sin(Date.now() / 400 + Math.PI) * 3 + 12;

      routeData.forEach(route => {
        const sourceId = `route-source-${route.id}`;
        const coords = route.coordinates;
        
        const currentLength = Math.min(
          Math.ceil((progress / maxSteps) * coords.length),
          coords.length
        );
        const drawnCoords = coords.slice(0, currentLength);

        if (map.current && map.current.getSource(sourceId)) {
          map.current.getSource(sourceId).setData({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: drawnCoords }
          });
        }
      });

      if (map.current) {
        if (map.current.getLayer('route-bg-safe')) {
          map.current.setPaintProperty('route-bg-safe', 'line-width', safeGlowWidth);
        }
        if (map.current.getLayer('route-bg-fast')) {
          map.current.setPaintProperty('route-bg-fast', 'line-width', fastGlowWidth);
        }
      }

      if (progress < maxSteps || map.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);

    // Cinematic Camera Pan
    const bounds = new maplibregl.LngLatBounds();
    routeData.forEach(r => r.coordinates.forEach(c => bounds.extend(c)));
    
    map.current.flyTo({
      center: startCoord,
      zoom: 15,
      pitch: 65,
      bearing: -25,
      duration: 1800,
      essential: true
    });

    setTimeout(() => {
      if (map.current) {
        map.current.fitBounds(bounds, { 
          padding: { top: 120, bottom: 120, left: 120, right: 120 }, 
          duration: 2500,
          pitch: 50,
          bearing: -15,
          essential: true
        });
      }
    }, 1800);
  };

  useEffect(() => {
    if (!mapLoaded) return;
    
    if (showRoutes && fastRoute && safeRoute) {
      console.log("[RouteSafetyMap] Props sync success.");
      setRouteCoords(fastRoute.coordinates);
      setSafeRouteCoords(safeRoute.coordinates);
      
      const crimeReduction = Math.round(((safeRoute.safetyScore - fastRoute.safetyScore) / (100 - fastRoute.safetyScore)) * 100) || 0;
      
      const finalized = [
        {
          id: 'fast',
          label: "Fastest Route",
          coordinates: fastRoute.coordinates,
          duration: fastRoute.duration,
          distance: fastRoute.distance,
          score: fastRoute.safetyScore,
          color: '#ff0055',
          crimeReduction: 0
        },
        {
          id: 'safe',
          label: "Safest Route",
          coordinates: safeRoute.coordinates,
          duration: safeRoute.duration,
          distance: safeRoute.distance,
          score: safeRoute.safetyScore,
          color: '#00ff88',
          crimeReduction: crimeReduction > 0 ? crimeReduction : 0
        }
      ];
      setRoutes(finalized);
      updateMap(finalized, startCoords, [destination.lng, destination.lat]);
    } else if (showRoutes && destination?.lng) {
      fetchRoutesAndSafety(startCoords, [destination.lng, destination.lat]);
    }
  }, [startCoords?.join(','), destination?.lng, destination?.lat, showRoutes, mapLoaded, fastRoute, safeRoute]);

  const calculateBearing = (lng1, lat1, lng2, lat2) => {
    const rad = Math.PI / 180;
    const dLng = (lng2 - lng1) * rad;
    const lat1Rad = lat1 * rad;
    const lat2Rad = lat2 * rad;
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
  };

  // Traversal Telemetry simulation
  useEffect(() => {
    if (!map.current || !mapLoaded || !isSimulating) return;

    const coords = activeSimulationRoute === 'safe' ? safeRouteCoords : routeCoords;
    if (!coords || coords.length === 0) {
      setIsSimulating(false);
      return;
    }

    const intervalId = setInterval(() => {
      setSimulationIndex(prev => {
        const nextIndex = prev + simulationSpeed;
        if (nextIndex >= coords.length) {
          clearInterval(intervalId);
          setIsSimulating(false);
          return coords.length - 1;
        }

        const currentCoord = coords[nextIndex];
        const nextCoord = coords[Math.min(nextIndex + 1, coords.length - 1)];

        if (currentCoord && map.current) {
          if (!vehicleMarker.current) {
            const vehicleEl = document.createElement('div');
            vehicleEl.className = 'vehicle-marker';
            vehicleEl.innerHTML = `
              <div class="vehicle-pulse" style="background: ${activeSimulationRoute === 'safe' ? 'rgba(0, 255, 136, 0.25)' : 'rgba(255, 0, 85, 0.25)'}; border-color: ${activeSimulationRoute === 'safe' ? '#00ff88' : '#ff0055'}"></div>
              <div class="vehicle-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" style="filter: drop-shadow(0 0 8px ${activeSimulationRoute === 'safe' ? '#00ff88' : '#ff0055'})">
                  <path d="M12 2L22 22L12 18L2 22L12 2Z" fill="${activeSimulationRoute === 'safe' ? '#00ff88' : '#ff0055'}" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
                </svg>
              </div>
            `;
            vehicleMarker.current = new maplibregl.Marker({ element: vehicleEl, rotationAlignment: 'map' })
              .setLngLat(currentCoord)
              .addTo(map.current);
          } else {
            vehicleMarker.current.setLngLat(currentCoord);
            
            const pulseEl = vehicleMarker.current.getElement().querySelector('.vehicle-pulse');
            const pathEl = vehicleMarker.current.getElement().querySelector('path');
            const svgEl = vehicleMarker.current.getElement().querySelector('svg');
            if (pulseEl && pathEl && svgEl) {
              const color = activeSimulationRoute === 'safe' ? '#00ff88' : '#ff0055';
              pulseEl.style.background = activeSimulationRoute === 'safe' ? 'rgba(0, 255, 136, 0.25)' : 'rgba(255, 0, 85, 0.25)';
              pulseEl.style.borderColor = color;
              pathEl.setAttribute('fill', color);
              svgEl.style.filter = `drop-shadow(0 0 8px ${color})`;
            }
          }

          if (nextCoord) {
            const bearing = calculateBearing(
              currentCoord[0], currentCoord[1],
              nextCoord[0], nextCoord[1]
            );
            const iconEl = vehicleMarker.current.getElement().querySelector('.vehicle-icon');
            if (iconEl) {
              iconEl.style.transform = `rotate(${bearing}deg)`;
            }
          }
          
          map.current.easeTo({
            center: currentCoord,
            duration: 100,
            zoom: 15.5,
            pitch: 62,
            essential: true
          });
        }
        return nextIndex;
      });
    }, 100);

    return () => clearInterval(intervalId);
  }, [isSimulating, activeSimulationRoute, safeRouteCoords, routeCoords, simulationSpeed, mapLoaded]);

  const handleStartSimulation = (routeType) => {
    setActiveSimulationRoute(routeType);
    setSimulationIndex(0);
    setIsSimulating(true);

    const coords = routeType === 'safe' ? safeRouteCoords : routeCoords;
    if (coords && coords.length > 0 && map.current) {
      if (vehicleMarker.current) {
        vehicleMarker.current.remove();
        vehicleMarker.current = null;
      }
      
      map.current.flyTo({
        center: coords[0],
        zoom: 15.5,
        pitch: 60,
        bearing: -10,
        duration: 1500
      });
    }
  };

  // Night Safety Marker
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (nightMarker.current) {
      nightMarker.current.remove();
      nightMarker.current = null;
    }

    if (nightSafetyPoint) {
      const { lat, lng, color, score, status } = nightSafetyPoint;

      const el = document.createElement('div');
      el.className = 'night-safety-marker';
      el.style.cssText = `
        width: 26px;
        height: 26px;
        background: ${color};
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 0 25px ${color}, 0 0 50px ${color}40;
        cursor: pointer;
        animation: pulse-marker 1.4s infinite;
      `;

      nightMarker.current = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup({ offset: 25, className: 'glass-popup' })
          .setHTML(`
            <div class="text-center">
              <div class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Night Safety Scanner</div>
              <div class="text-xl font-black mb-0.5" style="color: ${color}">${score}</div>
              <div class="text-[9px] font-bold uppercase" style="color: ${color}">${status}</div>
            </div>
          `))
        .addTo(map.current);

      map.current.flyTo({
        center: [lng, lat],
        zoom: 14.5,
        pitch: 62,
        duration: 1800,
        essential: true
      });

      const sourceId = 'night-safety-radius';
      const layerId = 'night-safety-layer';

      if (map.current.getSource(sourceId)) {
        if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
        map.current.removeSource(sourceId);
      }

      const points = 64;
      const radius = 0.5; 
      const coords = [];
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * (Math.PI * 2);
        const dx = radius * Math.cos(angle);
        const dy = radius * Math.sin(angle);
        coords.push([
          lng + (dx / (111.32 * Math.cos(lat * Math.PI / 180))),
          lat + (dy / 110.57)
        ]);
      }
      coords.push(coords[0]);

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [coords] }
        }
      });

      map.current.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': color,
          'fill-opacity': 0.16,
          'fill-outline-color': color
        }
      });
    }
  }, [nightSafetyPoint, mapLoaded]);

  // User location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

    if (userMarker.current) {
      userMarker.current.setLngLat(userLocation);
    } else {
      const el = document.createElement('div');
      el.className = 'user-marker';
      
      userMarker.current = new maplibregl.Marker({ element: el })
        .setLngLat(userLocation)
        .setPopup(new maplibregl.Popup({ offset: 15, className: 'glass-popup' }).setHTML(`
          <div class="text-[10px] font-black uppercase text-cyan-400 mb-0.5">Live Coordinates</div>
          <div class="text-white text-[10px] font-bold">Current Positioning Secured</div>
        `))
        .addTo(map.current);
    }

    if (userLocation && !showRoutes) {
      map.current.flyTo({
        center: userLocation,
        zoom: 14.5,
        speed: 0.8,
        curve: 1.1,
        essential: true,
        pitch: 60
      });
    }
  }, [userLocation, mapLoaded, showRoutes]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full rounded-[2rem] overflow-hidden border border-slate-800/80 bg-[#070b13] shadow-[0_0_50px_rgba(0,0,0,0.8)] group"
      id="map-container"
    >
      <AnimatePresence>
        {!mapLoaded && (
          <motion.div 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-40 bg-[#070b13] flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiActivity className="text-cyan-500 text-lg animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-cyan-400 font-black tracking-[0.25em] uppercase text-[10px] mb-1">Calibrating HUD Grid</p>
              <p className="text-slate-650 text-[10px]">Mapping spatial nodes...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 bg-[#070b13]/60 backdrop-blur-md flex items-center justify-center"
        >
          <div className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-5 border border-cyan-500/30">
            <div className="relative">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-emerald-400 font-black uppercase tracking-wider text-[10px] animate-pulse">Calculating Trajectories...</p>
          </div>
        </motion.div>
      )}

      <div
        id="map"
        ref={mapContainer}
        className="h-full w-full"
      />

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 glass-panel px-6 py-4 rounded-2xl text-xs font-bold text-red-400 flex items-center gap-3 border border-red-500/30"
        >
          <FiAlertTriangle className="text-lg shrink-0" /> 
          <div>
            <p className="text-white font-black mb-0.5">Routing Degraded</p>
            <p className="text-red-300/80 text-[10px]">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-4 px-2.5 py-1 bg-red-500/20 text-red-400 text-[10px] font-black rounded hover:bg-red-500/30 transition-colors">
            Dismiss
          </button>
        </motion.div>
      )}
      
      {/* HUD Engine Status */}
      <div className="absolute top-6 left-6 z-20 glass-panel px-4 py-2.5 rounded-2xl text-[9px] font-black text-slate-350 uppercase tracking-widest flex items-center gap-2.5 border border-slate-800">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#06b6d4]"></div>
        {styleError ? "Telemetry Grid v2 (OSM Fallback)" : "Telemetry Grid Active v2"}
      </div>

      {/* Fullscreen Expand Button Overlay */}
      {onToggleFullscreen && (
        <button 
          onClick={onToggleFullscreen}
          className="absolute top-6 right-16 z-20 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border border-slate-800 text-slate-300 glass-panel hover:text-white hover:border-slate-700 transition-all duration-300 flex items-center gap-2 select-none"
          title={isFullscreen ? "Collapse Layout" : "Expand Navigation"}
        >
          <span>{isFullscreen ? "🗎 Collapse View" : "⛶ Expand Navigation"}</span>
        </button>
      )}

      {/* Floating map toggles (Heatmap and Cityscapes) */}
      <div className="absolute top-[180px] md:top-[72px] left-6 z-20 flex flex-col gap-2">
        <button 
          onClick={() => setShowHeatmap(!showHeatmap)} 
          className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all flex items-center gap-2 ${
            showHeatmap 
              ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 glass-panel shadow-[0_0_10px_rgba(0,255,136,0.15)]' 
              : 'bg-slate-900/60 border-slate-800/80 text-slate-400 glass-panel hover:text-slate-300'
          }`}
        >
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${showHeatmap ? 'bg-emerald-400 shadow-[0_0_6px_#00ff88]' : 'bg-slate-650'}`}></div>
          AI Heatmap
        </button>

        <button 
          onClick={() => setShow3DBuildings(!show3DBuildings)} 
          className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all flex items-center gap-2 ${
            show3DBuildings 
              ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400 glass-panel shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
              : 'bg-slate-900/60 border-slate-800/80 text-slate-400 glass-panel hover:text-slate-300'
          }`}
        >
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${show3DBuildings ? 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]' : 'bg-slate-650'}`}></div>
          3D Cityscape
        </button>
      </div>

      {/* Locate Me */}
      <button 
        onClick={onLocateMe}
        className="absolute bottom-40 right-6 md:bottom-6 md:left-6 md:right-auto z-20 w-10 h-10 bg-slate-950/70 border border-slate-800 rounded-xl shadow-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-900 transition-all group"
        title="Lock Current Coordinates"
      >
        <FiNavigation className="text-base group-hover:scale-105 transition-transform" />
      </button>

      {/* Telemetry Progress / Simulation Bar */}
      {showRoutes && routes.length > 0 && (
        <div className="absolute bottom-24 left-6 right-6 md:bottom-6 md:left-20 md:right-auto z-20 glass-panel p-3.5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-4 border border-slate-800 shadow-2xl max-w-[calc(100%-3rem)] md:max-w-md animate-fade-in text-white text-xs select-none">
          <div className="flex flex-col gap-1 border-r border-slate-800 pr-3.5">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Navigation Simulation</span>
            <div className="flex gap-1.5 mt-1">
              <button 
                onClick={() => handleStartSimulation('safe')} 
                className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider border transition-all ${
                  activeSimulationRoute === 'safe' && isSimulating 
                    ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_6px_rgba(0,255,136,0.15)]' 
                    : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                Safest
              </button>
              <button 
                onClick={() => handleStartSimulation('fast')} 
                className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider border transition-all ${
                  activeSimulationRoute === 'fast' && isSimulating 
                    ? 'bg-red-500/10 border-red-500/35 text-red-400 shadow-[0_0_6px_rgba(255,0,85,0.15)]' 
                    : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                Fastest
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsSimulating(!isSimulating)}
              className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center transition-all text-xs font-bold ${
                isSimulating ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isSimulating ? '⏸' : '▶'}
            </button>
            <button 
              onClick={() => { 
                setSimulationIndex(0); 
                setIsSimulating(false); 
                if (vehicleMarker.current) { 
                  const coords = activeSimulationRoute === 'safe' ? safeRouteCoords : routeCoords; 
                  if (coords[0]) vehicleMarker.current.setLngLat(coords[0]); 
                } 
              }}
              className="w-7.5 h-7.5 bg-slate-950/40 border border-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-900/60 hover:text-white text-slate-400"
            >
              🔁
            </button>
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-[90px]">
            <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
              <span>Telemetry</span>
              <span>{Math.round((simulationIndex / Math.max((activeSimulationRoute === 'safe' ? safeRouteCoords : routeCoords).length - 1, 1)) * 100)}%</span>
            </div>
            <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
              <div 
                className={`h-full rounded-full transition-all duration-100 ${
                  activeSimulationRoute === 'safe' ? 'bg-emerald-400 shadow-[0_0_4px_#00ff88]' : 'bg-red-400 shadow-[0_0_4px_#ff0055]'
                }`}
                style={{ width: `${(simulationIndex / Math.max((activeSimulationRoute === 'safe' ? safeRouteCoords : routeCoords).length - 1, 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 border-l border-slate-850 pl-3.5">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Speed</span>
            <select 
              value={simulationSpeed} 
              onChange={(e) => setSimulationSpeed(Number(e.target.value))}
              className="bg-slate-950/40 border border-slate-850 text-white text-[9px] font-black rounded px-1.5 py-0.5 outline-none cursor-pointer hover:bg-slate-900 transition-colors uppercase"
            >
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={5}>5x</option>
              <option value={10}>10x</option>
            </select>
          </div>
        </div>
      )}

      {/* Premium Sleek Bottom-Right Comparison Console Overlay */}
      {showRoutes && routes.length > 0 && (
        <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:bottom-6 z-20 glass-panel p-3 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border border-slate-800 shadow-2xl animate-fade-in text-white text-xs select-none max-w-[calc(100%-3rem)] md:max-w-sm">
          {routes.map((route) => {
            const isSafe = route.id === 'safe';
            return (
              <div 
                key={route.id} 
                className={`flex items-center justify-between gap-3 bg-[#03050a]/40 p-2 rounded-xl border transition-all flex-1 ${
                  isSafe ? 'border-emerald-500/10' : 'border-red-500/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Status indicator color dot */}
                  <div 
                    className="w-2 h-2 rounded-full shadow-[0_0_6px_currentColor] shrink-0" 
                    style={{ color: route.color }}
                  />
                  
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{route.label}</span>
                    <span className="text-[10px] font-black text-white mt-0.5 whitespace-nowrap">
                      {route.duration}m <span className="text-slate-650 font-bold">•</span> {route.distance}km
                    </span>
                  </div>
                </div>

                <div className="flex flex-col text-right pl-2.5 border-l border-slate-850 shrink-0">
                  <span className="text-[8px] font-black uppercase text-slate-500">Score</span>
                  <span className="text-[11px] font-black" style={{ color: route.color }}>{route.score}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default RouteSafetyMap;
