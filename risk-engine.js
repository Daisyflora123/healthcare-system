/**
 * EnviroHealth Hub - Health Risk Engine
 * Simple, friendly advice in plain India-friendly language.
 */

function calculateRisk(cityData, profilesArray) {
    const { aqi, temp, uv, precip, humidity } = cityData;

    // ── Default: Good conditions ──────────────────────────────────────────────
    let risk = {
        level: "✅ All Clear — Low Risk",
        message: "Air is clean and weather is comfortable. Great day to go out!",
        color: "var(--color-good)",
        score: 100,
        indoorAqi: Math.floor(aqi * 0.4),
        dos: [
            "Open your windows — let fresh air in 🌬️",
            "Go for a morning walk or light exercise outside 🚶",
            "Drink 8–10 glasses of water through the day 💧"
        ],
        donts: [
            "No major restrictions today — enjoy the day! 😊"
        ],
        gear: [] // Practical items to carry/use
    };

    // ── Score calculation ─────────────────────────────────────────────────────
    let scorePenalty = 0;
    if (aqi > 40) scorePenalty += (aqi - 40) * 0.3;
    if (temp > 30) scorePenalty += (temp - 30) * 2;
    if (uv > 5) scorePenalty += (uv - 5) * 2;
    if (humidity > 80 && temp > 28) scorePenalty += 10;

    // ── AQI: Moderate (51–100) ────────────────────────────────────────────────
    if (aqi > 50 && aqi <= 100) {
        risk.level = "🟡 Moderate — Be A Little Careful";
        risk.message = "Air is okay for most people, but if you have breathing problems, take care.";
        risk.color = "var(--color-moderate)";
        risk.dos = [
            "Normal daily activities are fine for healthy people 👍",
            "Drink plenty of water — stay hydrated 💧",
            "If you feel any throat irritation, gargle with warm salt water 🧂"
        ];
        risk.donts = [
            "Avoid jogging or running on busy roads with heavy traffic 🚗",
            "Don't keep windows open near roads — dust comes in 🪟"
        ];
        risk.gear = [
            { icon: "😷", name: "Basic Surgical Mask", desc: "Wear a basic surgical mask if going out. Available at any medical store for ₹2–5." },
            { icon: "💧", name: "Water Bottle", desc: "Carry a 1-litre water bottle. Staying hydrated helps your body fight pollution." }
        ];
    }

    // ── AQI: High / Hot Weather ───────────────────────────────────────────────
    if (aqi > 100 || temp >= 35) {
        risk.level = "🔴 High Risk — Take Precautions";
        risk.message = temp >= 35
            ? "Very hot outside! Your body can overheat fast. Stay inside as much as possible."
            : "Air quality is bad today. Breathing outside is not good for health.";
        risk.color = "var(--color-poor)";
        risk.indoorAqi = Math.floor(aqi * 0.6);
        risk.dos = [
            "Stay inside or in cool, shaded places 🏠",
            "Drink water every 1 hour — even if you're not thirsty 💧",
            "Wear an N95 or N99 mask if you must go outside 😷",
            "Keep wet cloth or khanduwa on your head in heat ☀️"
        ];
        risk.donts = [
            "Don't exercise or run outside — do indoor exercise instead 🏋️",
            "Avoid going out between 11 AM – 4 PM (hottest time) ⏰",
            "Don't keep windows open — it lets smoke and dust inside 🪟",
            "Don't drink sugary cold drinks — they increase dehydration 🥤"
        ];
        risk.gear = [
            { icon: "😷", name: "N95 Mask", desc: "N95 masks (e.g. 3M, Honeywell) block 95% of dust and smoke particles. Available at medical stores for ₹30–80." },
            { icon: "💧", name: "ORS / Electrolyte Water", desc: "Carry ORS sachets (Electral, Enerzal) — they replace salts lost in sweat. Available at any medical/general store for ₹5–10." },
            { icon: "🧴", name: "Sunscreen SPF 30+", desc: "Apply sunscreen on face, neck, hands. Lakme Sun Expert or Himalaya are affordable options (₹80–150)." },
            { icon: "🕶️", name: "Sunglasses", desc: "UV rays can damage your eyes. Wear any basic UV-protection sunglasses when stepping out." }
        ];
    }

    // ── AQI: Severe / Extreme Heat ────────────────────────────────────────────
    if (aqi > 150 || temp >= 42) {
        risk.level = "🚨 Danger — Very Serious Risk";
        risk.message = "Air is extremely polluted or it is dangerously hot. Please stay at home. Do NOT go outside.";
        risk.color = "var(--color-severe)";
        risk.indoorAqi = Math.floor(aqi * 0.75);
        scorePenalty += 20;
        risk.dos = [
            "Stay fully indoors — windows and doors closed 🚪",
            "Use a wet cloth over nose and mouth if no mask available 🧣",
            "Use an air purifier if you have one — HEPA filter works best 🌀",
            "Drink ORS or lemon water every hour 🍋",
            "Call elderly and sick family members to check on them 📞"
        ];
        risk.donts = [
            "Do NOT go outside — even for 5 minutes without protection 🛑",
            "Don't open windows or doors unnecessarily 🪟",
            "Don't let children play outside at all today 🧒",
            "Avoid cooking food that produces a lot of smoke indoors 🍳"
        ];
        risk.gear = [
            { icon: "😷", name: "N95 or N99 Mask (Must Have)", desc: "Must wear N95/N99 if you step out even for a minute. 3M 9502+, Honeywell, or Dettol N95 are trusted brands. Cost: ₹30–100." },
            { icon: "🌀", name: "HEPA Air Purifier", desc: "If you have one, keep it running in the main room. Philips, Mi, and Dyson purifiers are available in India. Helps remove PM2.5 from indoor air." },
            { icon: "💧", name: "ORS + Water", desc: "Keep drinking fluids. Electral ORS sachets cost ₹5–10 and can prevent dangerous dehydration in extreme heat." },
            { icon: "🧣", name: "Wet Cloth / Gamcha", desc: "If no mask available, a wet gamcha/cloth over nose and mouth gives basic protection from dust particles." }
        ];
    }

    // ── Health Profile Specific Advice ────────────────────────────────────────
    if (!Array.isArray(profilesArray)) profilesArray = ["healthy"];

    let customCount = 0;
    profilesArray.forEach(profile => {
        const p = profile.toLowerCase();

        if (p === "asthma") {
            if (aqi > 60) {
                risk.level = risk.level.includes("Danger") ? risk.level : "🔴 High Risk (Asthma Profile)";
                risk.color = "var(--color-poor)";
                scorePenalty += 15;
                risk.dos.unshift("Keep your inhaler (like Asthalin or Seroflo) in your pocket at all times 💊");
                risk.dos.unshift("Use your preventive inhaler in the morning before going out 🌅");
                risk.donts.unshift("Don't breathe deeply in traffic or dusty areas — cover your nose 🚫");
                risk.gear.unshift({ icon: "💊", name: "Rescue Inhaler", desc: "Keep your doctor-prescribed inhaler (Asthalin, Budecort, etc.) with you always. Do not go out without it on bad air days." });
                risk.gear.push({ icon: "😷", name: "N95 Mask (Essential for Asthma)", desc: "For asthma patients, an N95 mask is NOT optional on days with AQI > 100. Available at medical stores for ₹30–80." });
            }
        }

        else if (p === "senior") {
            if (temp > 32 || aqi > 80) {
                risk.level = risk.level.includes("Danger") ? risk.level : "🔴 High Risk (Senior Citizen)";
                risk.color = "var(--color-poor)";
                scorePenalty += 10;
                risk.dos.unshift("Stay in a cool room — ask family to check on you regularly 👨‍👩‍👧");
                risk.dos.unshift("Eat light meals — avoid heavy food in heat (like rajma/chole) 🥗");
                risk.donts.unshift("Don't go out alone in the afternoon heat ☀️");
                risk.donts.unshift("Don't skip blood pressure or diabetes medicine 💊");
                risk.gear.push({ icon: "🩺", name: "Blood Pressure Monitor", desc: "If you have one at home, check your BP in the morning. Heat and pollution can both raise blood pressure in seniors." });
            }
        }

        else if (p === "heart") {
            if (aqi > 75) {
                risk.level = risk.level.includes("Danger") ? risk.level : "🔴 High Risk (Heart Patient)";
                risk.color = "var(--color-poor)";
                scorePenalty += 15;
                risk.dos.unshift("Take your heart medicine exactly as your doctor told you 💊");
                risk.dos.unshift("Avoid stress and stay calm — practice slow deep breathing 🧘");
                risk.donts.unshift("Don't lift heavy things or do strenuous physical work 🏋️");
                risk.donts.unshift("Don't walk in heavy traffic areas — air pollution directly stresses the heart 🚗");
                risk.gear.push({ icon: "💊", name: "Your Heart Medicine", desc: "Keep all your prescribed heart medicines with you. Do not miss a dose, especially on hot or polluted days." });
            }
        }

        else if (p === "allergies") {
            if (aqi > 50 || humidity > 70) {
                scorePenalty += 5;
                risk.dos.unshift("Take your prescribed antihistamine tablet in the morning (like Cetirizine, Allegra) 💊");
                risk.donts.unshift("Avoid parks, gardens, fields — pollen levels are higher there 🌿");
                risk.gear.push({ icon: "😷", name: "Mask + Antihistamine", desc: "Wear a surgical or N95 mask outdoors. Take Cetirizine (₹5–10/tablet) or Allegra if you're prone to sneezing/rashes." });
            }
        }

        else if (p === "healthy" || p === "none") {
            if (aqi <= 50 && temp <= 30) {
                risk.dos.unshift("You are healthy — make the most of this great day! Go for a run, cycle, or play a sport 🏃");
            } else if (aqi > 100) {
                risk.donts.push("Even healthy people should avoid heavy outdoor exercise when AQI is this high 🏃");
            } else if (temp > 35) {
                risk.donts.push("Heat can affect anyone — even fit people. Avoid outdoor workouts in the afternoon ☀️");
            }
        }

        else if (p !== "healthy" && p !== "none") {
            customCount++;
            if (customCount === 1) {
                risk.dos.push(`Keep an eye on how the weather affects your condition: "${profile}" 🔍`);
                if (temp > 30 || aqi > 80) {
                    risk.donts.push(`Avoid overexertion which may trigger your: ${profile} 🛑`);
                }
            }
        }
    });

    // ── Multi-profile message ─────────────────────────────────────────────────
    if (profilesArray.length > 2 && scorePenalty > 20) {
        risk.message = "You have multiple health conditions. Be extra careful today and stay indoors as much as possible.";
    }

    // ── UV index additions ────────────────────────────────────────────────────
    if (uv >= 6) {
        risk.dos.push(`UV index is ${Math.round(uv)} — apply sunscreen SPF 30+ before stepping out 🧴`);
        risk.donts.push("Avoid standing in direct sunlight between 11 AM – 3 PM without shade ☀️");
        if (!risk.gear.find(g => g.name.includes("Sunscreen"))) {
            risk.gear.push({ icon: "🧴", name: "Sunscreen SPF 30+", desc: "Apply on face, neck and arms. Lakme Sun Expert, Himalaya, or Neutrogena are reliable Indian options (₹80–200)." });
        }
    }

    // ── Rain additions ────────────────────────────────────────────────────────
    if (precip > 0.5 && precip < 10) {
        risk.dos.push("Light rain expected — carry an umbrella ☂️");
        risk.gear.push({ icon: "☂️", name: "Umbrella / Raincoat", desc: "Keep a small folding umbrella in your bag for light showers." });
    } else if (precip >= 10) {
        risk.dos.push("Heavy rain expected — avoid flooded roads and drains ⚠️");
        risk.donts.push("Don't walk or drive through flooded roads or underpasses 🌊");
        risk.gear.push({ icon: "🥾", name: "Waterproof Footwear", desc: "Wear rubber slippers or waterproof shoes to avoid leptospirosis from floodwater contact." });
    }

    risk.score = Math.max(0, Math.min(100, Math.floor(100 - scorePenalty)));

    // Deduplicate
    risk.dos = [...new Set(risk.dos)];
    risk.donts = [...new Set(risk.donts)];
    risk.gear = risk.gear.filter((g, i, arr) => arr.findIndex(x => x.name === g.name) === i);

    return risk;
}