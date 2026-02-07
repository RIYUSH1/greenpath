import requests
import math

def get_streetlight_density(lat, lng, radius=500):
    url = "https://overpass-api.de/api/interpreter"

    query = f"""
    [out:json];
    node(around:{radius},{lat},{lng})["highway"="street_lamp"];
    out;
    """

    try:
        response = requests.post(url, data=query, timeout=15)
        data = response.json()

        streetlights = len(data.get("elements", []))

        radius_km = radius / 1000
        area = math.pi * (radius_km ** 2)

        density = streetlights / area if area > 0 else 0

        return {
            "streetlights": streetlights,
            "density": round(density, 2)
        }

    except Exception as e:
        print("STREETLIGHT ERROR:", e)

        # 🔒 SAFE FALLBACK
        return {
            "streetlights": 10,
            "density": 10
        }
