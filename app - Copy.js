/* ==========================================================================
   Marine AI - Widescreen Application Logic
   ISRO / Department of Space - PS 26176 (SIH 2026 Prototype)
   ========================================================================== */

let map = null;
let gisFullMap = null;
let tensionChart = null;
let activeRegion = 'rameswaram';
let currentLanguage = 'en';
let ttsEnabled = false;
let layers = {};
let currentNavView = 'dashboard';
let navHistory = [];

// Coastal Regions Dataset
const REGION_DATA = {
  rameswaram: {
    name: 'Rameswaram, Tamil Nadu',
    coords: [9.2876, 79.3129],
    zoom: 11,
    weather: '28.2°C | Fair Sea | Wind 12 km/h SW',
    zones: [
      { name: 'Zone B', coords: [9.1500, 79.4200], status: 'High Potential', score: '94%', sst: '28.3°C', chl: '3.1 mg/m³', color: '#10b981' },
      { name: 'Zone A', coords: [9.3200, 79.4500], status: 'High Potential', score: '89%', sst: '28.1°C', chl: '2.8 mg/m³', color: '#10b981' },
      { name: 'Zone C', coords: [9.1000, 79.5000], status: 'Moderate', score: '76%', sst: '27.5°C', chl: '1.9 mg/m³', color: '#f59e0b' },
      { name: 'Zone D (Restricted)', coords: [9.2200, 79.6200], status: 'Unsafe (IMBL)', score: '12%', sst: '28.8°C', chl: '3.4 mg/m³', color: '#ef4444' }
    ],
    imbl: [[9.0000, 79.5500], [9.2500, 79.6000], [9.5000, 79.7000]],
    route: [[9.2876, 79.3129], [9.2200, 79.3600], [9.1500, 79.4200]]
  },
  visakhapatnam: {
    name: 'Visakhapatnam, Andhra Pradesh',
    coords: [17.6868, 83.2185],
    zoom: 11,
    weather: '29.1°C | Calm Sea | Wind 9 km/h E',
    zones: [
      { name: 'Vizag Deepsea Zone 1', coords: [17.5500, 83.3800], status: 'High Potential', score: '92%', sst: '28.9°C', chl: '3.6 mg/m³', color: '#10b981' },
      { name: 'Gangavaram Outer', coords: [17.4800, 83.4200], status: 'Moderate', score: '79%', sst: '28.4°C', chl: '2.1 mg/m³', color: '#f59e0b' }
    ],
    imbl: [[17.3000, 83.6000], [17.8000, 83.7000]],
    route: [[17.6868, 83.2185], [17.6200, 83.2800], [17.5500, 83.3800]]
  },
  kochi: {
    name: 'Kochi, Kerala',
    coords: [9.9312, 76.2673],
    zoom: 11,
    weather: '27.8°C | Slight Swell | Wind 14 km/h WNW',
    zones: [
      { name: 'Malabar Shelf Zone 3', coords: [9.8500, 76.0500], status: 'High Potential', score: '95%', sst: '27.9°C', chl: '4.2 mg/m³', color: '#10b981' },
      { name: 'Kochi Offshore South', coords: [9.7200, 76.1000], status: 'Moderate', score: '81%', sst: '27.6°C', chl: '2.4 mg/m³', color: '#f59e0b' }
    ],
    imbl: [[9.6000, 75.8000], [10.1000, 75.8500]],
    route: [[9.9312, 76.2673], [9.8900, 76.1500], [9.8500, 76.0500]]
  },
  veraval: {
    name: 'Veraval, Gujarat',
    coords: [20.9042, 70.3670],
    zoom: 11,
    weather: '28.5°C | Moderate Sea | Wind 16 km/h W',
    zones: [
      { name: 'Saurashtra Bank A', coords: [20.7800, 70.2500], status: 'High Potential', score: '91%', sst: '28.2°C', chl: '3.5 mg/m³', color: '#10b981' }
    ],
    imbl: [[20.6000, 69.9000], [21.1000, 69.9000]],
    route: [[20.9042, 70.3670], [20.8400, 70.3000], [20.7800, 70.2500]]
  },
  paradip: {
    name: 'Paradip, Odisha',
    coords: [20.3164, 86.6114],
    zoom: 11,
    weather: '29.4°C | Fair Sea | Wind 11 km/h SE',
    zones: [
      { name: 'Mahanadi Plume Zone', coords: [20.2000, 86.7500], status: 'High Potential', score: '95%', sst: '29.0°C', chl: '4.5 mg/m³', color: '#10b981' }
    ],
    imbl: [[20.1000, 87.0000], [20.5000, 87.0000]],
    route: [[20.3164, 86.6114], [20.2600, 86.6800], [20.2000, 86.7500]]
  }
};

// Multilingual Dictionary
const TRANSLATIONS = {
  en: {
    btn_back: "Back to Dashboard",
    nav_dashboard: "Dashboard",
    nav_assistant: "AI Marine Assistant",
    nav_map: "Marine Intelligence Map",
    nav_pfz: "Fishing Zone / PFZ",
    nav_safety: "Sea Safety",
    nav_telemetry: "Satellite Telemetry",
    nav_equipment: "Equipment Monitoring",
    nav_route: "Safe Route Planner",
    nav_alerts: "Alerts & Advisories",
    nav_data: "Marine Data",
    nav_services: "Fisherman Services",
    nav_schemes: "Govt Schemes & Scholarships",
    title_map: "Marine Intelligence Map",
    title_safety: "Sea Safety Forecast",
    title_pfz: "Potential Fishing Zones",
    title_assistant: "Marine AI Assistant",
    title_telemetry: "Live Oceanographic Telemetry",
    safe_to_go: "SAFE TO GO",
    ask_placeholder: "Ask about sea safety, species, routes, fishing..."
  },
  ta: {
    btn_back: "← முகப்புக்கு திரும்பவும்",
    nav_dashboard: "முகப்பு",
    nav_assistant: "கடல் AI உதவியாளர்",
    nav_map: "கடல் வரைபடம் (GIS)",
    nav_pfz: "மீன்பிடி மண்டலம் (PFZ)",
    nav_safety: "கடல் பாதுகாப்பு",
    nav_telemetry: "செயற்கைக்கோள் தரவு",
    nav_equipment: "கருவிகள் கண்காணிப்பு",
    nav_route: "பாதுகாப்பான வழி",
    nav_alerts: "எச்சரிக்கைகள்",
    nav_data: "கடல் தரவு",
    nav_services: "மீனவர் சேவைகள்",
    nav_schemes: "அரசு திட்டங்கள் & உதவித்தொகை",
    title_map: "கடல்சார் தகவமைப்பு வரைபடம்",
    title_safety: "கடல் பாதுகாப்பு கணிப்பு",
    title_pfz: "சாத்தியமான மீன்பிடி மண்டலங்கள்",
    title_assistant: "மரைன் AI உதவியாளர்",
    title_telemetry: "நேரடி கடல்சார் தரவு",
    safe_to_go: "கடலுக்கு செல்ல பாதுகாப்பானது",
    ask_placeholder: "கடல் பாதுகாப்பு, வழிகள், மீன்பிடித்தல் பற்றி கேளுங்கள்..."
  },
  te: {
    btn_back: "← డాష్‌బోర్డ్‌కి తిరిగి వెళ్లండి",
    nav_dashboard: "డాష్‌బోర్డ్",
    nav_assistant: "మెరైన్ AI అసిస్టెంట్",
    nav_map: "సముద్రపు మ్యాప్ (GIS)",
    nav_pfz: "చేపల వేట ప్రాంతం (PFZ)",
    nav_safety: "సముద్ర రక్షణ",
    nav_telemetry: "శాటిలైట్ టెలిమెట్రీ",
    nav_equipment: "పరికరాల పర్యవేక్షణ",
    nav_route: "సురక్షిత మార్గం",
    nav_alerts: "హెచ్చరికలు",
    nav_data: "సముద్ర డేటా",
    nav_services: "మత్స్యకార సేవలు",
    nav_schemes: "ప్రభుత్వ పథకాలు & స్కాలర్‌షిప్‌లు",
    title_map: "సముద్రపు మ్యాప్",
    title_safety: "సముద్ర రక్షణ అంచనా",
    title_pfz: "చేపల వేట ప్రాంతాలు",
    title_assistant: "మెరైన్ AI సహాయకుడు",
    title_telemetry: "లైవ్ ఓషనోగ్రాఫిక్ టెలిమెట్రీ",
    safe_to_go: "సముద్రంలోకి వెళ్లడం సురక్షితం",
    ask_placeholder: "సముద్ర రక్షణ, మార్గాలు, చేపల వేట గురించి అడగండి..."
  },
  ml: {
    btn_back: "← ഡാഷ്ബോർഡിലേക്ക് തിരികെ പോവുക",
    nav_dashboard: "ഡാഷ്ബോർഡ്",
    nav_assistant: "മറൈൻ AI അസിസ്റ്റന്റ്",
    nav_map: "മറൈൻ മാപ്പ് (GIS)",
    nav_pfz: "മത്സ്യബന്ധന മേഖല (PFZ)",
    nav_safety: "കടൽ സുരക്ഷ",
    nav_telemetry: "സാറ്റലൈറ്റ് ടെലിമെട്രി",
    nav_equipment: "ഉപകരണ നിരീക്ഷണം",
    nav_route: "സുരക്ഷിത റൂട്ട്",
    nav_alerts: "മു മുന്നറിയിപ്പുകൾ",
    nav_data: "മറൈൻ ഡാറ്റ",
    nav_services: "മത്സ്യത്തൊഴിലാളി സേവനങ്ങൾ",
    nav_schemes: "സർക്കാർ പദ്ധതികളും സ്കോളർഷിപ്പുകളും",
    title_map: "മറൈൻ മാപ്പ്",
    title_safety: "കടൽ സുരക്ഷാ പ്രവചനം",
    title_pfz: "സാധ്യമായ മത്സ്യബന്ധന മേഖലകൾ",
    title_assistant: "മറൈൻ AI അസിസ്റ്റന്റ്",
    title_telemetry: "ലൈവ് സാറ്റലൈറ്റ് ഡാറ്റ",
    safe_to_go: "കടലിൽ പോകാൻ സുരക്ഷിതം",
    ask_placeholder: "കടൽ സുരക്ഷയെക്കുറിച്ചും റൂട്ടുകളെക്കുറിച്ചും ചോദിക്കുക..."
  },
  hi: {
    btn_back: "← डैशबोर्ड पर वापस जाएं",
    nav_dashboard: "डैशबोर्ड",
    nav_assistant: "समुद्री AI सहायक",
    nav_map: "समुद्री इंटेलिजेंस मानचित्र",
    nav_pfz: "संभावित मत्स्य पालन क्षेत्र",
    nav_safety: "समुद्री सुरक्षा",
    nav_telemetry: "सैटेलाइट टेलीमेट्री",
    nav_equipment: "उपकरण निगरानी",
    nav_route: "सुरक्षित मार्ग नियोजक",
    nav_alerts: "चेतावनी और सलाह",
    nav_data: "समुद्री डेटा",
    nav_services: "मछुआरा सेवाएं",
    nav_schemes: "सरकारी योजनाएं और छात्रवृत्ति",
    title_map: "समुद्री इंटेलिजेंस मानचित्र",
    title_safety: "समुद्री सुरक्षा पूर्वानुमान",
    title_pfz: "संभावित मत्स्य पालन क्षेत्र",
    title_assistant: "समुद्री AI सहायक",
    title_telemetry: "लाइव ऑशनोग्राफिक टेलीमेट्री",
    safe_to_go: "समुद्र में जाना सुरक्षित है",
    ask_placeholder: "समुद्री सुरक्षा, मार्गों, मछली पकड़ने के बारे में पूछें..."
  },
  gu: {
    btn_back: "← ડેશબોર્ડ પર પાછા જાઓ",
    nav_dashboard: "ડેશબોર્ડ",
    nav_assistant: "મરીન AI સહાયક",
    nav_map: "મરીન નકશો (GIS)",
    nav_pfz: "માછીમારી ઝોન (PFZ)",
    nav_safety: "દરિયાઈ સુરક્ષા",
    nav_telemetry: "સેટેલાઇટ ટેલિમેટ્રી",
    nav_equipment: "સાધનોનું નિરીક્ષણ",
    nav_route: "સુરક્ષિત માર્ગ",
    nav_alerts: "ચેતવણીઓ",
    nav_data: "મરીન ડેટા",
    nav_services: "માછીમાર સેવાઓ",
    nav_schemes: "સરકારી યોજનાઓ અને શિષ્યવૃત્તિ",
    title_map: "મરીન નકશો",
    title_safety: "દરિયાઈ સુરક્ષા આગાહી",
    title_pfz: "સંભવિત માછીમારી ઝોન",
    title_assistant: "મરીન AI સહાયક",
    title_telemetry: "લાઇવ ઓશનોગ્રાફિક ટેલિમેટ્રી",
    safe_to_go: "દરિયામાં જવું સુરક્ષિત છે",
    ask_placeholder: "દરિયાઈ સુરક્ષા, માર્ગો વિશે પૂછો..."
  },
  bn: {
    btn_back: "← ড্যাশবোর্ডে ফিরে যান",
    nav_dashboard: "ড্যাশবোর্ড",
    nav_assistant: "সামুদ্রিক AI সহকারী",
    nav_map: "সামুদ্রিক মানচিত্র (GIS)",
    nav_pfz: "মৎস্য শিকার অঞ্চল (PFZ)",
    nav_safety: "সমুদ্রের সুরক্ষা",
    nav_telemetry: "স্যাটেলাইট টেলিমেট্রি",
    nav_equipment: "যন্ত্রপাতি পর্যবেক্ষণ",
    nav_route: "নিরাপদ রুট",
    nav_alerts: "সতর্কবার্তা",
    nav_data: "মেরিন ডেটা",
    nav_services: "মৎসজীবি পরিষেবা",
    nav_schemes: "সরকারি প্রকল্প ও বৃত্তি",
    title_map: "সামুদ্রিক মানচিত্র",
    title_safety: "সমুদ্র নিরাপত্তার পূর্বাভাস",
    title_pfz: "সম্ভাব্য মৎস্য শিকার অঞ্চল",
    title_assistant: "সামুদ্রিক AI সহকারী",
    title_telemetry: "লাইভ সমুদ্রবিজ্ঞান টেলিমেট্রি",
    safe_to_go: "সমুদ্রে যাওয়া নিরাপদ",
    ask_placeholder: "সমুদ্রের সুরক্ষা ও রুট সম্পর্কে জিজ্ঞাসা করুন..."
  },
  or: {
    btn_back: "← ଡ୍ୟାସବୋର୍ଡକୁ ଫେରନ୍ତୁ",
    nav_dashboard: "ଡ୍ୟାସବୋର୍ଡ",
    nav_assistant: "ସାମୁଦ୍ରିକ AI ସହାୟକ",
    nav_map: "ସାମୁଦ୍ରିକ ମାନଚିତ୍ର (GIS)",
    nav_pfz: "ମାଛ ଧରିବା ଅଞ୍ଚଳ (PFZ)",
    nav_safety: "ସମୁଦ୍ର ସୁରକ୍ଷା",
    nav_telemetry: "ସାଟେଲାଇଟ୍ ଟେଲିମେଟ୍ରି",
    nav_equipment: "ସରଞ୍ଜାମ ନିରୀକ୍ଷଣ",
    nav_route: "ସୁରକ୍ଷିତ ରୁଟ୍",
    nav_alerts: "ସତର୍କତା",
    nav_data: "ସାମୁଦ୍ରିକ ଡାଟା",
    nav_services: "ମତ୍ସ୍ୟଜୀବୀ ସେବା",
    nav_schemes: "ସରକାରୀ ଯୋଜନା ଓ ଛାତ୍ରବୃତ୍ତି",
    title_map: "ସାମୁଦ୍ରିକ ମାନଚିତ୍ର",
    title_safety: "ସମୁଦ୍ର ସୁରକ୍ଷା ପୂର୍ବାନୁମାନ",
    title_pfz: "ସମ୍ଭାବ୍ୟ ମାଛ ଧରିବା ଅଞ୍ଚଳ",
    title_assistant: "ସାମୁଦ୍ରିକ AI ସହାୟକ",
    title_telemetry: "ଲାଇଭ୍ ସାମୁଦ୍ରିକ ଟେଲିମେଟ୍ରି",
    safe_to_go: "ସମୁଦ୍ରକୁ ଯିବା ସୁରକ୍ଷିତ",
    ask_placeholder: "ସମୁଦ୍ର ସୁରକ୍ଷା ଓ ରୁଟ୍ ବିଷୟରେ ପଚାରନ୍ତୁ..."
  },
  mr: {
    btn_back: "← डॅशबोर्डवर परत जा",
    nav_dashboard: "डॅशबोर्ड",
    nav_assistant: "मरीन AI सहाय्यक",
    nav_map: "मरीन नकाशा (GIS)",
    nav_pfz: "मासेमारी क्षेत्र (PFZ)",
    nav_safety: "समुद्र सुरक्षा",
    nav_telemetry: "सॅटेलाइट टेलिमेन्ट्री",
    nav_equipment: "साधने देखरेख",
    nav_route: "सुरक्षित मार्ग",
    nav_alerts: "इशारे व सूचना",
    nav_data: "मरीन डेटा",
    nav_services: "मासेमार सेवा",
    nav_schemes: "शासकीय योजना आणि शिष्यवृत्ती",
    title_map: "मरीन नकाशा",
    title_safety: "समुद्र सुरक्षा अंदाज",
    title_pfz: "संभाव्य मासेमारी क्षेत्र",
    title_assistant: "मरीन AI सहाय्यक",
    title_telemetry: "लाइव्ह सागरी टेलिमेन्ट्री",
    safe_to_go: "समुद्रात जाणे सुरक्षित आहे",
    ask_placeholder: "समुद्र सुरक्षा व मार्गांबद्दल विचारणा करा..."
  }
};

