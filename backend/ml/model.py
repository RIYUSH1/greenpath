import sys
import json
import pathlib
import joblib

def main():
    try:
        if len(sys.argv) < 4:
            raise ValueError("Missing arguments: streetlights, accidents, police_distance")
            
        streetlights = float(sys.argv[1])
        accidents = float(sys.argv[2])
        police_distance = float(sys.argv[3])
        
        BASE_DIR = pathlib.Path(__file__).parent
        
        # Load models
        model = joblib.load(BASE_DIR / "safety_model.pkl")
        encoder = joblib.load(BASE_DIR / "label_encoder.pkl")
        
        # Predict
        ai_pred = model.predict([[streetlights, accidents, police_distance]])
        ai_label = encoder.inverse_transform(ai_pred)[0]
        
        print(json.dumps({"status": "success", "label": ai_label}))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))

if __name__ == "__main__":
    main()
