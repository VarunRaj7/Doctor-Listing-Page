let allDoctors = [];
let displayedDoctors = [];

document.addEventListener("DOMContentLoaded", () => {
  generateSpecialtyCheckboxes();
  fetchDoctors();
  setupEventListeners();
  applyFiltersFromURL();
});

function generateSpecialtyCheckboxes() {
  const specialties = [
    'General Physician', 'Dentist', 'Dermatologist', 'Paediatrician', 'Gynaecologist',
    'ENT', 'Diabetologist', 'Cardiologist', 'Physiotherapist', 'Endocrinologist',
    'Orthopaedic', 'Ophthalmologist', 'Gastroenterologist', 'Pulmonologist',
    'Psychiatrist', 'Urologist', 'Dietitian/Nutritionist', 'Psychologist',
    'Sexologist', 'Nephrologist', 'Neurologist', 'Oncologist',
    'Ayurveda', 'Homeopath'
  ];
  const container = document.getElementById("specialties");
  specialties.forEach(spec => {
    const idSafe = spec.replace(/\//g, '-').replace(/\s+/g, '-');
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${spec}" data-testid="filter-specialty-${idSafe}" /> ${spec}
    `;
    container.appendChild(label);
  });
}

function fetchDoctors() {
  fetch('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json')
    .then(res => res.json())
    .then(data => {
      const defaultSpecialties = [
        'General Physician', 'Dentist', 'Dermatologist', 'Paediatrician', 'Gynaecologist',
        'ENT', 'Diabetologist', 'Cardiologist', 'Physiotherapist', 'Endocrinologist',
        'Orthopaedic', 'Ophthalmologist', 'Gastroenterologist', 'Pulmonologist',
        'Psychiatrist', 'Urologist', 'Dietitian/Nutritionist', 'Psychologist',
        'Sexologist', 'Nephrologist', 'Neurologist', 'Oncologist',
        'Ayurveda', 'Homeopath'
      ];

      data.forEach(doc => {
        if (!doc.specialty && !doc.speciality) {
          doc.specialty = defaultSpecialties[Math.floor(Math.random() * defaultSpecialties.length)];
        }
        if (!doc.moc) {
          doc.moc = Math.random() > 0.5 ? "Video Consult" : "In Clinic";
        }
      });

      allDoctors = data;
      displayedDoctors = [...allDoctors];
      displayDoctors(displayedDoctors);
    });
}

function displayDoctors(doctors) {
  const list = document.getElementById("doctor-list");
  list.innerHTML = '';
  if (doctors.length === 0) {
    list.innerHTML = '<p>No doctors found.</p>';
    return;
  }
  doctors.forEach(doc => {
    const card = document.createElement("div");
    card.className = "doctor-card";
    card.setAttribute("data-testid", "doctor-card");
    card.innerHTML = `
      <h3 data-testid="doctor-name">${doc.name}</h3>
      <p data-testid="doctor-specialty">${doc.specialty || doc.speciality || 'N/A'}</p>
      <p data-testid="doctor-experience">${doc.experience} years</p>
      <p data-testid="doctor-fee">₹${doc.fees}</p>
      <p data-testid="doctor-moc"><strong>Mode:</strong> ${doc.moc}</p>
    `;
    list.appendChild(card);
  });
}

function setupEventListeners() {
  const searchInput = document.getElementById("search");
  const suggestions = document.getElementById("suggestions");

  searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.toLowerCase().trim();
    suggestions.innerHTML = '';
    if (searchText === '') return;
    const matches = allDoctors
      .filter(doc => doc.name.toLowerCase().includes(searchText))
      .slice(0, 3);
    matches.forEach(doc => {
      const li = document.createElement("li");
      li.textContent = doc.name;
      li.setAttribute("data-testid", "suggestion-item");
      li.addEventListener("click", () => {
        searchInput.value = doc.name;
        suggestions.innerHTML = '';
        applyFilters();
      });
      suggestions.appendChild(li);
    });
  });

  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      suggestions.innerHTML = '';
      applyFilters();
    }
  });

  document.querySelectorAll("#filters input, #sort-options input").forEach(input => {
    input.addEventListener("change", applyFilters);
  });
}

function applyFilters() {
  const query = document.getElementById("search").value.toLowerCase().trim();
  const mode = document.querySelector("input[name='consultation']:checked")?.value;
  const specialties = Array.from(document.querySelectorAll("#filters input[type='checkbox']:checked")).map(cb => cb.value);
  const sort = document.querySelector("input[name='sort']:checked")?.value;

  let filtered = allDoctors.filter(doc => {
    const nameMatch = doc.name.toLowerCase().includes(query);
    const modeMatch = mode ? doc.moc === mode : true;
    const specMatch = specialties.length > 0 ? specialties.map(s => s.toLowerCase()).includes((doc.specialty || doc.speciality || '').toLowerCase()) : true;
    return nameMatch && modeMatch && specMatch;
  });

  if (sort === 'fees') {
    filtered.sort((a, b) => a.fees - b.fees);
  } else if (sort === 'experience') {
    filtered.sort((a, b) => b.experience - a.experience);
  }

  updateURLParams(query, mode, specialties, sort);
  displayedDoctors = filtered;
  displayDoctors(displayedDoctors);
}

function updateURLParams(search, mode, specialties, sort) {
  const url = new URL(window.location);
  url.searchParams.set('search', search);
  mode ? url.searchParams.set('mode', mode) : url.searchParams.delete('mode');
  url.searchParams.delete('specialty');
  specialties.forEach(spec => url.searchParams.append('specialty', spec));
  sort ? url.searchParams.set('sort', sort) : url.searchParams.delete('sort');
  history.pushState({}, '', url);
}

function applyFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search') || '';
  const mode = params.get('mode');
  const specialties = params.getAll('specialty');
  const sort = params.get('sort');

  document.getElementById("search").value = search;

  if (mode) {
    const input = document.querySelector(`input[name='consultation'][value='${mode}']`);
    if (input) input.checked = true;
  }

  specialties.forEach(spec => {
    const input = document.querySelector(`input[type='checkbox'][value='${spec}']`);
    if (input) input.checked = true;
  });

  if (sort) {
    const input = document.querySelector(`input[name='sort'][value='${sort}']`);
    if (input) input.checked = true;
  }

  applyFilters();
}
