import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";

export default function RouteMap({ origin, destination }) {
  useEffect(() => {
    if (!origin || !destination) return;

    const map = L.map("map").setView(origin, 13);

    // 🗺️ Base Layers
    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // 🛰️ Satellite Layer (Google)
    const satellite = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      {
        attribution: "&copy; Google Satellite",
      }
    );

    // 🚦 Traffic Layer (Google)
    const traffic = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=h,traffic&x={x}&y={y}&z={z}",
      {
        attribution: "&copy; Google Traffic",
      }
    );

    // 🌍 Layer Control
    L.control.layers(
      { "OpenStreetMap": osm, "Satellite": satellite, "Traffic": traffic },
      {}
    ).addTo(map);

    // 🚗 Route between origin and destination
    L.Routing.control({
      waypoints: [L.latLng(origin[0], origin[1]), L.latLng(destination[0], destination[1])],
      routeWhileDragging: true,
      geocoder: L.Control.Geocoder.nominatim(),
    }).addTo(map);

    return () => map.remove();
  }, [origin, destination]);

  return <div id="map"></div>;
}
