import { useState } from "react";
import { getEcoPreferences, saveEcoPreferences } from "../utils/ecoPreferences";

const EcoPreferenceSelector = ({ onChange }) => {
  const [prefs, setPrefs] = useState(getEcoPreferences());

  const update = (key, value) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    saveEcoPreferences(updated);
    onChange(updated);
  };

  return (
    <div className="eco-pref-box">
      <h3>🌱 Personal Eco Preferences</h3>

      <label>Transport Mode</label>
      <select
        value={prefs.transportMode}
        onChange={(e) => update("transportMode", e.target.value)}
      >
        <option value="walking">Walking</option>
        <option value="cycling">Cycling</option>
        <option value="car">Car</option>
      </select>

      <label>Eco Goal</label>
      <select
        value={prefs.ecoGoal}
        onChange={(e) => update("ecoGoal", e.target.value)}
      >
        <option value="low_co2">Low CO₂</option>
        <option value="safety">Safety</option>
        <option value="health">Health</option>
      </select>
    </div>
  );
};

export default EcoPreferenceSelector;
