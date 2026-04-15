/**
 * EnviroHealth Hub - Universal API Layer
 * Fetches globally available data via free Open-Meteo services.
 * GitHub Pages compatible — all APIs support CORS.
 */

async function getCityFromCoords(lat, lon) {
    try {
        // Use Open-Meteo geocoding reverse lookup (no special headers needed, CORS safe)
        const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
        const res = await fetch(nomUrl);
        const data = await res.json();

        let addr = data.address || {};
        let items = [
            addr.amenity,
            addr.neighbourhood,
            addr.suburb,
            addr.residential,
            addr.village,
            addr.town,
            addr.city,
            addr.district,
            addr.county
        ].filter(Boolean);

        // Remove names containing "Ward" as they are confusing
        items = items.filter(i => !i.toLowerCase().includes("ward"));

        let city = items.length > 0
            ? items.slice(0, 2).join(", ")
            : (data.name || "Unknown Location");

        return city;
    } catch (e) {
        console.warn("Reverse geocoding failed:", e);
        return "Unknown Location";
    }
}

function getDeviceLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const city = await getCityFromCoords(lat, lon);
                resolve({
                    name: city !== "Unknown Location" ? city : "GPS Location",
                    lat: lat,
                    lon: lon
                });
            },
            () => { resolve(null); },
            { timeout: 10000 }
        );
    });
}

async function getCityData(cityName, exactLat, exactLon) {
    try {
        let lat, lon, name, country;
        const OWM_KEY = "31df7b8e7bc1c3fec4edad8efaeecba8";

        // Normalize: treat undefined/null/NaN the same
        const hasCoords = (exactLat != null && exactLon != null &&
                           !isNaN(exactLat) && !isNaN(exactLon));

        if (hasCoords) {
            lat = exactLat;
            lon = exactLon;
            name = cityName || "Custom Location";
            country = "GPS Coordinates";
        } else {
            // ── STEP 1: Open-Meteo geocoding (India preference) ──────────────
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=en&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            let cityInfo = null;
            if (geoData.results && geoData.results.length > 0) {
                // Prefer India result
                cityInfo = geoData.results.find(r => r.country_code === "IN")
                        || geoData.results[0];
            }

            if (cityInfo) {
                lat = cityInfo.latitude;
                lon = cityInfo.longitude;
                name = cityInfo.name;
                country = cityInfo.country || "India";
            } else {
                // ── STEP 2: Nominatim fallback (India-only) ──────────────────
                const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&countrycodes=in&format=json&limit=1`;
                const nomRes = await fetch(nomUrl);
                const nomData = await nomRes.json();

                if (nomData && nomData.length > 0) {
                    lat = parseFloat(nomData[0].lat);
                    lon = parseFloat(nomData[0].lon);
                    const parts = nomData[0].display_name.split(",").map(s => s.trim());
                    name = parts[0];
                    country = "India";
                } else {
                    throw new Error(`"${cityName}" not found. Please check the spelling.`);
                }
            }
        }

        // ── Weather: OpenWeatherMap (primary for wind/humidity) ──────────────
        const owmWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`;
        const owmAqiUrl     = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`;

        // ── Weather: Open-Meteo (accurate temp, UV, precip) ─────────────────
        const meteoCurrentUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,uv_index,precipitation&timezone=auto`;

        // ── AQI: Open-Meteo Air Quality ───────────────────────────────────────
        const meteoAqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5&hourly=european_aqi&past_days=1&forecast_days=3&timezone=auto`;

        // Fetch all in parallel; fail gracefully if one errors
        const [owmRes, owmAqiRes, meteoCurrentRes, meteoAqiDataRes] = await Promise.allSettled([
            fetch(owmWeatherUrl),
            fetch(owmAqiUrl),
            fetch(meteoCurrentUrl),
            fetch(meteoAqiUrl)
        ]);

        // Parse JSON safely
        const safeJson = async (settled) => {
            if (settled.status !== "fulfilled") return {};
            try { return await settled.value.json(); } catch { return {}; }
        };

        const owmData        = await safeJson(owmRes);
        const owmAqiData     = await safeJson(owmAqiRes);
        const meteoCurrentData = await safeJson(meteoCurrentRes);
        const meteoAqiData   = await safeJson(meteoAqiDataRes);

        // ── Temperature / Weather values ──────────────────────────────────────
        const meteoCurrent = meteoCurrentData.current || {};
        const temp      = meteoCurrent.temperature_2m ?? owmData.main?.temp ?? 0;
        const feelsLike = meteoCurrent.apparent_temperature ?? owmData.main?.feels_like ?? temp;
        const humidity  = meteoCurrent.relative_humidity_2m ?? owmData.main?.humidity ?? 0;
        const windSpeed = Math.round((meteoCurrent.wind_speed_10m ?? ((owmData.wind?.speed || 0) * 3.6)) || 0);
        const windDir   = meteoCurrent.wind_direction_10m ?? owmData.wind?.deg ?? null;
        const exactUv   = meteoCurrent.uv_index ?? 0;
        const exactPrecip = meteoCurrent.precipitation ?? (owmData.rain?.['1h'] || 0);

        // ── AQI value ─────────────────────────────────────────────────────────
        let mainAqi = 0;
        if (meteoAqiData.current && meteoAqiData.current.european_aqi != null) {
            mainAqi = Math.round(meteoAqiData.current.european_aqi);
        } else if (owmAqiData.list && owmAqiData.list.length > 0) {
            // Convert OWM PM2.5 to approximate AQI
            const pm25 = owmAqiData.list[0].components?.pm2_5 || 0;
            if (pm25 <= 12)         mainAqi = Math.round((50 / 12) * pm25);
            else if (pm25 <= 35.4)  mainAqi = Math.round(50  + ((100 - 50)  / (35.4 - 12))   * (pm25 - 12));
            else if (pm25 <= 55.4)  mainAqi = Math.round(100 + ((150 - 100) / (55.4 - 35.4)) * (pm25 - 35.4));
            else if (pm25 <= 150.4) mainAqi = Math.round(150 + ((200 - 150) / (150.4 - 55.4))* (pm25 - 55.4));
            else                    mainAqi = Math.round(200 + ((300 - 200) / (250.4 - 150.4))* (pm25 - 150.4));
        }

        // ── Yesterday AQI ─────────────────────────────────────────────────────
        const yesterdayAqi = (meteoAqiData.hourly && meteoAqiData.hourly.european_aqi)
            ? (meteoAqiData.hourly.european_aqi[0] ?? mainAqi)
            : mainAqi;

        // ── Forecast / Chart data ─────────────────────────────────────────────
        const times = meteoAqiData.hourly?.time || [];
        const aqis  = meteoAqiData.hourly?.european_aqi || [];

        const forecastHistory = { labels: [], data: [] };
        for (let i = 0; i < times.length; i++) {
            if (times[i].includes("12:00")) {
                const dateObj = new Date(times[i]);
                const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                forecastHistory.labels.push(dayName);
                forecastHistory.data.push(aqis[i] || 0);
            }
        }

        return {
            name, country, lat, lon,
            temp, feelsLike, humidity,
            windSpeed, windDir,
            uv: exactUv,
            precip: exactPrecip,
            aqi: mainAqi,
            yesterdayAqi,
            pm25: meteoAqiData.current?.pm2_5 ?? (owmAqiData.list?.[0]?.components?.pm2_5 ?? 0),
            forecastHistory
        };

    } catch (error) {
        console.error("getCityData error:", error);
        return null;
    }
}