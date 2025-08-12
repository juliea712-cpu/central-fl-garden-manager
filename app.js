
// --- Data: Central Florida vegetables (Zone 9b–10a) ---
const PLANTS = [
  {
    id: "tomato",
    name: "Tomato (heat-tolerant)",
    sow: [2,3,8,9],
    transplant: [3,4,9,10],
    fertilizeMonths: [3,5,8,10],
    companions: ["basil","marigold","onion"],
    antagonists: ["fennel"],
    daysToHarvest: 70,
    spacingInches: 24,
    plantingDepthInches: 0.25,
    successionIntervalDays: 21,
    reminderText: "Start seeds indoors or transplant heat-tolerant varieties.",
    notes: "Provide afternoon shade in summer; consistent moisture helps prevent blossom end rot."
  },
  {
    id: "broccoli",
    name: "Broccoli",
    sow: [9,10,11],
    transplant: [10,11,12],
    fertilizeMonths: [10,12],
    companions: ["onion","beet","marigold"],
    antagonists: ["tomato"],
    daysToHarvest: 60,
    spacingInches: 18,
    plantingDepthInches: 0.5,
    successionIntervalDays: 14,
    reminderText: "Sow for cool-season harvest; transplant as temperatures drop.",
    notes: "Cool-season crop; side-dress when heads begin to form."
  },
  {
    id: "cucumber",
    name: "Cucumber",
    sow: [3,4,8,9],
    transplant: [4,9],
    fertilizeMonths: [4,6,9],
    companions: ["bean","radish"],
    antagonists: ["potato"],
    daysToHarvest: 55,
    spacingInches: 12,
    plantingDepthInches: 0.5,
    successionIntervalDays: 14,
    reminderText: "Direct sow when soil warms; trellis for airflow.",
    notes: "Mulch and steady watering reduce bitterness."
  },
  {
    id: "okra",
    name: "Okra",
    sow: [4,5,6,7],
    transplant: [],
    fertilizeMonths: [5,7],
    companions: ["pepper","eggplant"],
    antagonists: [],
    daysToHarvest: 55,
    spacingInches: 12,
    plantingDepthInches: 1,
    successionIntervalDays: 30,
    reminderText: "Sow directly after last frost; thrives in heat.",
    notes: "Harvest pods young (2–4 in)."
  },
  {
    id: "sweet_corn",
    name: "Sweet Corn",
    sow: [2,3,8,9],
    transplant: [],
    fertilizeMonths: [3,8],
    companions: ["bean","squash"],
    antagonists: ["tomato"],
    daysToHarvest: 75,
    spacingInches: 12,
    plantingDepthInches: 1,
    successionIntervalDays: 10,
    reminderText: "Plant in blocks for pollination; needs rich soil.",
    notes: "Heavy feeder; side-dress at 12–18 in tall."
  },
  {
    id: "pepper",
    name: "Bell Pepper",
    sow: [1,2,7,8],
    transplant: [3,8,9],
    fertilizeMonths: [3,6,9],
    companions: ["basil","carrot"],
    antagonists: ["bean"],
    daysToHarvest: 75,
    spacingInches: 18,
    plantingDepthInches: 0.25,
    successionIntervalDays: 21,
    reminderText: "Transplant after danger of frost; keep soil evenly moist.",
    notes: "Mulch to keep roots cool; avoid excessive nitrogen."
  },
  {
    id: "carrot",
    name: "Carrot",
    sow: [9,10,11,12,1,2],
    transplant: [],
    fertilizeMonths: [11,1],
    companions: ["tomato","onion"],
    antagonists: ["dill"],
    daysToHarvest: 70,
    spacingInches: 2,
    plantingDepthInches: 0.25,
    successionIntervalDays: 14,
    reminderText: "Sow in loose soil; thin seedlings early.",
    notes: "Avoid fresh manure to prevent forked roots."
  },
];

