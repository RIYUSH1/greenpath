import { pythonClient } from "./apiClient";

export const fetchNightSafety = async ({ place }) => {
  const response = await pythonClient.post("/api/night-safety", {
    place,
  });
  return response.data;
};
