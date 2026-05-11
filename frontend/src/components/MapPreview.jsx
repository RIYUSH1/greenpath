import { useEffect, useState, useRef } from "react";
import * as maptilersdk from "@maptiler/sdk";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { API_BASE_URL } from "../api/config";

const MAP_KEY = import.meta.env.VITE_MAPTILER_KEY;
const isMapTilerValid = MAP_KEY && MAP_KEY !== "your_key_here";

console.log("MapPreview - MapTiler Key:", MAP_KEY);
console.log("MapPreview - Is Key Valid:", isMapTilerValid);

if (isMapTilerValid) {
  maptilersdk.config.apiKey = MAP_KEY;
}

export default function MapPreview({ place }) {

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [heatmap, setHeatmap] = useState([]);
  const [center, setCenter] = useState([77.2090, 28.6139]); // Delhi default [lng, lat]

  // Fetch Heatmap Data
  useEffect(() => {
    if (!place) return;

    fetch(`${API_BASE_URL}/api/night-safety-heatmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ place, time: 22 }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.heatmap && data.heatmap.length > 0) {
          setHeatmap(data.heatmap);
          const first = data.heatmap[0];
          setCenter([first.lng, first.lat]);
        }
      })
      .catch((err) => console.error("❌ Heatmap error:", err));
  }, [place]);

    const [styleError, setStyleError] = useState(false);

    useEffect(() => {
      if (!mapContainer.current) return;

      const mTileStyle = `https://api.maptiler.com/maps/streets/style.json?key=${MAP_KEY}`;
      const fallbackStyle = "https://demotiles.maplibre.org/style.json";
      
      const currentStyle = (isMapTilerValid && !styleError) ? mTileStyle : fallbackStyle;

      if (!map.current) {
        try {
          map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: currentStyle,
            center: center,
            zoom: 12,
            attributionControl: false
          });

          map.current.addControl(new maplibregl.AttributionControl(), 'bottom-right');

          map.current.on('error', (e) => {
            console.error("[MapPreview] Map error:", e.error);
            if (!styleError && isMapTilerValid && (e.error?.status === 403 || e.error?.status === 401)) {
              console.warn("[MapPreview] MapTiler failed, falling back...");
              setStyleError(true);
              map.current.setStyle(fallbackStyle);
            }
          });
        } catch (err) {
          console.error("[MapPreview] Critical Init Error:", err);
        }
      } else {
        if (!styleError) {
           map.current.flyTo({ center, duration: 1000 });
        }
      }

    map.current.on('style.load', () => {
      // Add Heatmap Layer
      if (heatmap.length > 0) {
        if (map.current.getSource('heatmap-points')) {
          map.current.getSource('heatmap-points').setData({
            type: 'FeatureCollection',
            features: heatmap.map(p => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
              properties: { intensity: (p.score || 5) / 10 }
            }))
          });
        } else {
          map.current.addSource('heatmap-points', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: heatmap.map(p => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
                properties: { intensity: (p.score || 5) / 10 }
              }))
            }
          });

          map.current.addLayer({
            id: 'heatmap-layer',
            type: 'heatmap',
            source: 'heatmap-points',
            paint: {
              'heatmap-weight': ['get', 'intensity'],
              'heatmap-intensity': 1,
              'heatmap-radius': 15,
              'heatmap-opacity': 0.7,
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0, 255, 0, 0)',
                0.2, 'green',
                0.5, 'yellow',
                0.8, 'orange',
                1, 'red'
              ]
            }
          });
        }
      }
    });

    return () => {
      // Cleanup happens only on unmount
    };
  }, [center, heatmap, styleError]);

  return (
    <div className="rounded-2xl overflow-hidden border border-green-700/50 shadow-2xl relative" style={{ height: "360px" }}>
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/20">
        AI Heatmap: {(isMapTilerValid && !styleError) ? "MapTiler" : "Fallback"}
      </div>
    </div>
  );
}

