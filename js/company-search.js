// ═══════════════════════════════════════════════════════════════════════════
// DIGICAFE COMPANY SEARCH TOOL
// This searches YOUR OWN client directory below (customCompanyDB) — it is not
// connected to any government or national company registry. India's MCA has
// no public API for that, so a true nationwide search isn't possible here
// without a paid third-party data provider and a backend to hold its key.
//
// TO ADD A NEW COMPANY: copy the block below, fill in the details, and add
// a comma after the closing brace of the entry before it. Every field is a
// plain string except "directors", which is a list of names.
//
//   {
//     id: 'unique-id-here',
//     name: 'Company Name',
//     type: 'Private Limited / LLP / MSME / etc.',
//     state: 'State',
//     city: 'City',
//     registration: 'Registration or CIN number',
//     status: 'Active',
//     established: 'DD/MM/YYYY',
//     directors: ['Name One', 'Name Two'],
//     industry: 'Industry',
//     email: 'contact@example.com',
//     phone: '+91 00000 00000',
//     website: 'https://example.com',
//     employees: '1-10',
//     turnover: 'Not Disclosed',
//     source: 'Custom Database'
//   }
// ═══════════════════════════════════════════════════════════════════════════

const customCompanyDB = [
  {
    id: 'digicafe-001',
    name: 'DigiCafe Compliance & Digital Solutions',
    type: 'Micro Enterprise (MSME)',
    state: 'Karnataka',
    city: 'Bengaluru',
    registration: 'UDYAM-KR-02-0041919',
    status: 'Active',
    established: '01/08/2019',
    directors: ['Vikash Pathak'],
    industry: 'Tax & Compliance Services',
    email: 'digicafe.admin@gmail.com',
    phone: '+91 85399 79271',
    website: 'https://vikashp23.github.io/digicafe/',
    employees: '1-10',
    turnover: 'Not Disclosed',
    source: 'Custom Database'
  }
];

// ═══ SEARCH FUNCTION ═══
async function searchCompany(companyName) {
  if (!companyName || companyName.trim().length < 2) {
    showToast('⚠ Enter at least 2 characters');
    return;
  }

  const searchTerm = companyName.toLowerCase().trim();
  const btn = event?.target;
  
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
  }

  try {
    // Step 1: Search your client directory. Matches against name, registration
    // number, city, state, industry, and director names — any of them.
    const customResults = customCompanyDB.filter(c =>
      c.name.toLowerCase().includes(searchTerm) ||
      c.registration.toLowerCase().includes(searchTerm) ||
      c.city.toLowerCase().includes(searchTerm) ||
      (c.state || '').toLowerCase().includes(searchTerm) ||
      (c.industry || '').toLowerCase().includes(searchTerm) ||
      (c.directors || []).some(d => d.toLowerCase().includes(searchTerm))
    );

    // Step 2: Search companies added by the admin (Firestore, live)
    let adminResults = [];
    try {
      adminResults = await searchAdminCompanies(searchTerm);
    } catch (e) {
      console.warn('Admin-added companies unavailable:', e.message);
    }

    // Step 3: Search the bulk MCA registry (see searchMCADatabase below)
    let mcaResults = [];
    try {
      mcaResults = await searchMCADatabase(searchTerm);
    } catch (e) {
      console.warn('MCA registry data unavailable, showing other results only:', e.message);
    }

    // Step 4: Combine & Display Results
    const allResults = [...customResults, ...adminResults, ...mcaResults];
    
    if (allResults.length === 0) {
      showToast('⚠ No companies found');
      displaySearchResults([]);
    } else {
      showToast(`✓ Found ${allResults.length} company(ies)`);
      displaySearchResults(allResults);
    }

  } catch (err) {
    console.error('Search error:', err);
    showToast('⚠ Search failed: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-search"></i> Search';
    }
  }
}

// ═══ ADMIN-ADDED COMPANIES (Firestore, live) ═══
// Companies added via the admin panel's Company Directory tab. Cached in
// memory after first load per page visit — same lazy pattern as the bulk
// registry below, since it rarely changes within a single browsing session.
let _adminCompaniesCache = null;

