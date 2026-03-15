import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api/config";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* 🔥 HEATMAP LAYER COMPONENT */
function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // Convert backend data → leaflet heat format
    const heatData = points.map((p) => [
      p.lat,
      p.lng,
      (p.score ?? 5) / 10, // normalize 0–1
    ]);

    const heatLayer = L.heatLayer(heatData, {
      radius: 45,
      blur: 30,
      maxZoom: 13,
      gradient: {
        0.2: "green",
        0.5: "yellow",
        0.7: "orange",
        1.0: "red",
      },
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

export default function MapPreview({ place }) {
  const [heatmap, setHeatmap] = useState([]);
  const [center, setCenter] = useState([28.6139, 77.2090]); // Delhi default

  useEffect(() => {
    if (!place) return;

    console.log("📍 Fetching heatmap for:", place);

    fetch(`${API_BASE_URL}/api/night-safety-heatmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ place, time: 22 }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🔥 Heatmap API response:", data);

        if (data.heatmap && data.heatmap.length > 0) {
          setHeatmap(data.heatmap);
          setCenter([data.heatmap[0].lat, data.heatmap[0].lng]);
        } else {
          console.warn("⚠️ No heatmap data returned");
          setHeatmap([]);
        }
      })
      .catch((err) => console.error("❌ Heatmap error:", err));
  }, [place]);

  return (
    <div className="rounded-2xl overflow-hidden border border-green-700/50 shadow-2xl">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "360px", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🔥 REAL HEATMAP */}
        <HeatmapLayer points={heatmap} />
      </MapContainer>
    </div>
  );
}
