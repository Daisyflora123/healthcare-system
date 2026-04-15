/**
 * EcoPulse - Alerts Feeder
 * Generates an automated feed of alerts based on current environmental conditions and time
 */

function generateAlertsFeed(cityData, profilesArray) {
    const alerts = [];
    
    if (!Array.isArray(profilesArray)) profilesArray = ["healthy"];

    // System log
    alerts.push({
        time: "Just now",
        type: "info",
        icon: "fa-solid fa-satellite-dish",
        title: "Sensor Sync Complete",
        desc: `Synchronized Open-Meteo satellite data for ${cityData.name}.`
    });

    if (cityData.aqi > 100) {
        alerts.push({
            time: "1 hour ago",
            type: "danger",
            icon: "fa-solid fa-triangle-exclamation",
            title: "AQI Limit Exceeded",
            desc: `Air quality crossed the unhealthy threshold (AQI: ${cityData.aqi}).`
        });
    }

    if (cityData.temp > 35) {
        alerts.push({
            time: "3 hours ago",
            type: "warning",
            icon: "fa-solid fa-temperature-arrow-up",
            title: "Heatwave Warning Issued",
            desc: `Temperatures have soared above 35°C in ${cityData.name}. Stay hydrated.`
        });
    }

    // Process profiles array for customized alerts
    profilesArray.forEach(p => {
        const lowerP = p.toLowerCase();
        if (lowerP === "asthma" && cityData.aqi > 60) {
            alerts.push({
                time: "4 hours ago",
                type: "danger",
                icon: "fa-solid fa-lungs-virus",
                title: "Asthma Alert Broadcast",
                desc: `High particulate matter detected. Recommended to keep inhalers nearby.`
            });
        }
        if (lowerP === "heart" && cityData.aqi > 75) {
            alerts.push({
                time: "2 hours ago",
                type: "danger",
                icon: "fa-solid fa-heart-pulse",
                title: "Cardiac Distress Warning",
                desc: `High strain environment detected for cardiac patients.`
            });
        }
    });

    if (cityData.aqi <= 50 && cityData.temp <= 30) {
        alerts.push({
            time: "5 hours ago",
            type: "success",
            icon: "fa-solid fa-sun",
            title: "Optimal Conditions",
            desc: 'Weather and air quality are perfect for outdoor activities today.'
        });
    }

    return alerts;
}