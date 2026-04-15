document.addEventListener('DOMContentLoaded', () => {
  // Authentication Check
  const userName = localStorage.getItem('hc_userName');
  if(!userName) {
    window.location.href = 'healthcare-login.html';
    return;
  }

  // Set Profile Name
  const profileNameEl = document.getElementById('profileName');
  if(profileNameEl) profileNameEl.textContent = userName;

  const welcomeNameEl = document.getElementById('welcomeName');
  if(welcomeNameEl) welcomeNameEl.textContent = userName.split(' ')[0];

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('hc_userName');
      localStorage.removeItem('hc_userEmail');
      localStorage.removeItem('hc_userPass');
      window.location.href = 'healthcare-login.html';
    });
  }

  // Handle Custom Disease Input Visibility
  const otherCheckbox = document.getElementById('disease-other');
  const customDiseaseContainer = document.getElementById('customDiseaseContainer');
  const customDiseaseInput = document.getElementById('customDiseaseInput');
  
  if(otherCheckbox && customDiseaseContainer) {
    otherCheckbox.addEventListener('change', () => {
      if(otherCheckbox.checked) {
        customDiseaseContainer.classList.remove('d-none');
        customDiseaseInput.focus();
      } else {
        customDiseaseContainer.classList.add('d-none');
        customDiseaseInput.value = '';
      }
      updateSmartAssistance();
    });
  }

  if(customDiseaseInput) {
    customDiseaseInput.addEventListener('input', updateSmartAssistance);
  }

  // Checkbox Event Listeners
  const allCheckboxes = document.querySelectorAll('.disease-cb');
  allCheckboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      // If "None" is checked, uncheck others.
      if(e.target.id === 'disease-none' && e.target.checked) {
        allCheckboxes.forEach(otherCb => {
          if(otherCb.id !== 'disease-none') {
            otherCb.checked = false;
          }
        });
        customDiseaseContainer.classList.add('d-none');
        customDiseaseInput.value = '';
      } 
      // If any other is checked, uncheck "None".
      else if(e.target.id !== 'disease-none' && e.target.checked) {
        document.getElementById('disease-none').checked = false;
      }
      updateSmartAssistance();
    });
  });

  // Knowledge Base for Smart Assistance
  const knowledgeBase = {
    diabetes: [
      { id: 'd1', title: 'Monitor Blood Sugar', desc: 'Check your blood sugar levels regularly as prescribed by your doctor.', icon: 'fa-droplet' },
      { id: 'd2', title: 'Foot Care', desc: 'Inspect your feet daily for any cuts, blisters, or sores.', icon: 'fa-shoe-prints' }
    ],
    bloodpressure: [
      { id: 'bp1', title: 'Reduce Sodium', desc: 'Limit your salt intake to manage your blood pressure effectively.', icon: 'fa-salt-shaker' },
      { id: 'bp2', title: 'Regular Exercise', desc: 'Engage in moderate-intensity aerobic exercise like brisk walking.', icon: 'fa-person-walking' }
    ],
    asthma: [
      { id: 'a1', title: 'Avoid Triggers', desc: 'Stay away from dust, smoke, pollen, and pet dander.', icon: 'fa-wind' },
      { id: 'a2', title: 'Keep Inhaler Handy', desc: 'Always carry your rescue inhaler with you.', icon: 'fa-pump-medical' }
    ],
    heartdisease: [
      { id: 'h1', title: 'Heart-Healthy Diet', desc: 'Eat more fruits, vegetables, and whole grains while limiting saturated fats.', icon: 'fa-apple-whole' },
      { id: 'h2', title: 'Stress Management', desc: 'Practice relaxation techniques such as deep breathing or meditation.', icon: 'fa-spa' }
    ],
    general: [
      { id: 'g1', title: 'Stay Hydrated', desc: 'Drink plenty of water throughout the day.', icon: 'fa-glass-water' },
      { id: 'g2', title: 'Adequate Sleep', desc: 'Aim for 7-9 hours of quality sleep every night.', icon: 'fa-bed' }
    ]
  };

  // Smart Assistance Algorithm
  function updateSmartAssistance() {
    const listContainer = document.getElementById('smartAssistanceList');
    if(!listContainer) return;

    listContainer.innerHTML = '';
    
    let activeDiseases = [];
    allCheckboxes.forEach(cb => {
      if(cb.checked && cb.id !== 'disease-none' && cb.id !== 'disease-other') {
        activeDiseases.push(cb.value);
      }
    });

    let tipsToShow = [];

    // Add specific tips
    activeDiseases.forEach(disease => {
      if(knowledgeBase[disease]) {
        tipsToShow = tipsToShow.concat(knowledgeBase[disease]);
      }
    });

    // Handle custom disease
    if(otherCheckbox.checked && customDiseaseInput.value.trim().length > 0) {
      tipsToShow.push({
        id: 'c1',
        title: 'Consult Your Doctor',
        desc: `Since you indicated "${customDiseaseInput.value}", ensure you follow specifically prescribed guidelines from your healthcare provider.`,
        icon: 'fa-user-doctor'
      });
    }

    // Default general tips if nothing selected or "None" is selected
    const noneCb = document.getElementById('disease-none');
    if(tipsToShow.length === 0 || noneCb.checked) {
      tipsToShow = tipsToShow.concat(knowledgeBase.general);
    }

    // Deduplicate and limit to top 4 tips to keep it clean
    tipsToShow = tipsToShow.slice(0, 4);

    tipsToShow.forEach(tip => {
      const el = document.createElement('div');
      el.className = 'smart-item';
      el.innerHTML = `
        <div class="smart-icon">
          <i class="fa-solid ${tip.icon}"></i>
        </div>
        <div class="smart-content">
          <h4>${tip.title}</h4>
          <p>${tip.desc}</p>
        </div>
      `;
      listContainer.appendChild(el);
    });
  }

  // Initial call
  updateSmartAssistance();

  // Initialize Map (Leaflet)
  if(document.getElementById('map')) {
    // Default location: A generic city coordinate (e.g. London or New York)
    // We'll use New York: 40.7128, -74.0060
    const lat = 40.7128;
    const lng = -74.0060;
    
    const map = L.map('map').setView([lat, lng], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Add User Marker
    L.marker([lat, lng]).addTo(map)
      .bindPopup('<b>You are here</b><br>Based on GPS')
      .openPopup();

    // Add Dummy Healthcare Providers
    const clinics = [
      {name: "City Central Hospital", lat: 40.7228, lng: -73.9960, type: "Hospital"},
      {name: "Downtown Care Clinic", lat: 40.7028, lng: -74.0160, type: "Clinic"},
      {name: "Metro Pharmacy", lat: 40.7158, lng: -74.0020, type: "Pharmacy"}
    ];

    const healthIcon = L.divIcon({
      className: 'custom-div-icon',
        html: "<div style='background-color:#ef4444; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center;'><i class='fa-solid fa-plus' style='font-size:12px;'></i></div>",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    clinics.forEach(clinic => {
      L.marker([clinic.lat, clinic.lng], {icon: healthIcon}).addTo(map)
        .bindPopup(`<b>${clinic.name}</b><br>${clinic.type}`);
    });
  }
});
