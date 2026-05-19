import React, { useState, useEffect, useRef, useMemo } from 'react';
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from 'axios';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiShield, FiClock, FiActivity, FiNavigation } from 'react-icons/fi';

const MAP_KEY = import.meta.env.VITE_MAPTILER_KEY;
console.log("Using Map Key:", MAP_KEY);

const isValidKey = (key) => key && key !== "your_key_here" && !key.includes("token");

const RouteSafetyMap = ({ startCoords = [77.209, 28.6139], destination, showRoutes = false, nightSafetyPoint = null, userLocation = null, onLocateMe = null }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const originMarker = useRef(null);
  const destMarker = useRef(null);
  const animationRef = useRef(null);
  const nightMarker = useRef(null);
  const userMarker = useRef(null);

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [styleError, setStyleError] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [safeRouteCoords, setSafeRouteCoords] = useState([]);
  const [csvData, setCsvData] = useState([]);

  // Add Micro-Animations & Styling
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse-ring {
        0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); }
        100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
      }
      .marker-origin {
        width: 24px;
        height: 24px;
        background: #22c55e;
        border-radius: 50%;
        border: 3px solid #000;
        box-shadow: 0 0 20px #22c55e;
        animation: pulse-ring 2s infinite;
        cursor: pointer;
      }
      .marker-dest {
        font-size: 32px;
        filter: drop-shadow(0 0 10px rgba(59,130,246,0.8));
        animation: float 2s ease-in-out infinite;
        cursor: pointer;
      }
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      @keyframes pulse-marker {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
        70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
      }
      @keyframes pulse-user {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
      .user-marker {
        width: 20px;
        height: 20px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
        animation: pulse-user 2s infinite;
        cursor: pointer;
      }
      .glass-panel {
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
      }
      .glass-popup .maplibregl-popup-content {
        background: rgba(15, 23, 42, 0.85) !important;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        border-radius: 12px;
        padding: 12px;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      }
      .glass-popup .maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
        border-top-color: rgba(15, 23, 42, 0.85) !important;
      }
      .glass-popup .maplibregl-popup-anchor-top .maplibregl-popup-tip {
        border-bottom-color: rgba(15, 23, 42, 0.85) !important;
      }
      .maplibregl-ctrl-group {
        background: rgba(15, 23, 42, 0.7) !important;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .maplibregl-ctrl-group button {
        fill: white !important;
      }
      .maplibregl-ctrl-group button span {
        color: white !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!isValidKey(MAP_KEY)) {
      console.error("MapTiler key is missing or invalid in .env");
      return;
    }

    const mTileStyle = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAP_KEY}`;
    const fallbackStyle = "https://demotiles.maplibre.org/style.json";
    const initialStyle = !styleError ? mTileStyle : fallbackStyle;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: initialStyle,
        center: [startCoords[0], startCoords[1]],
        zoom: 4,
        attributionControl: false,
        pitch: 45,
        bearing: -10
      });

      // Controls (Top Right)
      map.current.addControl(new maplibregl.AttributionControl(), 'bottom-right');
      map.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);
        map.current.flyTo({
          center: [startCoords[0], startCoords[1]],
          zoom: 13,
          duration: 2500,
          essential: true,
          curve: 1.5,
          pitch: 60
        });
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
        map.current.removeLayer(layerId);
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
        paint: {
            'heatmap-weight': ['get', 'intensity'],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
            'heatmap-color': [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(0,0,0,0)',
                0.2, 'rgba(239, 68, 68, 0.4)', // Red/Orange for low safety areas
                0.5, 'rgba(245, 158, 11, 0.5)', // Amber
                0.8, 'rgba(16, 185, 129, 0.6)', // Green glow for safer zones
                1, 'rgba(34, 197, 94, 0.8)'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 4, 15, 30],
            'heatmap-opacity': 0.5 // Subtle opacity
        }
    }, firstSymbolId); 
  }, [csvData, mapLoaded]);

  // Fetch Routes
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
            color: '#ef4444', 
            crimeReduction: 0
          },
          {
            id: 'safe',
            label: "Safest Route",
            coordinates: safe.coordinates,
            duration: safe.duration,
            distance: safe.distance,
            score: safe.safetyScore,
            color: '#22c55e', 
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
      .setPopup(new maplibregl.Popup({ offset: 20, className: 'glass-popup' }).setHTML(`<div class="text-white text-sm font-bold">Delhi (Source)</div>`))
      .addTo(map.current);

    const destEl = document.createElement('div');
    destEl.innerHTML = `🏎️`;
    destEl.className = "marker-dest";
    destMarker.current = new maplibregl.Marker({ element: destEl })
      .setLngLat(endCoord)
      .setPopup(new maplibregl.Popup({ offset: 20, className: 'glass-popup' }).setHTML(`<div class="text-white text-sm font-bold">Noida (Destination)</div>`))
      .addTo(map.current);

    // Setup Route Layers
    routeData.forEach(route => {
      const sourceId = `route-source-${route.id}`;
      const layerId = `route-layer-${route.id}`;
      const bgLayerId = `route-bg-${route.id}`;

      if (map.current.getSource(sourceId)) {
        if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
        if (map.current.getLayer(bgLayerId)) map.current.removeLayer(bgLayerId);
        map.current.removeSource(sourceId);
      }

      map.current.addSource(sourceId, {
        type: 'geojson',
        lineMetrics: true, // Needed for line-gradient
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] } // Empty initially for drawing animation
        }
      });

      if (route.id === 'safe') {
        // Safe Route: Thicker, neon glow, smooth curves
        map.current.addLayer({
          id: bgLayerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#10b981',
            'line-width': 12,
            'line-opacity': 0.3,
            'line-blur': 8
          }
        });
        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-width': 6,
            'line-gradient': [
              'interpolate',
              ['linear'],
              ['line-progress'],
              0, '#10b981',
              0.5, '#34d399',
              1, '#10b981'
            ]
          }
        });
      } else {
        // Fast Route: Animated dashed line, red glowing effect, thinner
        map.current.addLayer({
          id: bgLayerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ef4444',
            'line-width': 8,
            'line-opacity': 0.2,
            'line-blur': 6
          }
        });
        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#f87171',
            'line-width': 4,
            'line-dasharray': [2, 2],
            'line-opacity': 0.9
          }
        });
      }

      // Add hover tooltip
      map.current.on('mouseenter', layerId, (e) => {
        map.current.getCanvas().style.cursor = 'pointer';
        const coordinates = e.lngLat;
        const html = `
          <div class="flex flex-col gap-1">
            <span class="text-sm font-black uppercase" style="color: ${route.color}">${route.label}</span>
            <span class="text-xs text-slate-300"><i class="fi fi-clock"></i> ${route.duration} min • ${route.distance} km</span>
            <span class="text-xs font-bold text-white mt-1">Safety Score: ${route.score}</span>
            ${route.crimeReduction > 0 ? `<span class="text-xs text-green-400">Crime Reduced by ${route.crimeReduction}%</span>` : ''}
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

    // Smooth Drawing Animation and Gradient Animation
    let progress = 0;
    const maxSteps = 100;
    let gradientOffset = 0;

    const animate = () => {
      progress += 1;
      gradientOffset = (gradientOffset + 0.02) % 1;

      routeData.forEach(route => {
        const sourceId = `route-source-${route.id}`;
        const layerId = `route-layer-${route.id}`;
        const coords = route.coordinates;
        
        // Drawing logic
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

        // Gradient logic for safe route
        if (route.id === 'safe' && map.current && map.current.getLayer(layerId)) {
           map.current.setPaintProperty(layerId, 'line-gradient', [
             'interpolate',
             ['linear'],
             ['line-progress'],
             0, '#10b981',
             gradientOffset, '#6ee7b7',
             1, '#10b981'
           ]);
        }
      });

      if (progress < maxSteps || gradientOffset > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);

    // Auto-fit bounds
    const bounds = new maplibregl.LngLatBounds();
    routeData.forEach(r => r.coordinates.forEach(c => bounds.extend(c)));
    map.current.fitBounds(bounds, { 
      padding: { top: 120, bottom: 120, left: 120, right: 380 }, 
      duration: 2000,
      pitch: 45,
      essential: true
    });
  };

  // Night Safety Marker Logic
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
        width: 30px;
        height: 30px;
        background: ${color};
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 0 30px ${color}, 0 0 60px ${color}40;
        cursor: pointer;
        animation: pulse-marker 1.5s infinite;
      `;

      nightMarker.current = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup({ offset: 25, className: 'glass-popup' })
          .setHTML(`
            <div class="text-center">
              <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Night Safety Link</div>
              <div class="text-xl font-black mb-1" style="color: ${color}">${score}</div>
              <div class="text-[10px] font-bold uppercase" style="color: ${color}">${status}</div>
            </div>
          `))
        .addTo(map.current);

      map.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        pitch: 60,
        essential: true
      });

      // Add a circle radius layer
      const sourceId = 'night-safety-radius';
      const layerId = 'night-safety-layer';

      if (map.current.getSource(sourceId)) {
        map.current.removeLayer(layerId);
        map.current.removeSource(sourceId);
      }

      // Generate a circle
      const points = 64;
      const radius = 0.5; // km
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
          'fill-opacity': 0.15,
          'fill-outline-color': color
        }
      });
    }
  }, [nightSafetyPoint, mapLoaded]);

  // Live User Location Marker Logic
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
          <div class="text-xs font-black uppercase text-blue-400 mb-1">Live Position</div>
          <div class="text-white text-[10px] font-bold">You are here</div>
        `))
        .addTo(map.current);
    }

    // Smoothly fly to user location on first detection
    if (userLocation && !showRoutes) {
      map.current.flyTo({
        center: userLocation,
        zoom: 14,
        speed: 0.8,
        curve: 1,
        essential: true,
        pitch: 60
      });
    }
  }, [userLocation, mapLoaded, showRoutes]);

  useEffect(() => {
    if (showRoutes && destination?.lng && mapLoaded) {
       fetchRoutesAndSafety(startCoords, [destination.lng, destination.lat]);
    }
  }, [destination, showRoutes, mapLoaded]);

  if (!isValidKey(MAP_KEY)) {
    return (
      <div className="w-full h-[600px] bg-slate-900 border-2 border-red-500/30 rounded-3xl flex flex-col items-center justify-center p-8 text-center glass-panel">
        <FiAlertTriangle className="text-red-500 text-6xl mb-4 animate-pulse" />
        <h3 className="text-red-400 text-xl font-bold mb-2">Neural Link Disconnected</h3>
        <p className="text-slate-400 max-w-md">Please check your <code>.env</code> configuration. Ensure <code>VITE_MAPTILER_KEY</code> is set with a valid token.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-900 group"
      id="map-container"
      style={{ height: '700px' }}
    >
      <AnimatePresence>
        {!mapLoaded && (
          <motion.div 
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-40 bg-slate-900 flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiActivity className="text-cyan-500 text-xl animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-cyan-400 font-black tracking-[0.3em] uppercase text-sm mb-2">Initializing AI Engine</p>
              <p className="text-slate-500 text-xs">Calibrating neural map grid...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-5 border border-cyan-500/30">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-emerald-400 font-black uppercase tracking-widest text-xs animate-pulse">Calculating Safest Trajectory...</p>
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
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 glass-panel px-6 py-4 rounded-2xl text-sm font-bold text-red-400 flex items-center gap-3 border border-red-500/30 shadow-2xl bg-slate-900/80"
        >
          <FiAlertTriangle className="text-xl" /> 
          <div>
            <p className="text-white font-bold mb-1">Routing Degraded</p>
            <p className="text-red-200/70 text-xs">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-4 px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/30 transition-colors">
            Dismiss
          </button>
        </motion.div>
      )}
      
      {/* Engine Status Panel */}
      <div className="absolute top-6 left-6 z-20 glass-panel px-5 py-3 rounded-2xl text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${styleError ? 'bg-red-500' : 'bg-cyan-500'} animate-pulse`}></div>
        {styleError ? "Engine Offline" : "Neural Route Engine V2"}
      </div>

      {/* Floating Route Cards */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4 w-[320px] max-h-[90%] overflow-y-auto pr-2 pb-4 scrollbar-hide">
        {routes.map((route, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.2 + 0.5 }}
            key={route.id}
            whileHover={{ scale: 1.02, x: -5 }}
            className={`glass-panel p-5 rounded-2xl flex flex-col gap-3 group relative overflow-hidden ${
              route.id === 'safe' ? 'border-emerald-500/30' : 'border-red-500/30'
            }`}
          >
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${
              route.id === 'safe' ? 'bg-emerald-500' : 'bg-red-500'
            }`}></div>

            <div className="flex justify-between items-center relative z-10">
              <span className={`text-sm font-black uppercase tracking-widest ${
                route.id === 'safe' ? 'text-emerald-400' : 'text-red-400'
              }`}>{route.label}</span>
              <span className="text-xs font-bold text-slate-300 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700">{route.distance} km</span>
            </div>

            <div className="flex justify-between items-end relative z-10 mt-2">
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1 mb-1"><FiClock /> ETA</p>
                <p className="text-2xl font-bold text-white">{route.duration} <span className="text-sm font-medium text-slate-400">min</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 flex items-center gap-1 justify-end mb-1">Safety <FiShield className={route.id === 'safe' ? 'text-emerald-500' : 'text-red-500'} /></p>
                <p className="text-3xl font-black" style={{ color: route.color }}>{route.score}</p>
              </div>
            </div>
            
            {route.crimeReduction > 0 && (
               <div className="mt-2 text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 py-1.5 px-3 rounded-lg border border-emerald-500/20 text-center">
                 Crime Exposure Reduced by {route.crimeReduction}%
               </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Locate Me Button */}
      <button 
        onClick={onLocateMe}
        className="absolute bottom-10 left-6 z-20 w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-all border border-slate-200 group"
        title="Locate Me"
      >
        <FiNavigation className="text-xl group-hover:text-blue-600 transition-colors" />
        <div className="absolute left-16 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest border border-slate-700">
          Locate Me
        </div>
      </button>
    </motion.div>
  );
};

export default RouteSafetyMap;
