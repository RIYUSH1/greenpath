import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";

const RouteMap = ({ origin, destination, ecoPreferences }) => {
  useEffect(() => {
    if (!origin || !destination) return;

    // 🗺️ Create map
    const map = L.map("map").setView(origin, 13);

    // 🌍 Base Layer
    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // 🛰️ Satellite
    const satellite = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      { attribution: "&copy; Google Satellite" }
    );

    // 🚦 Traffic
    const traffic = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=h,traffic&x={x}&y={y}&z={z}",
      { attribution: "&copy; Google Traffic" }
    );

    // 🧭 Layer Control
    L.control.layers(
      { OpenStreetMap: osm, Satellite: satellite, Traffic: traffic },
      {}
    ).addTo(map);

    /* ===========================
       🎯 PERSONALIZED ROUTING
       =========================== */

    // Default routing profile
    let routingOptions = {
      waypoints: [
        L.latLng(origin[0], origin[1]),
        L.latLng(destination[0], destination[1]),
      ],
      routeWhileDragging: true,
      geocoder: L.Control.Geocoder.nominatim(),
      lineOptions: {
        styles: [{ color: "#2ecc71", weight: 6 }], // green route
      },
    };

    // 🚴 Transport-based personalization
    if (ecoPreferences?.transportMode === "cycling") {
      routingOptions.lineOptions.styles[0].color = "#27ae60";
      console.log("🚴 Cycling-friendly route");
    }

    if (ecoPreferences?.transportMode === "walking") {
      routingOptions.lineOptions.styles[0].color = "#3498db";
      console.log("🚶 Walking-friendly route");
    }

    // 🌱 Eco goal personalization
    if (ecoPreferences?.ecoGoal === "low_co2") {
      routingOptions.lineOptions.styles[0].color = "#16a085";
      console.log("🌱 Optimizing for low CO₂");
    }

    if (ecoPreferences?.ecoGoal === "safety") {
      traffic.addTo(map); // show traffic layer for safety awareness
      routingOptions.lineOptions.styles[0].color = "#f39c12";
      console.log("🛡 Safety-focused route");
    }

    // 🚗 Add route
    const routingControl = L.Routing.control(routingOptions).addTo(map);

    return () => {
      map.remove();
    };
  }, [origin, destination, ecoPreferences]);

  return <div id="map" style={{ height: "500px", width: "100%" }} />;
};

export default RouteMap;
