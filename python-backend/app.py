print("🔥 THIS IS THE CORRECT app.py FILE 🔥")

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import pathlib
import joblib

# =====================================================
# ENV SETUP
# =====================================================
BASE_DIR = pathlib.Path(__file__).parent
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

print("DEBUG GOOGLE KEY:", os.getenv("GOOGLE_PLACES_API_KEY"))

# =====================================================
# LOAD ML MODEL
# =====================================================
model = joblib.load(BASE_DIR / "night_safety_model.pkl")
encoder = joblib.load(BASE_DIR / "label_encoder.pkl")
print("✅ AI Model loaded successfully")

# =====================================================
# IMPORT DATA SOURCES
# =====================================================
from police import get_nearest_police_distance
from accidents import get_accident_count
from streetlight import get_streetlight_density
from geocode import geocode_place

# =====================================================
# APP SETUP
# =====================================================
app = Flask(__name__)
CORS(app)

# =====================================================
# ERROR HANDLER
# =====================================================
@app.errorhandler(Exception)
def handle_exception(e):
    print("❌ BACKEND ERROR:", e)
    return jsonify({"error": str(e)}), 500

# =====================================================
# BASIC ROUTES
# =====================================================
@app.route("/")
def home():
    return "GreenPath Python Backend Running"

@app.route("/api/test")
def test():
    return jsonify({"status": "API OK"})

# =====================================================
# NIGHT SAFETY SCORE API
# =====================================================
@app.route("/api/night-safety", methods=["POST"])
def night_safety():
    data = request.json or {}
    place = data.get("place")

    if not place:
        return jsonify({"error": "Place required"}), 400

    lat, lng = geocode_place(place)
    if lat is None:
        return jsonify({"error": "Invalid place"}), 400

    police_distance = get_nearest_police_distance(lat, lng)
    accidents = get_accident_count(lat, lng)
    street_data = get_streetlight_density(lat, lng)

    streetlights = street_data.get("streetlights", 0)
    street_density = street_data.get("density", 0)

    women_rating = 4.2

    # Rule-based score
    score = round((
        0.3 * min(street_density / 30, 1) +
        0.25 * (1 - min(accidents / 10, 1)) +
        0.2 * (1 if police_distance and police_distance < 1000 else 0.4) +
        0.25 * (women_rating / 5)
    ) * 10, 2)

    # AI prediction
    ai_pred = model.predict([[
        streetlights,
        accidents,
        police_distance if police_distance else 2000
    ]])

    ai_label = encoder.inverse_transform(ai_pred)[0]

    print("AI INPUTS:", streetlights, accidents, police_distance)
    print("AI OUTPUT:", ai_label)

    return jsonify({
        "score": score,
        "ai_label": ai_label
    })

# =====================================================
# 🔥 HEATMAP FEATURE
# =====================================================

def generate_grid(lat, lng, step=0.005):
    points = []
    for i in range(-2, 3):
        for j in range(-2, 3):
            points.append({
                "lat": lat + i * step,
                "lng": lng + j * step
            })
    return points

def score_to_color(label):
    if label == "Unsafe":
        return "red"
    elif label == "Moderate":
        return "orange"
    return "green"

@app.route("/api/night-safety-heatmap", methods=["POST"])
def night_safety_heatmap():
    data = request.json or {}
    place = data.get("place")

    if not place:
        return jsonify({"error": "Place required"}), 400

    lat, lng = geocode_place(place)
    if lat is None:
        return jsonify({"error": "Invalid place"}), 400

    grid = generate_grid(lat, lng)
    heatmap = []

    for p in grid:
        police_distance = get_nearest_police_distance(p["lat"], p["lng"])
        accidents = get_accident_count(p["lat"], p["lng"])
        street_data = get_streetlight_density(p["lat"], p["lng"])
        streetlights = street_data.get("streetlights", 0)

        ai_pred = model.predict([[
            streetlights,
            accidents,
            police_distance if police_distance else 2000
        ]])

        label = encoder.inverse_transform(ai_pred)[0]

        heatmap.append({
            "lat": p["lat"],
            "lng": p["lng"],
            "label": label,
            "color": score_to_color(label)
        })

    print(f"🔥 Heatmap generated for {place} with {len(heatmap)} points")

    return jsonify({
        "place": place,
        "heatmap": heatmap
    })

# =====================================================
# RUN SERVER
# =====================================================
if __name__ == "__main__":
    app.run(port=5000, debug=False, use_reloader=False)