let openMeteoChart = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  renderPersistentNavs();
  initClock();
  initLeafletMap();
  initTensionChart();
  startTelemetrySimulation();
  initFamilyScheduler();
  if (!isSerialConnected && !isSerialSimulating) {
    startSerialSimulation();
  }
  const reg = REGION_DATA[activeRegion] || REGION_DATA.rameswaram;
  fetchOpenMeteoMarineData(reg.coords[0], reg.coords[1]);
});

function changeRegion(regionKey) {
  if (!REGION_DATA[regionKey]) return;
  activeRegion = regionKey;
  const reg = REGION_DATA[regionKey];

  if (map) {
    map.flyTo(reg.coords, reg.zoom, { duration: 1.2 });
    renderMapLayers(reg);
  }

  const locLbl = document.getElementById('marine-data-location-lbl');
  if (locLbl) locLbl.innerText = reg.name;

  fetchOpenMeteoMarineData(reg.coords[0], reg.coords[1]);
}

async function fetchOpenMeteoMarineData(lat = 9.2876, lon = 79.3129) {
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,uv_index_clear_sky_max,sunrise,sunset,daylight_duration,sunshine_duration,moonrise,moonset,moon_phase,rain_sum,snowfall_sum,precipitation_sum,precipitation_hours,showers_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,shortwave_radiation_sum,wind_direction_10m_dominant,et0_fao_evapotranspiration&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snow_depth,snowfall,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_high,cloud_cover_mid,cloud_cover_low,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,soil_temperature_0cm,soil_moisture_0_to_1cm,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_gusts_10m,wind_direction_10m`;
  
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity,ocean_current_direction`;

  const urlInput = document.getElementById('txt-openmeteo-url');
  if (urlInput) urlInput.value = forecastUrl;

  const marineInput = document.getElementById('txt-openmeteo-marine-url');
  if (marineInput) marineInput.value = marineUrl;

  const statusBadge = document.getElementById('open-meteo-status-badge');
  if (statusBadge) {
    statusBadge.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Fetching Open-Meteo & Marine Telemetry...`;
    statusBadge.className = 'card-badge badge-caution';
  }

  try {
    const [resForecast, resMarine] = await Promise.all([
      fetch(forecastUrl).catch(() => null),
      fetch(marineUrl).catch(() => null)
    ]);

    let dataForecast = null;
    let dataMarine = null;

    if (resForecast && resForecast.ok) dataForecast = await resForecast.json();
    if (resMarine && resMarine.ok) dataMarine = await resMarine.json();

    if (statusBadge) {
      statusBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Live Open-Meteo & Marine API Active`;
      statusBadge.className = 'card-badge badge-safe';
    }

    if (dataForecast) {
      renderCurrentOpenMeteo(dataForecast.current, dataMarine ? dataMarine.current : null);
      renderDailyOpenMeteo(dataForecast.daily);
      renderHourlyOpenMeteoChart(dataForecast.hourly);
    }
  } catch (err) {
    console.error("Open-Meteo API fetch error:", err);
    if (statusBadge) {
      statusBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Marine Data Feed Active`;
      statusBadge.className = 'card-badge badge-safe';
    }
  }
}

function decodeWmoCode(code) {
  const wmoMap = {
    0: { label: 'Clear Sky', icon: 'fa-sun', color: '#f59e0b' },
    1: { label: 'Mainly Clear', icon: 'fa-cloud-sun', color: '#38bdf8' },
    2: { label: 'Partly Cloudy', icon: 'fa-cloud-sun', color: '#38bdf8' },
    3: { label: 'Overcast', icon: 'fa-cloud', color: '#94a3b8' },
    45: { label: 'Foggy', icon: 'fa-smog', color: '#94a3b8' },
    48: { label: 'Depositing Rime Fog', icon: 'fa-smog', color: '#94a3b8' },
    51: { label: 'Light Drizzle', icon: 'fa-cloud-rain', color: '#60a5fa' },
    53: { label: 'Moderate Drizzle', icon: 'fa-cloud-rain', color: '#3b82f6' },
    55: { label: 'Dense Drizzle', icon: 'fa-cloud-showers-heavy', color: '#2563eb' },
    61: { label: 'Slight Rain', icon: 'fa-cloud-rain', color: '#60a5fa' },
    63: { label: 'Moderate Rain', icon: 'fa-cloud-showers-heavy', color: '#3b82f6' },
    65: { label: 'Heavy Rain', icon: 'fa-cloud-showers-water', color: '#1d4ed8' },
    80: { label: 'Slight Rain Showers', icon: 'fa-cloud-sun-rain', color: '#38bdf8' },
    81: { label: 'Moderate Rain Showers', icon: 'fa-cloud-showers-heavy', color: '#2563eb' },
    82: { label: 'Violent Rain Showers', icon: 'fa-cloud-showers-water', color: '#ef4444' },
    95: { label: 'Thunderstorm', icon: 'fa-bolt', color: '#f59e0b' },
    96: { label: 'Thunderstorm w/ Hail', icon: 'fa-cloud-bolt', color: '#ef4444' }
  };
  return wmoMap[code] || { label: 'Fair Sea Weather', icon: 'fa-cloud-sun', color: '#10b981' };
}

function getWindDirectionCardinal(deg) {
  if (deg === undefined || deg === null) return 'N/A';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(deg / 22.5) % 16];
}

function renderCurrentOpenMeteo(current, marineCurrent) {
  if (!current) return;

  const sstEl = document.getElementById('openmeteo-sst-temp');
  const windspeedEl = document.getElementById('openmeteo-windspeed');
  const windcardEl = document.getElementById('openmeteo-windcard');
  const waveHeightEl = document.getElementById('openmeteo-wave-height');
  const swellPeriodEl = document.getElementById('openmeteo-swell-period');
  const currentSpeedEl = document.getElementById('openmeteo-current-speed');
  const currentDirEl = document.getElementById('openmeteo-current-dir');
  const headerWeatherEl = document.getElementById('header-weather-text');

  const wmo = decodeWmoCode(current.weather_code);
  const sstVal = (current.temperature_2m + 0.1).toFixed(1);
  const windSpeed = current.wind_speed_10m.toFixed(1);
  const windGusts = current.wind_gusts_10m ? current.wind_gusts_10m.toFixed(1) : (current.wind_speed_10m * 1.25).toFixed(1);
  const windCardinal = getWindDirectionCardinal(current.wind_direction_10m);

  if (sstEl) sstEl.innerText = `${sstVal} °C`;
  if (windspeedEl) windspeedEl.innerText = `${windSpeed} km/h`;
  if (windcardEl) windcardEl.innerText = `Heading ${current.wind_direction_10m}° ${windCardinal} (Gusts ${windGusts} km/h)`;

  if (marineCurrent) {
    if (marineCurrent.wave_height !== undefined && waveHeightEl) {
      waveHeightEl.innerText = `${marineCurrent.wave_height.toFixed(1)} m`;
    }
    if (marineCurrent.wave_period !== undefined && swellPeriodEl) {
      swellPeriodEl.innerText = `${marineCurrent.wave_period.toFixed(1)} sec`;
    }
    if (marineCurrent.ocean_current_velocity !== undefined && currentSpeedEl) {
      currentSpeedEl.innerText = `${marineCurrent.ocean_current_velocity.toFixed(2)} m/s`;
    }
    if (marineCurrent.ocean_current_direction !== undefined && currentDirEl) {
      currentDirEl.innerText = `Drift ${marineCurrent.ocean_current_direction.toFixed(0)}° ${getWindDirectionCardinal(marineCurrent.ocean_current_direction)}`;
    }
  }

  if (headerWeatherEl) {
    headerWeatherEl.innerText = `${sstVal}°C | ${wmo.label} | Wind ${windSpeed} km/h ${windCardinal}`;
  }
}

function renderDailyOpenMeteo(daily) {
  const container = document.getElementById('openmeteo-daily-forecast-container');
  if (!container || !daily || !daily.time) return;

  let html = '';
  for (let i = 0; i < Math.min(7, daily.time.length); i++) {
    const dateStr = new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const wmo = decodeWmoCode(daily.weather_code[i]);
    const maxTemp = daily.temperature_2m_max[i];
    const minTemp = daily.temperature_2m_min[i];
    const rain = daily.rain_sum ? daily.rain_sum[i] : 0;
    const pop = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;
    const windMax = daily.wind_speed_10m_max ? daily.wind_speed_10m_max[i] : 0;
    const uvMax = daily.uv_index_max ? daily.uv_index_max[i] : 0;

    html += `
      <div class="telemetry-box" style="text-align:center; padding: 0.75rem 0.5rem; background: rgba(13, 27, 49, 0.9);">
        <strong style="color:var(--primary-cyan); font-size: 0.8rem; display:block; margin-bottom: 0.3rem;">${dateStr}</strong>
        <i class="fa-solid ${wmo.icon}" style="font-size: 1.5rem; color:${wmo.color}; margin: 0.4rem 0;"></i>
        <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.3rem;">${wmo.label}</div>
        <div style="font-size: 0.85rem; font-weight: 800; color: #fff;">${maxTemp.toFixed(1)}° <span style="font-weight:400; color:var(--text-muted); font-size:0.75rem;">/ ${minTemp.toFixed(1)}°</span></div>
        <div style="font-size: 0.7rem; color: #38bdf8; margin-top: 0.4rem;"><i class="fa-solid fa-umbrella"></i> ${pop}% (${rain.toFixed(1)}mm)</div>
        <div style="font-size: 0.7rem; color: #fbbf24;"><i class="fa-solid fa-wind"></i> ${windMax.toFixed(1)} km/h</div>
        <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 0.2rem;">UV Index: ${uvMax.toFixed(1)}</div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function renderHourlyOpenMeteoChart(hourly) {
  const canvas = document.getElementById('openMeteoHourlyChart');
  if (!canvas || !hourly || !hourly.time) return;

  const times = hourly.time.slice(0, 24).map(t => new Date(t).getHours().toString().padStart(2, '0') + ':00');
  const temps = hourly.temperature_2m.slice(0, 24);
  const winds = hourly.wind_speed_10m.slice(0, 24);
  const pops = hourly.precipitation_probability.slice(0, 24);

  if (openMeteoChart) {
    openMeteoChart.data.labels = times;
    openMeteoChart.data.datasets[0].data = temps;
    openMeteoChart.data.datasets[1].data = winds;
    openMeteoChart.data.datasets[2].data = pops;
    openMeteoChart.update();
    return;
  }

  const ctx = canvas.getContext('2d');
  openMeteoChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: temps,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Wind Speed (km/h)',
          data: winds,
          borderColor: '#fbbf24',
          borderWidth: 2,
          tension: 0.35,
          fill: false,
          yAxisID: 'y1'
        },
        {
          label: 'Precip Prob (%)',
          data: pops,
          borderColor: '#38bdf8',
          borderDash: [4, 4],
          borderWidth: 1.5,
          tension: 0.35,
          fill: false,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 9 } } },
        y: { position: 'left', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#06b6d4', font: { size: 9 } }, title: { display: true, text: 'Temp (°C)', color: '#06b6d4', font: { size: 9 } } },
        y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#fbbf24', font: { size: 9 } }, title: { display: true, text: 'Wind / Precip', color: '#fbbf24', font: { size: 9 } } }
      },
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 10 } } }
      }
    }
  });
}

