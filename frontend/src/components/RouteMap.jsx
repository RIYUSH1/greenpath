import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiMap } from "react-icons/fi";

const MAP_KEY = import.meta.env.VITE_MAPTILER_KEY;
console.log("Using Map Key:", MAP_KEY);

const isValidKey = (key) => key && key !== "your_key_here" && !key.includes("token");

const RouteMap = ({ origin, destination, ecoPreferences }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [styleError, setStyleError] = useState(false);

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

    const mTileStyle = `https://api.maptiler.com/maps/streets/style.json?key=${MAP_KEY}`;
    const fallbackStyle = "https://demotiles.maplibre.org/style.json";
    const initialStyle = !styleError ? mTileStyle : fallbackStyle;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: initialStyle,
        center: origin ? [origin[1], origin[0]] : [77.209, 28.6139],
        zoom: 12,
        attributionControl: false
      });

      map.current.addControl(new maplibregl.AttributionControl(), 'bottom-right');

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        if (!styleError && (e.error?.status === 403 || e.error?.status === 401)) {
          setStyleError(true);
          map.current.setStyle(fallbackStyle);
        }
      });
    } catch (err) {
      console.error("[RouteMap] Init Error:", err);
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

  if (!isValidKey(MAP_KEY)) {
    return (
      <div className="w-full h-[500px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-300">
        <FiAlertTriangle className="text-red-500 text-5xl mb-4" />
        <h3 className="text-slate-800 font-bold mb-2">Map Engine Connection Required</h3>
        <p className="text-slate-500 text-xs max-w-sm">
          MapTiler API Key is missing. Update your <code>.env</code> with a valid <code>VITE_MAPTILER_KEY</code> to enable full spatial intelligence.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200" style={{ height: "500px" }}>
      <AnimatePresence>
        {!mapLoaded && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-slate-50 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Routing Workspace Booting...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600">Geo-Lattice Active</span>
      </div>
    </div>
  );
};

export default RouteMap;

