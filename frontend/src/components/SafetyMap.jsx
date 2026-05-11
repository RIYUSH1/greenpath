import React, { useEffect, useRef, useState } from 'react';
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiShield } from 'react-icons/fi';

const MAP_KEY = import.meta.env.VITE_MAPTILER_KEY;
console.log("Using Map Key:", MAP_KEY);

const isValidKey = (key) => key && key !== "your_key_here" && !key.includes("token");

const SafetyMap = ({ coordinates, score }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [styleError, setStyleError] = useState(false);

  const getSafetyInfo = (s) => {
    if (s >= 70) return { color: '#10b981', status: 'Safe' };
    if (s >= 40) return { color: '#f59e0b', status: 'Moderate' };
    return { color: '#ef4444', status: 'Risk' };
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Safe re-initialization
    if (map.current) {
      try {
        if (typeof map.current.remove === "function") {
          map.current.remove();
        }
      } catch (err) {
        console.warn("Re-init cleanup failed:", err);
      }
      map.current = null;
    }

    if (!isValidKey(MAP_KEY)) return;

    const mTileStyle = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAP_KEY}`;
    const fallbackStyle = "https://demotiles.maplibre.org/style.json";
    const initialStyle = !styleError ? mTileStyle : fallbackStyle;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: initialStyle,
        center: coordinates || [77.209, 28.6139],
        zoom: 12,
        pitch: 45,
        bearing: -10,
        attributionControl: false
      });

      map.current.addControl(new maplibregl.AttributionControl(), 'bottom-right');
      map.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

      map.current.on('error', (e) => {
        if (!styleError && (e.error?.status === 403 || e.error?.status === 401)) {
          setStyleError(true);
          map.current.setStyle(fallbackStyle);
        }
      });
    } catch (err) {
      console.error("[SafetyMap] Init Error:", err);
    }

    // Safe cleanup
    return () => {
      try {
        if (map.current && typeof map.current.remove === "function") {
          map.current.remove();
        }
      } catch (err) {
        console.warn("Map cleanup skipped:", err);
      } finally {
        map.current = null;
      }
    };
  }, [styleError]);

  useEffect(() => {
    if (!map.current || !coordinates) return;

    const { color, status } = getSafetyInfo(score);
    map.current.flyTo({ center: coordinates, zoom: 14, pitch: 60, essential: true });

    if (marker.current) {
      marker.current.remove();
    }

    const el = document.createElement('div');
    el.className = 'safety-marker';
    el.style.backgroundColor = color;
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.border = '3px solid #0f172a';
    el.style.boxShadow = `0 0 20px ${color}`;
    el.style.cursor = 'pointer';

    marker.current = new maplibregl.Marker({ element: el })
      .setLngLat(coordinates)
      .setPopup(
        new maplibregl.Popup({ offset: 30, closeButton: false })
          .setHTML(`
            <div style="padding: 12px; font-family: 'Inter', sans-serif; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); border-radius: 12px; color: white; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
              <h4 style="margin: 0; color: ${color}; font-weight: 800; font-size: 14px;">${status.toUpperCase()}</h4>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Safety Index: <b style="color: white;">${score}</b></p>
            </div>
          `)
      )
      .addTo(map.current);

  }, [coordinates, score]);

  if (!isValidKey(MAP_KEY)) {
    return (
      <div className="w-full h-[400px] bg-slate-900 rounded-3xl flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-700">
        <FiAlertTriangle className="text-amber-500 text-4xl mb-3 animate-pulse" />
        <p className="text-slate-300 font-bold text-sm">Map Provider Disabled</p>
        <p className="text-slate-500 text-xs max-w-[200px] mt-1">Configure your MapTiler API Key in the environment settings.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full overflow-hidden rounded-3xl shadow-2xl border border-slate-700/50 relative bg-slate-900" 
      style={{ height: '400px' }}
    >
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute bottom-6 left-6 z-10 bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black border border-slate-700/50 text-slate-300 uppercase tracking-widest shadow-xl flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <FiShield className="inline" /> Safety Layer Active
      </div>
    </motion.div>
  );
};

export default SafetyMap;