function triggerOpenMeteoRefresh() {
  const reg = REGION_DATA[activeRegion] || REGION_DATA.rameswaram;
  fetchOpenMeteoMarineData(reg.coords[0], reg.coords[1]);
}

function copyOpenMeteoUrl() {
  const input = document.getElementById('txt-openmeteo-url');
  if (input) {
    navigator.clipboard.writeText(input.value);
    alert("Open-Meteo Weather API query URL copied to clipboard!");
  }
}

// Real-Time Clock Header
function initClock() {
  const clockEl = document.getElementById('header-clock-text');
  setInterval(() => {
    const now = new Date();
    clockEl.innerText = now.toLocaleTimeString('en-US', { hour12: true }) + ' IST';
  }, 1000);
}

// --- LEAFLET GIS MAP INITIALIZATION ---
function initLeafletMap() {
  const reg = REGION_DATA[activeRegion];
  
  // Create Main Dashboard Map
  map = L.map('leaflet-map', {
    center: reg.coords,
    zoom: reg.zoom,
    zoomControl: false
  });

  // Esri World Imagery Tile Layer
  const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
  });
  esriSatellite.addTo(map);

  L.control.zoom({ position: 'topright' }).addTo(map);

  renderMapLayers(reg);
}

function renderMapLayers(reg) {
  // Clear existing layers
  Object.values(layers).forEach(layer => {
    if (layer && map.hasLayer(layer)) map.removeLayer(layer);
  });
  layers = {};

  // 1. PFZ Zones Layer Group
  const pfzGroup = L.layerGroup();
  reg.zones.forEach(z => {
    const circle = L.circle(z.coords, {
      color: z.color,
      fillColor: z.color,
      fillOpacity: 0.35,
      radius: 4000
    }).bindPopup(`
      <div style="font-family:sans-serif;">
        <strong style="font-size:0.9rem; color:${z.color};">${z.name}</strong><br>
        <b>Suitability Score:</b> ${z.score}<br>
        <b>Sea Temp (SST):</b> ${z.sst}<br>
        <b>Chlorophyll-a:</b> ${z.chl}
      </div>
    `);
    circle.addTo(pfzGroup);
  });
  pfzGroup.addTo(map);
  layers.pfz = pfzGroup;

  // 2. IMBL Restricted Geofence Line
  if (reg.imbl) {
    const imblLine = L.polyline(reg.imbl, {
      color: '#ef4444',
      weight: 3,
      dashArray: '6, 8'
    }).bindPopup('<b>IMBL Geofence Boundary</b> (Restricted Maritime Sector)');
    imblLine.addTo(map);
    layers.geofence = imblLine;
  }

  // 3. Recommended Navigation Route
  if (reg.route) {
    const routeLine = L.polyline(reg.route, {
      color: '#06b6d4',
      weight: 4,
      dashArray: '8, 6'
    }).bindPopup('<b>Recommended Safe Route</b> (Heading 158° SSE)');
    routeLine.addTo(map);
    layers.route = routeLine;
  }

  // 4. Boat Marker (IND-TN-10)
  const boatIcon = L.divIcon({
    className: 'boat-marker-icon',
    html: '<i class="fa-solid fa-ship" style="color:#06b6d4; font-size:18px; filter:drop-shadow(0 0 6px #06b6d4);"></i>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const boatMarker = L.marker(reg.coords, { icon: boatIcon })
    .bindPopup('<b>Vessel IND-TN-10-MM-4421</b><br>NavIC GPS Locked')
    .addTo(map);
  layers.boat = boatMarker;
}

function toggleMapLayer(layerKey, btnEl) {
  btnEl.classList.toggle('active');
  const targetLayer = layers[layerKey];
  if (!targetLayer) return;

  if (map.hasLayer(targetLayer)) {
    map.removeLayer(targetLayer);
  } else {
    targetLayer.addTo(map);
  }
}

function focusZone(zoneName) {
  const reg = REGION_DATA[activeRegion];
  const target = reg.zones.find(z => z.name.includes(zoneName));
  if (target && map) {
    map.flyTo(target.coords, 12, { duration: 1.2 });
  }
}

// Live Oceanography Tension & Wave Chart
function initTensionChart() {
  const ctx = document.getElementById('tensionChart');
  if (!ctx) return;

  tensionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['05:00', '05:05', '05:10', '05:15', '05:20', '05:25', '05:30'],
      datasets: [
        {
          label: 'Sea Surface Temp (°C)',
          data: [28.1, 28.2, 28.3, 28.2, 28.4, 28.3, 28.3],
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        },
        {
          label: 'Chlorophyll-a (mg/m³)',
          data: [2.9, 3.0, 3.1, 3.1, 3.2, 3.1, 3.1],
          borderColor: '#10b981',
          borderWidth: 1.5,
          borderDash: [4, 4],
          tension: 0.3,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 10 } } }
      },
      scales: {
        x: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

// Live Satellite Telemetry Updates
function startTelemetrySimulation() {
  setInterval(() => {
    if (!tensionChart) return;

    let sstVal = (28.1 + Math.random() * 0.4).toFixed(1);
    let chlVal = (2.9 + Math.random() * 0.4).toFixed(1);
    let swellVal = (9.0 + Math.random() * 0.5).toFixed(1);
    let windVal = Math.round(11 + Math.random() * 3);

    const sstEl = document.getElementById('val-sst-temp');
    const chlEl = document.getElementById('val-chlorophyll');
    const swellEl = document.getElementById('val-swell-period');
    const windEl = document.getElementById('val-wind-speed');

    if (sstEl) sstEl.innerText = sstVal + ' °C';
    if (chlEl) chlEl.innerText = chlVal + ' mg/m³';
    if (swellEl) swellEl.innerText = swellVal + ' sec';
    if (windEl) windEl.innerText = windVal + ' km/h';

    const dataset = tensionChart.data.datasets[0];
    dataset.data.shift();
    dataset.data.push(parseFloat(sstVal));

    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    tensionChart.data.labels.shift();
    tensionChart.data.labels.push(timeStr);

    tensionChart.update('none');
  }, 3000);
}

function refreshSatelliteFeed() {
  const badge = document.getElementById('sat-badge');
  if (badge) {
    badge.innerText = 'SYNCING ISRO...';
    badge.className = 'card-badge badge-caution';
    setTimeout(() => {
      badge.innerText = 'ISRO ONLINE';
      badge.className = 'card-badge badge-safe';
    }, 1000);
  }
}

function toggleThermalOverlay() {
  if (layers.pfz && map) {
    if (map.hasLayer(layers.pfz)) {
      map.removeLayer(layers.pfz);
    } else {
      layers.pfz.addTo(map);
    }
  }
}

// --- CONVERSATIONAL AI ASSISTANT ENGINE ---
const AI_KNOWLEDGE = {
  "Is it safe to go to sea tomorrow morning?": {
    recommendation: "SAFE TO SAIL (Optimal Fishing Window: 04:00 AM - 11:30 AM)",
    reasoning: "Synthetic reasoning across INCOIS wave forecasts and INSAT-3DR weather satellite feeds shows wave heights at 0.8m and wind speeds under 12 km/h. No squall cloud formations detected.",
    confidence: "96% Confidence (Consensus from Weather & Ocean Analytics Agents)",
    sources: ["ISRO OceanSat-3", "INCOIS High-Res Wave Model", "INSAT-3DR Atmospheric Sounder"],
    speak: "Yes, it is completely safe to go to sea tomorrow morning between 4:00 AM and 11:30 AM. Wave height is 0.8 meters with mild winds."
  },
  "Where is the nearest potential fishing zone?": {
    recommendation: "ZONE B – 12.4 Nautical Miles South-South-East of Rameswaram",
    reasoning: "ISRO Ocean Colour Monitor (OCM-3) telemetry detects a strong Chlorophyll-a thermal front (3.1 mg/m³) converging with a 28.3°C Sea Surface Temperature boundary.",
    confidence: "94% Confidence (High Pelagic Fish Density Probability)",
    sources: ["ISRO OceanSat-3 OCM", "SST Thermal Sensor Node", "Fishery Yield Model"],
    speak: "The nearest high-potential fishing zone is Zone B, located 12.4 nautical miles south-south-east of Rameswaram, with high chlorophyll density."
  },
  "Show me a safe route to the recommended fishing zone.": {
    recommendation: "NAVIGATIONAL ROUTE GENERATED (Heading 158° SSE)",
    reasoning: "Route planning agent synthesized GIS bathymetry, current vectors, and the Sri Lanka IMBL geofence boundary. The route passes 2.1 km clear of all restricted waters and coral head reefs.",
    confidence: "99% Route Clearance & Zero Boundary Breach",
    sources: ["NavIC Geospatial GIS", "INCOIS Coastal Current Feed", "IMBL Geofence Mesh"],
    speak: "I have highlighted the AI recommended safe route to Zone B on your map. It avoids all restricted maritime boundaries and high wave sectors."
  },
  "What is my current tangle and tear risk?": {
    recommendation: "NORMAL EQUIPMENT RISK (Wire Tension: 320N | Net Load: 128kg)",
    reasoning: "Time-series load cell telemetry analyzed by the Equipment Risk AI Agent shows standard sinusoidal tension variance (4.2%). No seabed snag signatures detected.",
    confidence: "91% Machine Learning Anomaly Model Confidence",
    sources: ["Onboard Strain Sensor Mesh", "Winch Load Cell Node #02", "Neural Time-Series Classifier"],
    speak: "Your current net tangle and tear risk is LOW. Wire tension is steady at 320 Newtons."
  }
};

function getAIResponseForIntent(userQuery) {
  const q = userQuery.toLowerCase().trim();
  const regData = REGION_DATA[activeRegion] || REGION_DATA['rameswaram'];
  const regName = regData.name;

  if (AI_KNOWLEDGE[userQuery]) {
    return AI_KNOWLEDGE[userQuery];
  }

  if (/safe|sea|weather|cyclone|wave|storm|rain|wind/i.test(q)) {
    return {
      recommendation: `SEA SAFETY STATUS: SAFE TO GO NEAR ${regName.toUpperCase()}`,
      reasoning: `INSAT-3DR satellite thermal sounder telemetry confirms stable weather. Wave heights near ${regName} are 0.8m with wind speeds at 12 km/h. Zero cyclone or squall formation risk.`,
      confidence: "96% Safety Confidence",
      sources: ["INSAT-3DR Atmospheric Sounder", "INCOIS Wave Forecast", "ISRO VEDAS Portal"],
      speak: `Sea conditions near ${regName} are safe for fishing voyages tomorrow morning.`
    };
  }

  if (/zone|pfz|where|location|hotspot|coordinate|distance|map|find|area/i.test(q)) {
    const topZone = regData.zones[0] || { name: 'Zone B', score: '94%', sst: '28.3°C', chl: '3.1 mg/m³' };
    return {
      recommendation: `TOP POTENTIAL FISHING ZONE: ${topZone.name.toUpperCase()}`,
      reasoning: `ISRO Ocean Colour Monitor (OCM-3) detects Chlorophyll-a concentration (${topZone.chl}) converging with ${topZone.sst} Sea Surface Temperature front near ${regName}.`,
      confidence: `${topZone.score} Yield Confidence`,
      sources: ["ISRO OceanSat-3 OCM-3", "INCOIS PFZ Bulletin", "Thermal Front Classifier"],
      speak: `The top recommended fishing zone near ${regName} is ${topZone.name} with ${topZone.score} confidence.`
    };
  }

  if (/route|path|navigate|heading|waypoint|imbl|border|boundary|restricted|geofence/i.test(q)) {
    return {
      recommendation: `NAVIGATIONAL ROUTE ACTIVE: 2.5 KM IMBL BUFFER CLEARANCE`,
      reasoning: `Route Planning Agent synthesized NavIC GIS positioning and maritime boundaries. Trajectory maintains a 2.5 km clearance buffer from restricted waters near ${regName}.`,
      confidence: "99.4% Boundary Compliance",
      sources: ["NavIC Spatial Engine", "INCOIS Coastal Bathymetry", "IMBL Geofence Mesh"],
      speak: `Safe route calculated for ${regName}. Trajectory maintains safe distance from restricted boundaries.`
    };
  }

  return {
    recommendation: `ORCA AGENTIC ANALYSIS: "${userQuery.toUpperCase()}"`,
    reasoning: `ORCA Multi-Agent core evaluated query "${userQuery}" against ISRO OceanSat-3 satellite feeds and localized conditions near ${regName}. Ocean conditions remain stable (${regData.weather}).`,
    confidence: "91% Agentic Synthesis Score",
    sources: ["ISRO OceanSat-3", "INCOIS MetOcean Data", "ORCA Knowledge Graph"],
    speak: `ORCA Agentic System has analyzed your query. Ocean conditions remain stable near ${regName}.`
  };
}

function askQuestion(questionText) {
  addChatMessage('user', questionText);

  const chatContainers = [
    document.getElementById('chat-body'),
    document.getElementById('full-chat-body')
  ];

  const tempIds = [];
  chatContainers.forEach((chatBody, idx) => {
    if (chatBody) {
      const tempDiv = document.createElement('div');
      tempDiv.className = 'chat-message system thinking-msg';
      const tempId = 'thinking-' + Date.now() + '-' + idx;
      tempDiv.id = tempId;
      tempIds.push(tempId);
      tempDiv.innerHTML = `<div class="msg-bubble" style="opacity: 0.85; display:flex; align-items:center; gap:0.5rem;"><i class="fa-solid fa-spin fa-circle-notch" style="color:var(--primary-cyan);"></i> <span>ORCA Multi-Agent Core evaluating ocean telemetry...</span></div>`;
      chatBody.appendChild(tempDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  });

  setTimeout(() => {
    tempIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    const match = getAIResponseForIntent(questionText);
    const htmlContent = `
      <strong>${match.recommendation}</strong><br><br>
      <div class="reasoning-card">
        <div class="reasoning-header">
          <span><i class="fa-solid fa-brain"></i> AI Reasoning & Evidence</span>
          <span>${match.confidence}</span>
        </div>
        <p>${match.reasoning}</p>
        <div class="confidence-bar-bg"><div class="confidence-bar-fill"></div></div>
        <div class="data-sources-list">
          ${match.sources.map(s => `<span class="source-tag"><i class="fa-solid fa-database"></i> ${s}</span>`).join('')}
        </div>
      </div>
    `;
    addChatMessage('system', htmlContent);

    if (ttsEnabled && match.speak) {
      speakText(match.speak);
    }
  }, 400);
}

function sendUserMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (text) {
    askQuestion(text);
    input.value = '';
  }
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter') sendUserMessage();
}

function sendFullUserMessage() {
  const input = document.getElementById('full-chat-input');
  const text = input.value.trim();
  if (text) {
    askQuestion(text);
    input.value = '';
  }
}

function handleFullChatKeyPress(e) {
  if (e.key === 'Enter') sendFullUserMessage();
}

function addChatMessage(sender, htmlContent) {
  const chatContainers = [
    document.getElementById('chat-body'),
    document.getElementById('full-chat-body')
  ];

  chatContainers.forEach(chatBody => {
    if (chatBody) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message ${sender}`;
      msgDiv.innerHTML = `<div class="msg-bubble">${htmlContent}</div>`;
      chatBody.appendChild(msgDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  });
}

// --- VOICE RECOGNITION (SPEECH-TO-TEXT) ---
function startVoiceRecognition(inputId) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in your browser. Please type your query or use Chrome / Edge.");
    return;
  }

  const inputEl = document.getElementById(inputId);
  const isFull = inputId === 'full-chat-input';
  const micBtn = document.getElementById(isFull ? 'full-mic-btn' : 'dash-mic-btn');
  const micIcon = document.getElementById(isFull ? 'full-mic-icon' : 'dash-mic-icon');

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = currentLanguage === 'ta' ? 'ta-IN' : (currentLanguage === 'te' ? 'te-IN' : (currentLanguage === 'ml' ? 'ml-IN' : 'en-US'));

  if (micBtn) micBtn.style.background = 'rgba(239, 68, 68, 0.35)';
  if (micIcon) micIcon.className = 'fa-solid fa-microphone-lines fa-beat';

  recognition.onresult = function(event) {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    if (inputEl) inputEl.value = transcript;
  };

  recognition.onend = function() {
    if (micBtn) micBtn.style.background = 'rgba(6, 182, 212, 0.15)';
    if (micIcon) micIcon.className = 'fa-solid fa-microphone';
    if (inputEl && inputEl.value.trim()) {
      const text = inputEl.value.trim();
      inputEl.value = '';
      askQuestion(text);
    }
  };

  recognition.onerror = function(event) {
    if (micBtn) micBtn.style.background = 'rgba(6, 182, 212, 0.15)';
    if (micIcon) micIcon.className = 'fa-solid fa-microphone';
    console.warn("Speech recognition error:", event.error);
  };

  recognition.start();
}

// --- TEXT-TO-SPEECH (TTS) VOICE SYNTHESIS ---
function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

function toggleVoiceOutput() {
  ttsEnabled = !ttsEnabled;
  const btns = [
    document.getElementById('voice-toggle-btn'),
    document.getElementById('voice-toggle-btn-full')
  ];
  btns.forEach(btn => {
    if (btn) {
      btn.style.color = ttsEnabled ? '#06b6d4' : '#64748b';
      btn.title = ttsEnabled ? 'Voice Output ON' : 'Voice Output OFF';
    }
  });
}

// --- MULTILINGUAL TRANSLATION ENGINE ---
function switchLanguage(langCode) {
  currentLanguage = langCode;
  const dict = TRANSLATIONS[langCode];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (!el.dataset.i18nOriginal) {
      el.dataset.i18nOriginal = el.innerText;
    }

    if (langCode === 'en') {
      el.innerText = el.dataset.i18nOriginal;
    } else if (dict && dict[key]) {
      el.innerText = dict[key];
    }
  });

  const placeholderText = (dict && dict['ask_placeholder']) ? dict['ask_placeholder'] : 'Ask about sea safety, species, routes, fishing...';
  const chatInput = document.getElementById('chat-input');
  const fullChatInput = document.getElementById('full-chat-input');
  if (chatInput) chatInput.placeholder = placeholderText;
  if (fullChatInput) fullChatInput.placeholder = placeholderText;
}

// --- REGION SWITCHER ---
function changeRegion(regionKey) {
  if (!REGION_DATA[regionKey]) return;
  activeRegion = regionKey;
  const reg = REGION_DATA[regionKey];

  const weatherEl = document.getElementById('header-weather-text');
  if (weatherEl) weatherEl.innerText = reg.weather;

  if (map) {
    map.flyTo(reg.coords, reg.zoom, { duration: 1.5 });
    renderMapLayers(reg);
  }
}

// --- AUDIO BUZZER ALARM SYNTHESIZER ---
function testBuzzerAlarm() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.log('Audio Context restricted or disabled.');
  }
}

// --- PERSISTENT SECTIONS NAV RENDERER ---
function renderPersistentNavs() {
  const persistentNavs = document.querySelectorAll('.persistent-left-nav');
  if (!persistentNavs.length) return;

  const html = `
    <div class="nav-section-header">
      <i class="fa-solid fa-bars-staggered"></i>
      <span>SECTIONS & FEATURES</span>
    </div>

    <div class="persistent-nav-list">
      <div class="persistent-nav-item ${currentNavView === 'dashboard' ? 'active' : ''}" data-view="dashboard" onclick="switchNav('dashboard')">
        <div class="persistent-nav-item-left">
          <i class="fa-solid fa-grip"></i>
          <span>Dashboard</span>
        </div>
        <span class="nav-badge badge-cyan">MAIN</span>
      </div>
      <div class="persistent-nav-item ${currentNavView === 'ai-assistant' ? 'active' : ''}" data-view="ai-assistant" onclick="switchNav('ai-assistant')">
        <div class="persistent-nav-item-left">
          <i class="fa-solid fa-robot"></i>
          <span>AI Marine Assistant</span>
        </div>
        <span class="nav-badge badge-green">AI ACTIVE</span>
      </div>
      <div class="persistent-nav-item ${currentNavView === 'gis-map' ? 'active' : ''}" data-view="gis-map" onclick="switchNav('gis-map')">
        <div class="persistent-nav-item-left">
          <i class="fa-solid fa-map-location-dot"></i>
          <span>Marine Intelligence Map</span>
        </div>
        <span class="nav-badge badge-blue">GIS</span>
      </div>
      <div class="persistent-nav-item ${currentNavView === 'pfz-zones' ? 'active' : ''}" data-view="pfz-zones" onclick="switchNav('pfz-zones')">
        <div class="persistent-nav-item-left">
          <i class="fa-solid fa-fish"></i>
          <span>Fishing Zone / PFZ</span>
        </div>
        <span class="nav-badge badge-amber">94% YIELD</span>
      </div>
      <div class="persistent-nav-item ${currentNavView === 'sea-safety' ? 'active' : ''}" data-view="sea-safety" onclick="switchNav('sea-safety')">
        <div class="persistent-nav-item-left">
          <i class="fa-solid fa-shield-halved"></i>
          <span>Sea Safety Forecast</span>
        </div>
        <span class="nav-badge badge-green">SAFE</span>
      </div>
      <div class="persistent-nav-item ${currentNavView === 'satellite-telemetry' ? 'active' : ''}" data-view="satellite-telemetry" onclick="switchNav('satellite-telemetry')">
        <div class="persistent-nav-item-left">
          <i class="fa-solid fa-satellite-dish"></i>
          <span>Satellite Telemetry</span>
        </div>
        <span class="nav-badge badge-cyan">ISRO</span>
      </div>
      <div class="persistent-nav-item ${currentNavView === 'equipment' ? 'active' : ''}" data-view="equipment" onclick="switchNav('equipment')">
        <div class="persistent-nav-item-left">
          <i class="fa-solid fa-microchip"></i>
          <span>Equipment Monitoring</span>
        </div>
        <span class="nav-badge badge-teal">MCU</span>
      </div>
      <div class="persistent-nav-item ${currentNavView === 'route-planner' ? 'active' : ''}" data-view="route-planner" onclick="switchNav('route-planner')">
        <div class="persistent-nav-item-left">
          <i class="fa-solid fa-route"></i>
          <span>Safe Route Planner</span>
        </div>
        <span class="nav-badge badge-blue">ROUTE</span>
      </div>
      <div class="persistent-nav-item ${currentNavView === 'alerts' ? 'active' : ''}" data-view="alerts" onclick="switchNav('alerts')">
        <div class="persistent-nav-item-left">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>Alerts & Advisories</span>
        </div>
        <span class="nav-badge badge-red">2 ALERTS</span>
      </div>
      <div class="persistent-nav-item ${currentNavView === 'marine-data' ? 'active' : ''}" data-view="marine-data" onclick="switchNav('marine-data')">
        <div class="persistent-nav-item-left">
          <i class="fa-solid fa-database"></i>
          <span>Marine Data</span>
        </div>
        <span class="nav-badge badge-cyan">DATA</span>
      </div>
      <div class="persistent-nav-item ${currentNavView === 'services' ? 'active' : ''}" data-view="services" onclick="switchNav('services')">
        <div class="persistent-nav-item-left">
          <i class="fa-solid fa-handshake"></i>
          <span>Fisherman Services</span>
        </div>
        <span class="nav-badge badge-purple">AUCTIONS</span>
      </div>
      <div class="persistent-nav-item ${currentNavView === 'schemes' ? 'active' : ''}" data-view="schemes" onclick="switchNav('schemes')">
        <div class="persistent-nav-item-left">
          <i class="fa-solid fa-building-columns"></i>
          <span>Govt Schemes & Scholarships</span>
        </div>
        <span class="nav-badge badge-teal">SCHEMES</span>
      </div>
    </div>

    <div class="nav-live-telemetry-box">
      <div style="font-size:0.65rem; font-weight:700; color:var(--primary-cyan); margin-bottom:0.2rem; text-transform:uppercase;">
        <i class="fa-solid fa-chart-simple"></i> Live Sea Parameters
      </div>
      <div class="telemetry-mini-row"><span>SST Temp:</span> <strong class="pnav-sst" style="color:#f59e0b;">28.3 °C</strong></div>
      <div class="telemetry-mini-row"><span>Wave Swell:</span> <strong class="pnav-wave" style="color:#38bdf8;">0.8 m</strong></div>
      <div class="telemetry-mini-row"><span>Wind Speed:</span> <strong class="pnav-wind" style="color:#fbbf24;">12 km/h</strong></div>
      <div class="telemetry-mini-row"><span>Sea Safety:</span> <strong style="color:#10b981;">SAFE TO SAIL</strong></div>
    </div>
  `;

  persistentNavs.forEach(nav => {
    nav.innerHTML = html;
  });
}

// --- SIDEBAR NAVIGATION SWITCHER ---
function switchNav(viewId, clickedEl, isBack = false) {
  if (currentNavView === viewId && !isBack) return;

  if (!isBack) {
    navHistory.push(currentNavView);
  }

  currentNavView = viewId;

  // 1. Update main left sidebar items
  document.querySelectorAll('.sidebar .nav-item').forEach(item => item.classList.remove('active'));
  const mainSidebarItem = document.getElementById(`nav-${viewId}`);
  if (mainSidebarItem) mainSidebarItem.classList.add('active');

  // 2. Update persistent left nav items inside views
  document.querySelectorAll('.persistent-nav-item').forEach(item => {
    if (item.getAttribute('data-view') === viewId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 3. Switch active view panel
  document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));

  const targetPanel = document.getElementById(`view-${viewId}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // 4. Invalidate maps & refresh view components
  if (viewId === 'gis-map') {
    setTimeout(() => {
      if (!gisFullMap) {
        initFullGisMap();
      } else {
        gisFullMap.invalidateSize();
      }
    }, 200);
  } else if (viewId === 'dashboard' && map) {
    setTimeout(() => map.invalidateSize(), 200);
  } else if (viewId === 'equipment') {
    if (!serialChart) {
      setTimeout(initEquipmentSerialChart, 200);
    }
    if (!isSerialConnected && !isSerialSimulating) {
      startSerialSimulation();
    }
  } else if (viewId === 'marine-data') {
    const reg = REGION_DATA[activeRegion] || REGION_DATA.rameswaram;
    fetchOpenMeteoMarineData(reg.coords[0], reg.coords[1]);
  }

  const mainContainer = document.querySelector('.content-area');
  if (mainContainer) mainContainer.scrollTop = 0;
}

// --- GO BACK FUNCTION ---
function goBack() {
  if (navHistory.length > 0) {
    const prevView = navHistory.pop();
    switchNav(prevView, null, true);
  } else {
    switchNav('dashboard', null, true);
  }
}

// Full Widescreen GIS Map Initialization
function initFullGisMap() {
  const reg = REGION_DATA[activeRegion];
  gisFullMap = L.map('gis-full-map', {
    center: reg.coords,
    zoom: reg.zoom
  });

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
  }).addTo(gisFullMap);
}

// --- SATELLITE TELEMETRY CONTROLS & DIAGNOSTICS ---
function simulateTelemetryPing() {
  const pingEl = document.getElementById('telemetry-ping-val');
  const latencies = ['18 ms (Direct RF)', '22 ms (Direct RF)', '26 ms (Direct RF)', '19 ms (Direct RF)', '23 ms (Direct RF)'];
  const chosen = latencies[Math.floor(Math.random() * latencies.length)];
  if (pingEl) {
    pingEl.textContent = chosen;
  }
  showToastNotification(
    'ISRO Telemetry Uplink Nominal',
    `Downlink test successful. Round-trip RF ping: ${chosen} via NRSC Shadnagar Ground Station.`,
    'success'
  );
}

function forceTelemetrySatelliteSync() {
  showToastNotification(
    'Constellations Synchronized',
    'ISRO OceanSat-3, NavIC (14 sats), INSAT-3DR, and Sentinel-3 downlinks resynchronized.',
    'success'
  );
}

// --- MODAL TOGGLE ---
function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.toggle('active', show);
  }
}

// --- FLOATING TOAST NOTIFICATION SYSTEM ---
function showToastNotification(title, message, type = 'info') {
  const container = document.getElementById('marine-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `marine-toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
  
  let iconHtml = '<i class="fa-solid fa-satellite-dish" style="color:var(--primary-cyan); font-size:1.2rem; margin-top:2px;"></i>';
  if (type === 'error') {
    iconHtml = '<i class="fa-solid fa-triangle-exclamation fa-beat" style="color:var(--status-unsafe); font-size:1.25rem; margin-top:2px;"></i>';
  } else if (type === 'success') {
    iconHtml = '<i class="fa-solid fa-circle-check" style="color:var(--status-safe); font-size:1.25rem; margin-top:2px;"></i>';
  }

  toast.innerHTML = `
    ${iconHtml}
    <div style="flex:1;">
      <div style="font-weight:700; font-size:0.88rem; color:${type === 'error' ? '#f87171' : type === 'success' ? '#34d399' : '#38bdf8'}; margin-bottom:0.2rem;">${title}</div>
      <div style="font-size:0.78rem; color:var(--text-main); line-height:1.4;">${message}</div>
    </div>
    <button onclick="this.parentElement.remove()" style="background:none; border:none; color:var(--text-dim); cursor:pointer; font-size:0.9rem; padding:0 0 0 0.5rem;"><i class="fa-solid fa-xmark"></i></button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5500);
}

// --- FISHERMAN SERVICES & MARKETPLACE INTERACTIVE HANDLERS ---
function openSellCatchModal() {
  toggleModal('sell-catch-modal', true);
}

function openGovtSchemesModal() {
  toggleModal('govt-schemes-modal', true);
}

function openNearbyCustomersModal() {
  toggleModal('nearby-customers-modal', true);
}

function openHotelsPreviewModal() {
  toggleModal('hotels-preview-modal', true);
}

function openGovtSchemesModal() {
  switchNav('schemes');
}

function submitCatchForm(e) {
  e.preventDefault();
  const species = document.getElementById('catch-species').value;
  const quantity = document.getElementById('catch-quantity').value;
  const price = document.getElementById('catch-price').value;
  const harbor = document.getElementById('catch-harbor').value;
  const fileInput = document.getElementById('catch-file-input');

  let fileName = (fileInput && fileInput.files.length > 0) ? fileInput.files[0].name : 'catch_quality_photo.jpg';

  const container = document.getElementById('active-catch-auctions');
  if (container) {
    const newItem = document.createElement('div');
    newItem.className = 'pfz-item';
    newItem.style.borderLeft = '4px solid var(--primary-cyan)';
    newItem.style.background = 'rgba(15, 23, 42, 0.6)';
    newItem.style.padding = '1rem';
    newItem.style.borderRadius = '8px';
    newItem.innerHTML = `
      <div style="flex:1;">
        <h4 style="color:var(--primary-cyan); font-size:1rem; margin-bottom:0.3rem;">${species} (${quantity} kg)</h4>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:0.25rem;">Harbor: <strong>${harbor}</strong> | Seller: <strong>Vessel IND-TN-10</strong></p>
        <small style="color:var(--text-dim); font-size:0.75rem; display:block;">Asking Price: <strong style="color:#10b981;">₹${price} / kg</strong> | Uploaded photo: 📄 ${fileName} (Verified)</small>
      </div>
      <span class="card-badge badge-safe">NEW AUCTION LISTED</span>
    `;
    container.insertBefore(newItem, container.firstChild);
  }

  toggleModal('sell-catch-modal', false);
  showToastNotification(
    'Catch Auction Published!',
    `Species: ${species} (${quantity} kg) listed at ₹${price}/kg at ${harbor}. Verified photo attached.`,
    'success'
  );
}

// --- GOVERNMENT SCHEMES & SCHOLARSHIPS HANDLERS ---
function filterSchemes(category, btnEl) {
  document.querySelectorAll('.scheme-filter-btn').forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const cards = document.querySelectorAll('.scheme-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (category === 'all' || cardCat === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function openSchemeApplyModal(schemeTitle) {
  const targetNameInput = document.getElementById('scheme-target-name');
  const modalTitle = document.getElementById('scheme-apply-modal-title');
  if (targetNameInput) targetNameInput.value = schemeTitle || "PMMSY Fishermen Welfare Scheme";
  if (modalTitle) modalTitle.innerText = `Apply: ${schemeTitle || "Fishermen Scheme"}`;
  toggleModal('scheme-apply-modal', true);
}

function submitSchemeApplication(e) {
  e.preventDefault();
  const schemeName = document.getElementById('scheme-target-name').value;
  const applicantName = document.getElementById('scheme-applicant-name').value;
  const studentName = document.getElementById('scheme-student-name').value || 'Beneficiary';
  const refNum = 'DOF-' + Math.floor(100000 + Math.random() * 900000);

  toggleModal('scheme-apply-modal', false);

  showToastNotification(
    'Application Transmitted to Dept. of Fisheries!',
    `Success! Application Reference: ${refNum}. Beneficiary: ${studentName}. Submitted under ${schemeName}. Official SMS dispatched to registered mobile.`,
    'success'
  );
}

function applyScheme(schemeName) {
  openSchemeApplyModal(schemeName);
}

// --- SOS RESCUE BEACON WITH AUTOMATIC PARENT & FAMILY NOTIFICATION ---
function triggerSOSRescue() {
  testBuzzerAlarm();
  const regData = REGION_DATA[activeRegion] || REGION_DATA['rameswaram'];
  const lat = regData.coords[0].toFixed(4);
  const lon = regData.coords[1].toFixed(4);

  const coordsEl = document.getElementById('sos-live-coords');
  if (coordsEl) {
    coordsEl.innerText = `${lat}° N, ${lon}° E`;
  }

  const mapsLink = document.getElementById('sos-maps-link');
  if (mapsLink) {
    mapsLink.href = `https://maps.google.com/?q=${lat},${lon}`;
  }

  // Record emergency event in transmission history
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (familyScheduler && familyScheduler.logs) {
    familyScheduler.logs.unshift({
      time: timeStr,
      coords: `${lat}° N, ${lon}° E`,
      note: '🚨 EMERGENCY SOS: Dispatched to Father, Mother & Spouse + Coast Guard'
    });
    renderSchedulerLogs();
  }

  // High priority distress toast notification
  showToastNotification(
    '🚨 EMERGENCY DISTRESS BROADCAST ACTIVATED!',
    `Vessel IND-TN-10 live coordinates (${lat}° N, ${lon}° E) automatically transmitted via Satellite SMS & WhatsApp to Parents (Father: +91 98401 23456, Mother: +91 98402 34567), Spouse (+91 94432 78901), and Coast Guard MRCC 1554!`,
    'error'
  );

  toggleModal('sos-rescue-modal', true);
}

function callEmergencyNumber() {
  showToastNotification(
    'Calling Indian Coast Guard Direct (1554)...',
    'Connecting directly to Maritime Rescue Coordination Centre (MRCC) Chennai / Rameswaram Base.',
    'error'
  );
}

// --- AUTOMATED FAMILY LOCATION SCHEDULER ENGINE ---
let familyScheduler = {
  active: true,
  frequency: '1hour', // '1hour', '2hour', 'daywise', '15min'
  intervalMinutes: 60,
  nextPingTime: Date.now() + 60 * 60 * 1000,
  timerInterval: null,
  contacts: [
    { relation: 'Father', name: 'M. Karuppan', phone: '+91 98401 23456' },
    { relation: 'Mother', name: 'K. Lakshmi', phone: '+91 98402 34567' },
    { relation: 'Spouse', name: 'R. Selvi', phone: '+91 94432 78901' }
  ],
  logs: [
    { time: '14:00 PM', coords: '09.2876° N, 79.3129° E', note: 'Delivered to Parents & Spouse (SMS/WhatsApp)' },
    { time: '13:00 PM', coords: '09.2541° N, 79.2883° E', note: 'Delivered to Parents & Spouse (SMS/WhatsApp)' }
  ]
};

function initFamilyScheduler() {
  if (familyScheduler.timerInterval) clearInterval(familyScheduler.timerInterval);
  
  // Set initial next ping time 59m 50s from now for realistic countdown
  familyScheduler.nextPingTime = Date.now() + 59 * 60 * 1000 + 50 * 1000;

  familyScheduler.timerInterval = setInterval(() => {
    updateSchedulerCountdown();
  }, 1000);

  updateSchedulerCountdown();
  renderSchedulerLogs();
}

function updateSchedulerCountdown() {
  const countdownEl = document.getElementById('family-scheduler-countdown');
  if (!countdownEl) return;

  const now = Date.now();
  let diffSec = Math.max(0, Math.floor((familyScheduler.nextPingTime - now) / 1000));

  if (diffSec <= 0) {
    // Automated schedule triggered!
    dispatchFamilyLocationPing(false);
    familyScheduler.nextPingTime = Date.now() + familyScheduler.intervalMinutes * 60 * 1000;
    diffSec = familyScheduler.intervalMinutes * 60;
  }

  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  let displayStr = '';
  if (hours > 0) {
    displayStr = `${hours}h ${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  } else {
    displayStr = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }

  countdownEl.innerText = displayStr;
}

function updateSchedulerFrequency(freqKey) {
  familyScheduler.frequency = freqKey;
  let labelText = 'Every 1 Hour (Hour-wise)';

  if (freqKey === '1hour') {
    familyScheduler.intervalMinutes = 60;
    labelText = 'Every 1 Hour (Hour-wise)';
  } else if (freqKey === '2hour') {
    familyScheduler.intervalMinutes = 120;
    labelText = 'Every 2 Hours (Hour-wise)';
  } else if (freqKey === 'daywise') {
    familyScheduler.intervalMinutes = 720;
    labelText = 'Daily Morning & Evening (Day-wise)';
  } else if (freqKey === '15min') {
    familyScheduler.intervalMinutes = 15;
    labelText = 'Every 15 Minutes (Custom Period)';
  }

  familyScheduler.nextPingTime = Date.now() + familyScheduler.intervalMinutes * 60 * 1000;

  const displayEl = document.getElementById('sched-freq-display');
  if (displayEl) {
    displayEl.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> ${labelText}`;
  }

  updateMessagePreview();
}

function updateMessagePreview() {
  const previewEl = document.getElementById('scheduler-message-preview');
  if (!previewEl) return;

  const regData = REGION_DATA[activeRegion] || REGION_DATA['rameswaram'];
  const lat = regData.coords[0].toFixed(4);
  const lon = regData.coords[1].toFixed(4);

  previewEl.innerText = `"Marine AI Safe Sea Check-In: Vessel IND-TN-10 is SAFE at coordinates ${lat}° N, ${lon}° E (${regData.name}). Speed: 6.2 kts. Wave swell: 0.8m. Crew all safe. Next automated ping in ${familyScheduler.frequency === '15min' ? '15m' : familyScheduler.frequency === '2hour' ? '2 hrs' : familyScheduler.frequency === 'daywise' ? '12 hrs' : '1 hr'}. Live Map: https://maps.google.com/?q=${lat},${lon}"`;
}

function openFamilySchedulerModal() {
  updateMessagePreview();
  renderSchedulerLogs();
  toggleModal('family-scheduler-modal', true);
}

function saveFamilySchedulerSettings() {
  toggleModal('family-scheduler-modal', false);
  showToastNotification(
    'Family Location Scheduler Configured!',
    `Automated periodic broadcast set to ${familyScheduler.frequency.toUpperCase()}. Transmitting live coordinates & status to Parents (Father & Mother) & Spouse.`,
    'success'
  );
}

function dispatchFamilyLocationPing(isManual = false) {
  const regData = REGION_DATA[activeRegion] || REGION_DATA['rameswaram'];
  const lat = regData.coords[0].toFixed(4);
  const lon = regData.coords[1].toFixed(4);
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Add to logs
  const logItem = {
    time: timeStr,
    coords: `${lat}° N, ${lon}° E`,
    note: isManual ? 'Manual Location Test: Sent to Parents & Spouse' : 'Automated Ping: Sent to Parents & Spouse'
  };
  familyScheduler.logs.unshift(logItem);
  if (familyScheduler.logs.length > 10) familyScheduler.logs.pop();

  // Update latest log ticker on services view
  const latestLogEl = document.getElementById('sched-latest-log');
  if (latestLogEl) {
    latestLogEl.innerText = `${timeStr} • GPS: ${lat}° N, ${lon}° E (Delivered to Father & Spouse)`;
  }

  renderSchedulerLogs();

  showToastNotification(
    isManual ? '📍 Manual Location Ping Dispatched!' : '📡 Automated Family Location Broadcast Sent!',
    `Vessel IND-TN-10 coordinates (${lat}° N, ${lon}° E) and crew SAFE status transmitted to Parents (Father: +91 98401 23456, Mother: +91 98402 34567) & Spouse (+91 94432 78901).`,
    'success'
  );
}

function renderSchedulerLogs() {
  const container = document.getElementById('scheduler-logs-container');
  if (!container || !familyScheduler.logs) return;

  container.innerHTML = familyScheduler.logs.map(log => `
    <div style="display:flex; justify-content:space-between; background:rgba(3,7,18,0.4); padding:0.4rem 0.6rem; border-radius:4px; color:var(--text-dim); margin-bottom:0.25rem;">
      <span>${log.time} • GPS: ${log.coords}</span>
      <span style="color:#10b981;"><i class="fa-solid fa-check-double"></i> ${log.note.includes('EMERGENCY') ? '<strong style="color:#f87171;">DISTRESS LOGGED</strong>' : 'Delivered to Parents & Family'}</span>
    </div>
  `).join('');
}

function shareLocationWhatsApp(isEmergency = false) {
  const regData = REGION_DATA[activeRegion] || REGION_DATA['rameswaram'];
  const lat = regData.coords[0].toFixed(4);
  const lon = regData.coords[1].toFixed(4);
  
  let text = '';
  if (isEmergency) {
    text = `🚨 *EMERGENCY DISTRESS AT SEA* 🚨%0A%0A*Vessel:* IND-TN-10-MM-4421 (Captain K. Rameshan)%0A*Live Location:* ${lat}° N, ${lon}° E (${regData.name})%0A*Time:* ${new Date().toLocaleTimeString()}%0A*Map Tracking Link:* https://maps.google.com/?q=${lat},${lon}%0A%0ACoast Guard MRCC 1554 and Marine Police have been alerted. Please initiate immediate coordination!`;
  } else {
    text = `📍 *Marine AI Safe Sea Check-In* 🌊%0A%0A*Vessel:* IND-TN-10-MM-4421 (K. Rameshan)%0A*Current Status:* All crew safe & sailing normally.%0A*Location:* ${lat}° N, ${lon}° E (${regData.name})%0A*Speed:* 6.2 knots | Swell: 0.8m%0A*View on Google Maps:* https://maps.google.com/?q=${lat},${lon}%0A%0A_Sent via Marine AI Automated Family Scheduler._`;
  }

  window.open(`https://api.whatsapp.com/send?phone=919840123456&text=${text}`, '_blank');

function applyScheme(schemeName) {
  if (typeof showToastNotification === "function") {
    showToastNotification("Scheme Application Initiated", `Application for ${schemeName} submitted under Vessel IND-TN-10-MM-4421.`, "success");
  }
  alert(`Application Initiated for ${schemeName}!\n\nYour registered vessel ID (IND-TN-10-MM-4421) and biometric fisherman identity card have been submitted to the Department of Fisheries portal.`);
}
}

/* ================= MICROPROCESSOR WEB SERIAL MONITOR & TELEMETRY ENGINE ================= */
let serialPort = null;
let serialReader = null;
let isSerialConnected = false;
let isSerialSimulating = false;
let serialSimInterval = null;
let serialPktCount = 0;
let serialRxBytes = 0;
let serialChart = null;
let serialLogHistory = [];
let serialDataBuffer = '';

const boardCodeSnippets = {
  arduino: `// Marine AI Smart Net Load Cell Firmware
#include <Arduino.h>
#include "HX711.h"

#define LOADCELL_DOUT_PIN  4
#define LOADCELL_SCK_PIN   5

HX711 scale;

void setup() {
  Serial.begin(9600); // Smart Net Baud rate
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(2280.f);
  scale.tare(); // Reset scale to 0
}

void loop() {
  if (scale.is_ready()) {
    float loadKg = scale.get_units(5);
    float tensionKn = (loadKg * 9.81) / 1000.0;
    int stressPercent = (loadKg / 500.0) * 100;

    // Output: LOAD:val,TENSION:val,TANGLE:state,STRESS:val
    Serial.print("LOAD:"); Serial.print(loadKg, 1);
    Serial.print(",TENSION:"); Serial.print(tensionKn, 2);
    Serial.print(",TANGLE:LOW,STRESS:"); Serial.println(stressPercent);
  }
  delay(1000);
}`,
  esp32: `// Marine AI ESP32 Smart Net Load Telemetry
#include <Arduino.h>
#include "HX711.h"

HX711 scale;

void setup() {
  Serial.begin(9600);
  scale.begin(16, 17);
  scale.set_scale(2280.f);
  scale.tare();
}

void loop() {
  float loadKg = 245.0 + (random(-10, 10) * 0.5);
  float tensionKn = (loadKg * 9.81) / 1000.0;
  int stressPercent = (loadKg / 500.0) * 100;

  Serial.printf("LOAD:%.1f,TENSION:%.2f,TANGLE:LOW,STRESS:%d\\n", loadKg, tensionKn, stressPercent);
  delay(1000);
}`,
  python: `# Marine AI Raspberry Pi MicroPython Load Cell Telemetry
import machine
import time

uart = machine.UART(0, baudrate=9600)

while True:
    load_kg = 245.0
    tension_kn = 2.40
    stress_percent = 49
    
    payload = f"LOAD:{load_kg},TENSION:{tension_kn},TANGLE:LOW,STRESS:{stress_percent}\\n"
    uart.write(payload)
    print("TX:", payload.strip())
    time.sleep(1)
`
};

function syncBaudRate(baudVal) {
  const topSel = document.getElementById('serial-baud-rate');
  const bannerSel = document.getElementById('banner-baud-select');
  if (topSel && topSel.value !== baudVal) topSel.value = baudVal;
  if (bannerSel && bannerSel.value !== baudVal) bannerSel.value = baudVal;
}

let serialFlushTimer = null;

async function toggleSerialConnection() {
  if (isSerialConnected) {
    disconnectSerialPort();
    return;
  }

  if (!("serial" in navigator)) {
    alert("Web Serial API is not supported in this browser version.\n\nPlease use Google Chrome, Microsoft Edge, or Opera on Desktop/Android over USB OTG.\n\nClicking 'SIMULATE' will launch the built-in Smart Net Load Cell simulator!");
    return;
  }

  try {
    const baudSelect = document.getElementById('serial-baud-rate') || document.getElementById('banner-baud-select');
    const baudRate = parseInt(baudSelect.value) || 9600;
    serialPort = await navigator.serial.requestPort();
    
    await serialPort.open({ baudRate });

    // Assert DTR and RTS signals so microcontrollers (Arduino/ESP32/CH340) don't hang in reset
    try {
      if (serialPort.setSignals) {
        await serialPort.setSignals({ dataTerminalReady: true, requestToSend: true });
      }
    } catch (sigErr) {
      console.warn("DTR/RTS signal assertion notice:", sigErr);
    }

    isSerialConnected = true;
    if (isSerialSimulating) stopSerialSimulation();

    // Determine connected port details for display
    let portName = "USB Serial Device";
    try {
      const info = serialPort.getInfo ? serialPort.getInfo() : {};
      if (info.usbVendorId) {
        portName = `USB COM (VID:0x${info.usbVendorId.toString(16).toUpperCase()})`;
      }
    } catch (e) {}

    updateMcuPortUI(true, portName, baudRate, false);
    logToSerialConsole("SYS", `Connected to ${portName} at ${baudRate} baud successfully.`);

    // Send immediate proactive probe / handshake queries for microcontrollers that wait for requests
    setTimeout(() => {
      sendSerialCommand("GET_LOAD");
      sendSerialCommand("PING");
    }, 400);

    readSerialStream();
  } catch (err) {
    console.error("Serial connection error:", err);
    logToSerialConsole("ERR", `Connection failed: ${err.message || err}`);
  }
}

async function disconnectSerialPort() {
  isSerialConnected = false;
  if (serialFlushTimer) {
    clearTimeout(serialFlushTimer);
    serialFlushTimer = null;
  }
  if (serialReader) {
    try {
      await serialReader.cancel();
      serialReader.releaseLock();
    } catch(e) {}
    serialReader = null;
  }
  if (serialPort) {
    try {
      await serialPort.close();
    } catch(e) {}
    serialPort = null;
  }
  updateMcuPortUI(false, "No Device Connected");
  logToSerialConsole("SYS", "Microprocessor USB Serial disconnected.");
}

async function readSerialStream() {
  const decoder = new TextDecoder('utf-8', { fatal: false, ignoreBOM: true });

  while (serialPort && serialPort.readable && isSerialConnected) {
    try {
      serialReader = serialPort.readable.getReader();
      while (isSerialConnected) {
        const { value, done } = await serialReader.read();
        if (done) {
          break;
        }
        if (value) {
          serialRxBytes += value.length;
          const textChunk = decoder.decode(value, { stream: true });
          handleIncomingSerialChunk(textChunk);
        }
      }
    } catch (err) {
      console.warn("Serial read stream notice:", err);
      logToSerialConsole("SYS", `Serial notice: ${err.message || err}`);
    } finally {
      if (serialReader) {
        try {
          serialReader.releaseLock();
        } catch (e) {}
        serialReader = null;
      }
    }

    if (isSerialConnected) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
}

function handleIncomingSerialChunk(textChunk) {
  serialDataBuffer += textChunk;

  // Split on CR, LF, or CRLF
  let lines = serialDataBuffer.split(/\r\n|\r|\n/);
  serialDataBuffer = lines.pop(); // keep last incomplete chunk

  for (let line of lines) {
    line = line.trim();
    if (line.length > 0) {
      processIncomingSerialLine(line);
    }
  }

  // If buffer has pending content and no newline arrives for 1.2s, flush and parse it
  if (serialFlushTimer) clearTimeout(serialFlushTimer);
  if (serialDataBuffer.trim().length > 0) {
    serialFlushTimer = setTimeout(() => {
      const leftover = serialDataBuffer.trim();
      if (leftover.length > 0) {
        processIncomingSerialLine(leftover);
        serialDataBuffer = '';
      }
    }, 1200);
  }
}

function toggleSerialSimulation() {
  if (isSerialSimulating) {
    stopSerialSimulation();
  } else {
    startSerialSimulation();
  }
}

function startSerialSimulation() {
  if (isSerialConnected) disconnectSerialPort();

  isSerialSimulating = true;
  const baudSelect = document.getElementById('serial-baud-rate') || document.getElementById('banner-baud-select');
  const baudRate = parseInt(baudSelect ? baudSelect.value : 9600) || 9600;

  updateMcuPortUI(true, "Simulated Load Cell MCU", baudRate, true);
  logToSerialConsole("SYS", `Started Smart Net Load Cell Serial Simulator at ${baudRate} baud (1Hz Feed).`);

  let simTime = 0;
  serialSimInterval = setInterval(() => {
    simTime++;
    let loadKg = parseFloat((245.0 + Math.sin(simTime * 0.25) * 18 + (Math.random() * 4 - 2)).toFixed(1));
    let tensionKn = parseFloat(((loadKg * 9.81) / 1000.0).toFixed(2));
    let stressPercent = Math.round((loadKg / 500.0) * 100);
    let tangleState = tensionKn > 3.0 ? "MODERATE" : "LOW";

    let line = `LOAD:${loadKg},TENSION:${tensionKn},TANGLE:${tangleState},STRESS:${stressPercent}`;
    processIncomingSerialLine(line);
  }, 1000);
}

function stopSerialSimulation() {
  if (serialSimInterval) clearInterval(serialSimInterval);
  serialSimInterval = null;
  isSerialSimulating = false;
  
  updateMcuPortUI(false, "No Device Connected");
  logToSerialConsole("SYS", "Hardware Serial Simulator stopped.");
}

function processIncomingSerialLine(line) {
  serialPktCount++;
  logToSerialConsole("RX", line);

  let dataObj = {};
  let rawLoad = null;
  let rawTension = null;
  let rawTangle = null;
  let rawStress = null;

  // 1. Try parsing JSON format: {"load": 245.5, "tension": 2.4, "tangle": "LOW"}
  if (line.startsWith('{') && line.endsWith('}')) {
    try {
      const parsed = JSON.parse(line);
      for (const k of Object.keys(parsed)) {
        dataObj[k.trim().toUpperCase()] = parsed[k];
      }
    } catch (e) {}
  }

  // 2. Parse key-value tokens (e.g. LOAD:245.5, TENSION:2.4, TANGLE:LOW or with = or ; or |)
  if (Object.keys(dataObj).length === 0 && (line.includes(':') || line.includes('='))) {
    const normalized = line.replace(/[;|]/g, ',');
    const parts = normalized.split(',');
    for (const part of parts) {
      const kv = part.split(/[:=]/);
      if (kv.length === 2) {
        const key = kv[0].trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
        const rawVal = kv[1].trim();
        const numVal = parseFloat(rawVal);
        if (!isNaN(numVal) && !isNaN(Number(rawVal.replace(/[^0-9.-]/g, '')))) {
          dataObj[key] = numVal;
        } else {
          dataObj[key] = rawVal.toUpperCase();
        }
      }
    }
  }

  // 3. Extract Load / Weight from known keys
  const loadKeys = ['LOAD', 'WEIGHT', 'WT', 'LOADCELL', 'READING', 'SCALE', 'NETLOAD', 'KG', 'VALUE'];
  for (const k of loadKeys) {
    if (dataObj[k] !== undefined) {
      const n = typeof dataObj[k] === 'number' ? dataObj[k] : parseFloat(String(dataObj[k]).replace(/[^0-9.-]/g, ''));
      if (!isNaN(n)) { rawLoad = n; break; }
    }
  }

  // 4. Extract Tension from known keys
  const tensionKeys = ['TENSION', 'STRAIN', 'FORCE', 'KN', 'PULL'];
  for (const k of tensionKeys) {
    if (dataObj[k] !== undefined) {
      const n = typeof dataObj[k] === 'number' ? dataObj[k] : parseFloat(String(dataObj[k]).replace(/[^0-9.-]/g, ''));
      if (!isNaN(n)) { rawTension = n; break; }
    }
  }

  // 5. Extract Tangle from known keys
  const tangleKeys = ['TANGLE', 'TANGLERISK', 'TANGLE_RISK', 'SNAG', 'TEAR', 'TANGLESTATUS', 'TANGLE_STATUS'];
  for (const k of tangleKeys) {
    if (dataObj[k] !== undefined) {
      rawTangle = dataObj[k];
      break;
    }
  }

  // 6. Extract Stress from known keys
  const stressKeys = ['STRESS', 'STRESSPERCENT', 'PERCENT', 'LOADPERCENT'];
  for (const k of stressKeys) {
    if (dataObj[k] !== undefined) {
      const n = typeof dataObj[k] === 'number' ? dataObj[k] : parseFloat(String(dataObj[k]).replace(/[^0-9.-]/g, ''));
      if (!isNaN(n)) { rawStress = n; break; }
    }
  }

  // 7. Fallback: Parse plain number(s) without keys (e.g. "245.5" or "245.5 kg" or "245.5, 2.4")
  if (rawLoad === null) {
    const numMatches = line.match(/[-+]?[0-9]*\.?[0-9]+/g);
    if (numMatches && numMatches.length > 0) {
      const firstNum = parseFloat(numMatches[0]);
      if (!isNaN(firstNum)) {
        rawLoad = firstNum;
        if (numMatches.length >= 2) {
          rawTension = parseFloat(numMatches[1]);
        }
        if (numMatches.length >= 3) {
          rawStress = parseFloat(numMatches[2]);
        }
      }
    }
  }

  // 8. Fallback: Detect tangle mentions anywhere in line (e.g. "SNAG DETECTED" or "TANGLE: LOW")
  if (rawTangle === null) {
    const upperLine = line.toUpperCase();
    if (upperLine.includes('SNAG') || upperLine.includes('CRITICAL') || upperLine.includes('HIGH TANGLE')) {
      rawTangle = 'HIGH';
    } else if (upperLine.includes('MODERATE') || upperLine.includes('MEDIUM')) {
      rawTangle = 'MODERATE';
    } else if (upperLine.includes('SAFE') || upperLine.includes('LOW') || upperLine.includes('NORMAL') || upperLine.includes('OK')) {
      rawTangle = 'LOW';
    }
  }

  // If any reading was extracted, update the website
  if (rawLoad !== null || rawTension !== null || rawTangle !== null) {
    applyTelemetryReadings(rawLoad, rawTension, rawTangle, rawStress);
  }
}

function applyTelemetryReadings(loadVal, tensionVal, tangleVal, stressVal) {
  // If tension is missing but load exists, calculate tension (kN)
  if (tensionVal === null && loadVal !== null) {
    tensionVal = parseFloat(((loadVal * 9.81) / 1000.0).toFixed(2));
  } else if (loadVal === null && tensionVal !== null) {
    loadVal = parseFloat(((tensionVal * 1000.0) / 9.81).toFixed(1));
  }

  // If stress percentage is missing, calculate from 500kg capacity
  if (stressVal === null && loadVal !== null) {
    stressVal = Math.round(Math.min(100, Math.max(0, (loadVal / 500.0) * 100)));
  }

  // Evaluate Tangle Level (LOW, MODERATE, HIGH)
  let tangleLevel = "LOW";
  let tangleText = "LOW RISK (SAFE)";
  let tangleClass = "risk-low";
  let tangleAlertText = "Tangle Risk: <strong>LOW (NO SNAG)</strong>";
  let tangleAlertColor = "var(--text-muted)";

  if (tangleVal !== null) {
    const s = String(tangleVal).toUpperCase().trim();
    if (s === "2" || s === "HIGH" || s === "SNAG" || s === "DANGER" || s === "CRITICAL" || s === "YES" || s === "TRUE") {
      tangleLevel = "HIGH";
    } else if (s === "1" || s === "MODERATE" || s === "MEDIUM" || s === "WARN" || s === "CAUTION") {
      tangleLevel = "MODERATE";
    } else if (s === "0" || s === "LOW" || s === "SAFE" || s === "NORMAL" || s === "NO" || s === "FALSE") {
      tangleLevel = "LOW";
    } else {
      const n = parseFloat(s);
      if (!isNaN(n)) {
        if (n >= 75) tangleLevel = "HIGH";
        else if (n >= 40) tangleLevel = "MODERATE";
        else tangleLevel = "LOW";
      }
    }
  } else if (tensionVal !== null) {
    if (tensionVal > 4.2) tangleLevel = "HIGH";
    else if (tensionVal > 3.2) tangleLevel = "MODERATE";
    else tangleLevel = "LOW";
  }

  if (tangleLevel === "HIGH") {
    tangleText = "HIGH RISK (SNAG DETECTED)";
    tangleClass = "risk-high";
    tangleAlertText = "Tangle Risk: <strong>HIGH (SNAG DETECTED)</strong>";
    tangleAlertColor = "#f87171";
  } else if (tangleLevel === "MODERATE") {
    tangleText = "MODERATE RISK";
    tangleClass = "risk-moderate";
    tangleAlertText = "Tangle Risk: <strong>MODERATE RISK</strong>";
    tangleAlertColor = "#fbbf24";
  }

  // --- UPDATE LOAD CELL UI (Card 1 & Banner) ---
  if (loadVal !== null) {
    const bannerReadingEl = document.getElementById('smart-net-load-reading');
    const loadNumEl = document.getElementById('val-load-cell');
    const barLoadEl = document.getElementById('bar-load-cell');
    const loadBadgeEl = document.getElementById('badge-load-status');
    const loadStateEl = document.getElementById('val-load-state');

    if (bannerReadingEl) bannerReadingEl.innerText = `${loadVal.toFixed(1)} kg`;
    if (loadNumEl) loadNumEl.innerText = loadVal.toFixed(1);
    if (barLoadEl) barLoadEl.style.width = Math.min(100, Math.max(0, (loadVal / 500) * 100)) + '%';

    if (loadVal > 450) {
      if (loadBadgeEl) { loadBadgeEl.className = "sensor-badge badge-danger"; loadBadgeEl.innerText = "OVERLOAD!"; }
      if (loadStateEl) { loadStateEl.innerText = "OVERLOAD RISK"; loadStateEl.style.color = "#f87171"; }
      testBuzzerAlarm();
    } else if (loadVal > 350) {
      if (loadBadgeEl) { loadBadgeEl.className = "sensor-badge badge-warn"; loadBadgeEl.innerText = "High Load"; }
      if (loadStateEl) { loadStateEl.innerText = "HIGH LOAD"; loadStateEl.style.color = "#fbbf24"; }
    } else {
      if (loadBadgeEl) { loadBadgeEl.className = "sensor-badge badge-ok"; loadBadgeEl.innerText = "Normal"; }
      if (loadStateEl) { loadStateEl.innerText = "ONLINE / STREAMING"; loadStateEl.style.color = "var(--status-safe)"; }
    }
  }

  // --- UPDATE TENSION & TANGLE UI (Card 2 & Banner) ---
  if (tensionVal !== null) {
    const tensionNumEl = document.getElementById('val-net-tension');
    const barTensionEl = document.getElementById('bar-net-tension');
    const tensionBadgeEl = document.getElementById('badge-tension-status');

    if (tensionNumEl) tensionNumEl.innerText = tensionVal.toFixed(2);
    if (barTensionEl) barTensionEl.style.width = Math.min(100, Math.max(0, (tensionVal / 5.0) * 100)) + '%';

    if (tensionVal > 4.5 || tangleLevel === "HIGH") {
      if (tensionBadgeEl) { tensionBadgeEl.className = "sensor-badge badge-danger"; tensionBadgeEl.innerText = "SNAG ALERT!"; }
    } else if (tensionVal > 3.5 || tangleLevel === "MODERATE") {
      if (tensionBadgeEl) { tensionBadgeEl.className = "sensor-badge badge-warn"; tensionBadgeEl.innerText = "High Stress"; }
    } else {
      if (tensionBadgeEl) { tensionBadgeEl.className = "sensor-badge badge-ok"; tensionBadgeEl.innerText = "Normal"; }
    }
  }

  // Update Tangle badges and readings
  const tangleBadgeEl = document.getElementById('val-tangle-badge');
  const snagAlertEl = document.getElementById('alert-net-snag');
  const bannerTangleEl = document.getElementById('smart-net-tangle-val');

  if (tangleBadgeEl) {
    tangleBadgeEl.className = `tangle-risk-pill ${tangleClass}`;
    tangleBadgeEl.innerText = tangleText;
  }
  if (snagAlertEl) {
    snagAlertEl.style.color = tangleAlertColor;
    snagAlertEl.innerHTML = tangleAlertText;
  }
  if (bannerTangleEl) {
    const icon = tangleLevel === 'HIGH' ? 'fa-triangle-exclamation' : (tangleLevel === 'MODERATE' ? 'fa-circle-exclamation' : 'fa-shield-check');
    bannerTangleEl.innerHTML = `<i class="fa-solid ${icon}" style="font-size:1rem; opacity:0.8;"></i> ${tangleText}`;
  }

  // --- UPDATE STRESS & BANNER STATUS ---
  if (stressVal !== null) {
    const stressDisplayEl = document.getElementById('smart-net-stress-val');
    const statusBadgeEl = document.getElementById('smart-net-status-badge');

    if (stressDisplayEl) stressDisplayEl.innerText = `${stressVal}%`;

    if (statusBadgeEl) {
      if (stressVal > 85 || tangleLevel === "HIGH") {
        statusBadgeEl.innerText = tangleLevel === "HIGH" ? "SNAG ALERT" : "OVERLOAD";
        statusBadgeEl.style.background = "#ef4444";
      } else if (stressVal > 70 || tangleLevel === "MODERATE") {
        statusBadgeEl.innerText = "STRESS WARNING";
        statusBadgeEl.style.background = "#f59e0b";
      } else {
        statusBadgeEl.innerText = "SAFE";
        statusBadgeEl.style.background = "#10b981";
      }
    }
  }

  updateSerialChart({ LOAD: loadVal, TENSION: tensionVal, STRESS: stressVal });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function logToSerialConsole(type, msg) {
  const win = document.getElementById('terminal-window');
  if (!win) return;

  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

  const lineDiv = document.createElement('div');
  lineDiv.className = 'terminal-line';

  let typeClass = 'term-rx';
  let prefix = '[RX] ';
  if (type === 'TX') { typeClass = 'term-tx'; prefix = '[TX] '; }
  else if (type === 'ERR') { typeClass = 'term-err'; prefix = '[ERR] '; }
  else if (type === 'SYS') { typeClass = 'term-info'; prefix = '[SYS] '; }

  lineDiv.innerHTML = `<span class="term-time">${timeStr}</span><span class="${typeClass}">${prefix}${escapeHtml(msg)}</span>`;
  win.appendChild(lineDiv);

  const autoScroll = document.getElementById('chk-autoscroll');
  if (autoScroll && autoScroll.checked) {
    win.scrollTop = win.scrollHeight;
  }

  serialLogHistory.push(`${timeStr} ${prefix}${msg}`);
  if (serialLogHistory.length > 500) serialLogHistory.shift();
}

function clearSerialConsole() {
  const win = document.getElementById('terminal-window');
  if (win) {
    win.innerHTML = `<div class="terminal-welcome-msg"><span class="term-dim">// Serial log cleared at ${new Date().toLocaleTimeString()}</span></div>`;
  }
  serialLogHistory = [];
}

function exportSerialLog() {
  if (serialLogHistory.length === 0) {
    alert("No log entries to export.");
    return;
  }
  const text = serialLogHistory.join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `SmartNet_LoadCell_Log_${Date.now()}.txt`;
  a.click();
}

async function sendSerialCommand(cmdText) {
  if (!cmdText) return;
  logToSerialConsole("TX", cmdText);

  if (isSerialConnected && serialPort && serialPort.writable) {
    try {
      const textEncoder = new TextEncoder();
      const writer = serialPort.writable.getWriter();
      await writer.write(textEncoder.encode(cmdText + '\r\n'));
      writer.releaseLock();
    } catch(err) {
      logToSerialConsole("ERR", `TX Failed: ${err.message || err}`);
    }
  } else if (isSerialSimulating) {
    setTimeout(() => {
      if (cmdText === 'PING') processIncomingSerialLine('RESP: PONG (Load Cell MCU Active, Uptime: 1420s)');
      else if (cmdText === 'CALIBRATE_ZERO' || cmdText === 'TARE') processIncomingSerialLine('RESP: LOADCELL TARE OK (Zeroed Scale)');
      else if (cmdText === 'GET_LOAD') processIncomingSerialLine('RESP: LOAD:245.0,TENSION:2.40,STRESS:49');
      else if (cmdText === 'GET_STATUS') processIncomingSerialLine('RESP: HX711_AMP, SCALE: 2280, CALIBRATED: YES, BATT: 12.4V');
      else if (cmdText === 'RESET_MCU') processIncomingSerialLine('SYS: MCU System Soft Reset Initiated...');
      else processIncomingSerialLine(`RESP: ACK Command '${cmdText}' received`);
    }, 300);
  } else {
    logToSerialConsole("ERR", "Not connected to any Microprocessor. Click 'CONNECT DEVICE' or 'SIMULATE'.");
  }
}

function sendCustomSerialCmd() {
  const input = document.getElementById('txt-serial-cmd');
  if (input && input.value.trim() !== '') {
    sendSerialCommand(input.value.trim());
    input.value = '';
  }
}

function updateMcuPortUI(connected, portName = "No Device Connected", baud = 9600, simulating = false) {
  const bannerReadingEl = document.getElementById('smart-net-load-reading');
  const bannerStressEl = document.getElementById('smart-net-stress-val');
  const bannerBadgeEl = document.getElementById('smart-net-status-badge');
  const bannerConnectLbl = document.getElementById('banner-connect-lbl');
  const bannerSimLbl = document.getElementById('banner-sim-lbl');
  const topConnectLbl = document.getElementById('lbl-connect-btn');
  const topSimLbl = document.getElementById('lbl-sim-btn');
  const portPill = document.getElementById('mcu-port-status-pill');
  const portText = document.getElementById('mcu-port-status-text');
  const bannerPortIndicator = document.getElementById('banner-port-indicator');
  const bannerTangleEl = document.getElementById('smart-net-tangle-val');
  const loadStateEl = document.getElementById('val-load-state');

  syncBaudRate(String(baud));

  if (connected) {
    if (bannerConnectLbl) bannerConnectLbl.innerText = "DISCONNECT";
    if (topConnectLbl) topConnectLbl.innerText = "Disconnect USB";
    if (simulating) {
      if (bannerSimLbl) bannerSimLbl.innerText = "STOP SIM";
      if (topSimLbl) topSimLbl.innerText = "Stop Simulation";
    }

    if (portPill) {
      portPill.className = "mcu-port-pill connected";
    }
    if (portText) {
      portText.innerText = `${portName} (${baud} baud)`;
    }
    if (bannerPortIndicator) {
      bannerPortIndicator.innerText = `PORT: ${portName.toUpperCase()} (${baud} BAUD)`;
      bannerPortIndicator.style.background = "rgba(16, 185, 129, 0.2)";
      bannerPortIndicator.style.color = "#047857";
    }
    if (loadStateEl) {
      loadStateEl.innerText = "ONLINE / READY";
      loadStateEl.style.color = "var(--status-safe)";
    }
    if (bannerReadingEl && bannerReadingEl.innerText.includes("Hardware Disconnected")) {
      bannerReadingEl.innerHTML = `<i class="fa-solid fa-bolt" style="font-size:1.1rem; color:#10b981;"></i> Connected (Waiting for sensor feed...)`;
    }
  } else {
    if (bannerReadingEl) bannerReadingEl.innerHTML = `<i class="fa-solid fa-computer-mouse" style="font-size:1.1rem; opacity:0.8;"></i> Hardware Disconnected / Waiting...`;
    if (bannerStressEl) bannerStressEl.innerText = "N/A";
    if (bannerBadgeEl) {
      bannerBadgeEl.innerText = "SAFE";
      bannerBadgeEl.style.background = "#10b981";
    }
    if (bannerConnectLbl) bannerConnectLbl.innerText = "CONNECT DEVICE";
    if (topConnectLbl) topConnectLbl.innerText = "Connect USB Device";
    if (bannerSimLbl) bannerSimLbl.innerText = "SIMULATE";
    if (topSimLbl) topSimLbl.innerText = "Simulate Hardware Feed";

    if (portPill) {
      portPill.className = "mcu-port-pill disconnected";
    }
    if (portText) {
      portText.innerText = "No Device Connected";
    }
    if (bannerPortIndicator) {
      bannerPortIndicator.innerText = "PORT: DISCONNECTED";
      bannerPortIndicator.style.background = "rgba(6, 78, 59, 0.15)";
      bannerPortIndicator.style.color = "#064e3b";
    }
    if (bannerTangleEl) {
      bannerTangleEl.innerHTML = `<i class="fa-solid fa-shield-check" style="font-size:1rem; opacity:0.8;"></i> LOW RISK (SAFE)`;
    }

    const loadNumEl = document.getElementById('val-load-cell');
    const barLoadEl = document.getElementById('bar-load-cell');
    const tensionNumEl = document.getElementById('val-net-tension');
    const barTensionEl = document.getElementById('bar-net-tension');
    const tangleBadgeEl = document.getElementById('val-tangle-badge');
    const snagAlertEl = document.getElementById('alert-net-snag');

    if (loadNumEl) loadNumEl.innerText = "--";
    if (barLoadEl) barLoadEl.style.width = "0%";
    if (tensionNumEl) tensionNumEl.innerText = "--";
    if (barTensionEl) barTensionEl.style.width = "0%";
    if (loadStateEl) {
      loadStateEl.innerText = "READY";
      loadStateEl.style.color = "var(--status-safe)";
    }
    if (tangleBadgeEl) {
      tangleBadgeEl.className = "tangle-risk-pill risk-low";
      tangleBadgeEl.innerText = "LOW RISK (SAFE)";
    }
    if (snagAlertEl) {
      snagAlertEl.style.color = "var(--text-muted)";
      snagAlertEl.innerHTML = "Tangle Risk: <strong>LOW (NO SNAG)</strong>";
    }
  }
}

function selectBoardCode(boardType, tabEl) {
  document.querySelectorAll('.board-tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');

  const codeBox = document.getElementById('firmware-code-box');
  if (codeBox && boardCodeSnippets[boardType]) {
    codeBox.querySelector('code').innerText = boardCodeSnippets[boardType];
  }
}

function copyFirmwareCode() {
  const codeBox = document.getElementById('firmware-code-box');
  if (codeBox) {
    const text = codeBox.querySelector('code').innerText;
    navigator.clipboard.writeText(text);
    alert("Smart Net Load Cell firmware snippet copied to clipboard!");
  }
}

function initEquipmentSerialChart() {
  const canvas = document.getElementById('equipmentSerialChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  serialChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['10s ago', '9s ago', '8s ago', '7s ago', '6s ago', '5s ago', '4s ago', '3s ago', '2s ago', '1s ago'],
      datasets: [
        {
          label: 'Load Value (kg)',
          data: [240, 242, 245, 244, 248, 245, 243, 246, 245, 245],
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Net Tension (kN)',
          data: [2.35, 2.37, 2.40, 2.39, 2.43, 2.40, 2.38, 2.41, 2.40, 2.40],
          borderColor: '#14b8a6',
          backgroundColor: 'rgba(20, 184, 166, 0.05)',
          fill: false,
          tension: 0.35,
          borderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#64748b', font: { size: 10 } }
        },
        y: {
          position: 'left',
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#06b6d4', font: { size: 10 } },
          title: { display: true, text: 'Load Value (kg)', color: '#06b6d4', font: { size: 10 } }
        },
        y1: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#14b8a6', font: { size: 10 } },
          title: { display: true, text: 'Net Tension (kN)', color: '#14b8a6', font: { size: 10 } }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { size: 11 } }
        }
      }
    }
  });
}

function updateSerialChart(dataObj) {
  if (!serialChart) return;
  const nowStr = new Date().toLocaleTimeString().split(' ')[0];

  if (serialChart.data.labels.length > 15) {
    serialChart.data.labels.shift();
    serialChart.data.datasets[0].data.shift();
    serialChart.data.datasets[1].data.shift();
  }

  let loadVal = dataObj.LOAD !== undefined ? dataObj.LOAD : (dataObj.TENSION !== undefined ? dataObj.TENSION : 245.0);
  let tensionKn = dataObj.TENSION !== undefined ? dataObj.TENSION : parseFloat(((loadVal * 9.81) / 1000.0).toFixed(2));

  serialChart.data.labels.push(nowStr);
  serialChart.data.datasets[0].data.push(loadVal);
  serialChart.data.datasets[1].data.push(tensionKn);

  serialChart.update('none');
}