// --- UI Elements ---
const monthSelect = document.getElementById('monthSelect');
const remindersList = document.getElementById('remindersList');
const noReminders = document.getElementById('noReminders');
const conditionsEl = document.getElementById('conditions');
const plantGrid = document.getElementById('plantGrid');
const searchInput = document.getElementById('search');

// Populate month select
const monthNames = [...Array(12)].map((_,i)=> new Date(2020, i, 1).toLocaleString('en-US',{month:'long'}));
monthNames.forEach((m,i)=>{
  const opt = document.createElement('option');
  opt.value = i+1;
  opt.textContent = m;
  monthSelect.appendChild(opt);
});
monthSelect.value = (new Date().getMonth()+1);

// Weather fetch (Orlando lat/long)
async function fetchWeather() {
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.5383&longitude=-81.3792&daily=precipitation_sum,temperature_2m_max&timezone=auto');
    const data = await res.json();
    const rain = data?.daily?.precipitation_sum?.[0];
    const tmax = data?.daily?.temperature_2m_max?.[0];
    conditionsEl.textContent = `Rain today: ${rain ?? '—'} in • High: ${tmax ?? '—'}°F`;
    return { rain: Number(rain||0), tmax: Number(tmax||0) };
  } catch (e) {
    conditionsEl.textContent = "Weather unavailable (offline). Reminders shown without adjustments.";
    return { rain: 0, tmax: 0 };
  }
}

// Build reminders for given month, adjusted by weather
function buildReminders(month, weather) {
  const items = PLANTS.filter(p => p.sow.includes(month) || p.transplant.includes(month)).map(p => {
    let msg = p.reminderText;
    if (weather.rain > 1) {
      msg += " Avoid watering today due to expected rainfall. Delay fertilizing to prevent nutrient runoff.";
    } else if (weather.rain < 0.2) {
      msg += " Light rainfall expected — consider supplemental watering.";
    }
    if (weather.tmax > 90) {
      msg += " Consider shade cloth or extra irrigation due to high heat.";
    }
    if (p.fertilizeMonths.includes(month)) {
      msg += " Time to fertilize — use a balanced fertilizer appropriate for this crop.";
    }
    return { plant: p.name, message: msg };
  });
  return items;
}

function renderReminders(list) {
  remindersList.innerHTML = "";
  if (!list.length) {
    noReminders.hidden = false;
    return;
  }
  noReminders.hidden = true;
  list.forEach((r)=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>${r.plant}:</strong> ${r.message}`;
    remindersList.appendChild(li);
  });
}

function renderPlants(filter="") {
  plantGrid.innerHTML = "";
  const q = filter.trim().toLowerCase();
  PLANTS.filter(p => p.name.toLowerCase().includes(q)).forEach(p=>{
    const el = document.createElement('div');
    el.className = "plant";
    const sow = p.sow.map(m=>monthNames[m-1]).join(', ');
    const trans = p.transplant.length ? p.transplant.map(m=>monthNames[m-1]).join(', ') : "—";
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h3 style="margin:0 0 6px 0;">${p.name}</h3>
        <span class="badge">${p.daysToHarvest} days</span>
      </div>
      <div class="muted" style="margin-bottom:8px;">Spacing ${p.spacingInches}\" • Depth ${p.plantingDepthInches}\"</div>
      <div><strong>Sow:</strong> ${sow}</div>
      <div><strong>Transplant:</strong> ${trans}</div>
      <div class="muted" style="margin-top:8px;">${p.notes}</div>
    `;
    plantGrid.appendChild(el);
  });
}

// Install prompt handling
let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});
installBtn?.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  }
});

// Init
async function init() {
  renderPlants();
  const weather = await fetchWeather();
  const list = buildReminders(Number(monthSelect.value), weather);
  renderReminders(list);
}
init();

monthSelect.addEventListener('change', async (e)=>{
  const weather = await fetchWeather();
  renderReminders(buildReminders(Number(e.target.value), weather));
});

searchInput.addEventListener('input', (e)=> renderPlants(e.target.value));

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}