async function searchAdminCompanies(searchTerm) {
  if (!window.db || !window.fsCollection || !window.fsGetDocs) {
    return []; // Firebase not ready yet — fail quietly, other sources still work
  }
  if (!_adminCompaniesCache) {
    const snap = await window.fsGetDocs(window.fsCollection(window.db, 'companies'));
    _adminCompaniesCache = [];
    snap.forEach(docSnap => {
      const c = docSnap.data();
      _adminCompaniesCache.push({
        id: docSnap.id,
        name: c.name || '',
        registration: c.registration || '',
        type: c.type || '',
        city: c.city || '',
        state: c.state || '',
        status: c.status || '',
        established: c.established || '',
        industry: c.industry || '',
        directors: c.directors || [],
        email: c.email || '',
        phone: c.phone || '',
        website: c.website || '',
        employees: c.employees || '',
        turnover: c.turnover || '',
        source: c.source || 'Custom Database'
      });
    });
  }
  return _adminCompaniesCache.filter(c =>
    c.name.toLowerCase().includes(searchTerm) ||
    c.registration.toLowerCase().includes(searchTerm) ||
    c.city.toLowerCase().includes(searchTerm) ||
    c.state.toLowerCase().includes(searchTerm) ||
    c.industry.toLowerCase().includes(searchTerm) ||
    c.directors.some(d => d.toLowerCase().includes(searchTerm))
  );
}

// ═══ BULK REGISTRY SEARCH ═══
// Real MCA-format company/LLP registration records, loaded lazily on first
// search from data/companies-db.json (dictionary-encoded to keep the file
// small — decoded back into full records here). This is a specific set of
// registration months, not the complete Indian company registry — see
// window._registryDataset.months for exactly which ones are loaded.
let _registryDataset = null;
let _registryLoadPromise = null;

function loadRegistryDataset() {
  if (_registryDataset) return Promise.resolve(_registryDataset);
  if (_registryLoadPromise) return _registryLoadPromise;

  _registryLoadPromise = fetch('data/companies-db.json')
    .then(res => {
      if (!res.ok) throw new Error('Registry data file not found');
      return res.json();
    })
    .then(raw => {
      const idx = raw.schema.reduce((m, k, i) => (m[k] = i, m), {});
      const decoded = raw.records.map(rec => ({
        id: rec[idx.id],
        name: rec[idx.name],
        registration: rec[idx.id],
        type: raw.types[rec[idx.typeIdx]] || '',
        state: raw.states[rec[idx.stateIdx]] || '',
        registrarOffice: raw.registrarOffices[rec[idx.rocIdx]] || '',
        status: raw.statuses[rec[idx.statusIdx]] || '',
        established: rec[idx.established],
        industry: raw.industries[rec[idx.industryIdx]] || '',
        email: rec[idx.email],
        source: raw.sources[rec[idx.sourceIdx]] || 'MCA Registry'
      }));
      _registryDataset = decoded;
      return decoded;
    })
    .catch(err => {
      console.warn('Registry dataset unavailable, showing client directory only:', err.message);
      _registryDataset = [];
      return [];
    });

  return _registryLoadPromise;
}

async function searchMCADatabase(companyName) {
  const dataset = await loadRegistryDataset();
  const term = companyName.toLowerCase();
  return dataset.filter(c =>
    c.name.toLowerCase().includes(term) ||
    c.registration.toLowerCase().includes(term) ||
    c.state.toLowerCase().includes(term) ||
    c.registrarOffice.toLowerCase().includes(term) ||
    c.industry.toLowerCase().includes(term)
  ).slice(0, 100); // cap results rendered at once for performance
}

