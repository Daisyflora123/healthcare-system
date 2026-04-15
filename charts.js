/**
 * EcoPulse - Chart Rendering Logic
 * Uses Chart.js to visualize AQI trends
 */

let aqiChartInstance = null;

function renderChart(forecastHistory) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    
    // Destroy existing chart to prevent overlap when searching multiple cities
    if (aqiChartInstance) {
        aqiChartInstance.destroy();
    }

    // Modern glass/neon styling for chart
    const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    Chart.defaults.color = '#888888';
    Chart.defaults.font.family = 'Outfit, sans-serif';

    aqiChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: forecastHistory.labels,
            datasets: [{
                label: 'AQI Trend',
                data: forecastHistory.data,
                borderColor: '#00e5ff',
                backgroundColor: 'rgba(0, 229, 255, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#00e5ff',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#00e5ff',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4 // smooth curves
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // looks cleaner without legend for single dataset
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#00e5ff',
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}