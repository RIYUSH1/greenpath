import requests
import math
import os

def get_nearest_police_distance(lat, lng, radius=2000):
    try:
        # ✅ Correct: ENV VARIABLE NAME
        api_key = os.getenv("GOOGLE_PLACES_API_KEY")

        if not api_key:
            print("POLICE API KEY MISSING")
            return None

        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": f"{lat},{lng}",
            "radius": radius,
            "type": "police",
            "key": api_key
        }

        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if data.get("status") != "OK" or not data.get("results"):
            print("POLICE API FAILED:", data.get("status"))
            return None

        police = data["results"][0]["geometry"]["location"]

        # Haversine formula
        R = 6371  # Earth radius (km)
        dlat = math.radians(police["lat"] - lat)
        dlon = math.radians(police["lng"] - lng)

        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat))
            * math.cos(math.radians(police["lat"]))
            * math.sin(dlon / 2) ** 2
        )

        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return round(R * c * 1000, 2)  # meters

    except Exception as e:
        print("POLICE API ERROR:", e)
        return None