// ═══ DISPLAY RESULTS ═══
function displaySearchResults(results) {
  const container = document.getElementById('company-search-results');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="glass" style="padding:2rem;text-align:center;color:var(--txt3)">
        <i class="fas fa-search" style="font-size:2rem;margin-bottom:1rem;display:block"></i>
        <p>No match found. This directory currently covers companies incorporated in Feb, Mar, Jul, Aug &amp; Oct 2020 and Jul 2026 (more months coming soon) — your company may simply be outside that range yet. Try a different name or registration number, or <a href="#" onclick="showPage('digital');return false" style="color:var(--blue2)">get in touch</a> if you'd like it added directly.</p>
      </div>
    `;
    return;
  }

  // Helper: only render a row if the value is actually present.
  const row = (label, value) => value ? `
          <div class="cc-row">
            <span>${label}</span>
            <span class="cc-value">${value}</span>
          </div>` : '';

  container.innerHTML = results.map(company => `
    <div class="company-card">
      <div class="cc-header">
        <div>
          <h3 class="cc-name">${company.name}</h3>
          <p class="cc-subtitle">${[company.type, company.city, company.registrarOffice, company.state].filter(Boolean).join(' • ')}</p>
        </div>
        ${company.status ? `<span class="status-badge ${company.status === 'Active' ? 'active' : 'inactive'}">${company.status}</span>` : ''}
      </div>

      <div class="cc-grid">
        <!-- Registration Details -->
        <div class="cc-section">
          <h4><i class="fas fa-file-alt"></i> Registration</h4>
          ${row('Registration #', company.registration)}
          ${row('Type', company.type)}
          ${row('Established', company.established)}
        </div>

        <!-- Location -->
        <div class="cc-section">
          <h4><i class="fas fa-map-marker-alt"></i> Location</h4>
          ${row('City', company.city)}
          ${row('Registrar Office', company.registrarOffice)}
          ${row('State', company.state)}
          <div class="cc-row"><span>Country</span><span class="cc-value">India</span></div>
        </div>

        <!-- Business Details -->
        <div class="cc-section">
          <h4><i class="fas fa-briefcase"></i> Business</h4>
          ${row('Industry', company.industry)}
          ${row('Employees', company.employees)}
          ${row('Turnover', company.turnover)}
        </div>

        <!-- Contact -->
        <div class="cc-section">
          <h4><i class="fas fa-phone"></i> Contact</h4>
          ${company.email ? `
          <div class="cc-row">
            <span>Email</span>
            <span class="cc-value"><a href="mailto:${company.email}" style="color:var(--blue2)">${company.email}</a></span>
          </div>
          ` : ''}
          ${company.phone ? `
          <div class="cc-row">
            <span>Phone</span>
            <span class="cc-value"><a href="tel:${company.phone}" style="color:var(--blue2)">${company.phone}</a></span>
          </div>
          ` : ''}
          ${company.website ? `
          <div class="cc-row">
            <span>Website</span>
            <span class="cc-value"><a href="${company.website}" target="_blank" style="color:var(--blue2)">Visit</a></span>
          </div>
          ` : ''}
          ${(!company.email && !company.phone && !company.website) ? `<div class="cc-row"><span>Contact</span><span class="cc-value">Not on file</span></div>` : ''}
        </div>

        <!-- Directors/Partners -->
        ${company.directors && company.directors.length > 0 ? `
        <div class="cc-section">
          <h4><i class="fas fa-user-tie"></i> Directors/Partners</h4>
          ${company.directors.map(d => `
            <div class="cc-row">
              <span>👤</span>
              <span class="cc-value">${d}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <!-- Source -->
        <div class="cc-section" style="grid-column:1/-1">
          <h4><i class="fas fa-database"></i> Source</h4>
          <div class="cc-row">
            <span>Data From</span>
            <span class="cc-value">
              <span class="badge ${company.source === 'Custom Database' ? 'badge-blue' : 'badge-teal'}">
                ${company.source}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="cc-actions">
        <button class="btn btn-primary btn-sm" onclick="openServiceRequestForCompany('${company.name}')">
          <i class="fas fa-handshake"></i> Request Service
        </button>
        <a href="https://wa.me/918539979271?text=Hi%20DigiCafe%2C%20I%20want%20to%20know%20about%20${encodeURIComponent(company.name)}" target="_blank" class="btn btn-ghost btn-sm">
          <i class="fab fa-whatsapp"></i> WhatsApp
        </a>
      </div>
    </div>
  `).join('');

  // Scroll to results
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ═══ ADD COMPANY TO CUSTOM DATABASE ═══
async function addCompanyToDatabase(companyData) {
  try {
    if (!window.saveCompanyData) {
      console.warn('Company save function not available');
      return;
    }
    const result = await window.saveCompanyData(companyData);
    showToast('✓ Company added to database');
    return result;
  } catch (err) {
    console.error('Add company error:', err);
    showToast('⚠ Could not add company');
  }
}

// ═══ OPEN SERVICE REQUEST FOR COMPANY ═══
function openServiceRequestForCompany(companyName) {
  showPage('digital');
  setTimeout(() => {
    const nameInput = document.getElementById('rh-name');
    if (nameInput) nameInput.value = companyName;
    document.getElementById('request-help')?.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

console.log('✓ Company Search Module Loaded');
