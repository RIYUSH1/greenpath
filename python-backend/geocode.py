import requests
import os

def geocode_place(place_name):
    """
    HYBRID geocoding function.

    Priority:
    1. Offline fallback for major Indian cities (no billing required)
    2. Google Geocoding API (if billing is enabled later)

    Guarantees:
    - No backend crash
    - Always returns (lat, lng) or (None, None)
    """

    try:
        # ---------- OFFLINE FALLBACK (PRIMARY) ----------
        fallback = {
            "mumbai": (19.0760, 72.8777),
            "delhi": (28.6139, 77.2090),
            "chennai": (13.0827, 80.2707),
            "bangalore": (12.9716, 77.5946),
            "bengaluru": (12.9716, 77.5946),
            "hyderabad": (17.3850, 78.4867),
            "kolkata": (22.5726, 88.3639),
            "pune": (18.5204, 73.8567),
            "ahmedabad": (23.0225, 72.5714),
            "jaipur": (26.9124, 75.7873)
        }

        place_key = place_name.lower().strip()
        if place_key in fallback:
            return fallback[place_key]

        # ---------- GOOGLE GEOCODING (SECONDARY) ----------
        api_key = os.getenv("GOOGLE_PLACES_API_KEY")

        if not api_key:
            return None, None

        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            "address": f"{place_name}, India",
            "key": api_key
        }

        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if data.get("status") != "OK":
            print("GEOCODE FAILED:", data.get("status"))
            return None, None

        location = data["results"][0]["geometry"]["location"]
        return location["lat"], location["lng"]

    except Exception as e:
        print("GEOCODE ERROR:", e)
        return None, None
