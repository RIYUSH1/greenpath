// utils/ecoPreferences.js

const DEFAULT_PREFS = {
  transportMode: "cycling",     // walking | cycling | car
  ecoGoal: "low_co2",           // low_co2 | safety | health
  maxDistanceKm: 6,
};

export const getEcoPreferences = () => {
  const saved = localStorage.getItem("ecoPreferences");
  return saved ? JSON.parse(saved) : DEFAULT_PREFS;
};

export const saveEcoPreferences = (prefs) => {
  localStorage.setItem("ecoPreferences", JSON.stringify(prefs));
};
