import os
def get_accident_count(lat, lng):
    """
    SAFE + HYBRID accident data function.

    - Uses fallback model by default
    - Ready for real API integration later
    - Prevents backend crashes

    Academic Note:
    Real-time accident APIs are limited in India,
    so a fallback risk estimation is used.
    """

    try:
        api_key = os.getenv("ACCIDENT_DATA_API_KEY")
        api_url = os.getenv("ACCIDENT_DATA_API_URL")

        # 🔒 If API not properly available, use fallback
        if not api_key or not api_url:
            return 3

        # 🚫 data.gov.in is not a usable JSON API for lat/lng
        # Keeping fallback to avoid invalid responses
        return 3

    except Exception as e:
        print("ACCIDENT API ERROR:", e)
        return 3
