// ═══════════════════════════════════════════════════════════════════════════
// DIGICAFE COMPANY SEARCH TOOL
// Hybrid: Custom Database (Firestore) + MCA API Integration
// ═══════════════════════════════════════════════════════════════════════════

// Sample Custom Database (will be replaced with real Firestore data)
const customCompanyDB = [
  {
    id: 'digicafe-001',
    name: 'DigiCafe Compliance & Digital Solutions',
    type: 'Micro Enterprise (MSME)',
    state: 'Karnataka',
    city: 'Bengaluru',
    registration: 'UDYAM-KR-02-0041919',
    pan: 'CWVPP7756F',
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
    // Step 1: Search Custom Database (Fast)
    const customResults = customCompanyDB.filter(c => 
      c.name.toLowerCase().includes(searchTerm) ||
      c.registration.toLowerCase().includes(searchTerm) ||
      c.city.toLowerCase().includes(searchTerm)
    );

    // Step 2: Search MCA API (Official Indian Companies)
    let mcaResults = [];
    try {
      mcaResults = await searchMCADatabase(searchTerm);
    } catch (e) {
      console.warn('MCA API unavailable, showing custom results only:', e.message);
    }

    // Step 3: Combine & Display Results
    const allResults = [...customResults, ...mcaResults];
    
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

// ═══ MCA API INTEGRATION ═══
// Uses free MCA search endpoint (no key required)
async function searchMCADatabase(companyName) {
  try {
    // MCA Direct API for company search
    const encodedName = encodeURIComponent(companyName);
    const url = `https://www.mca.gov.in/mcaservices/services/companysearch.html?searchText=${encodedName}`;
    
    // Note: Direct API might have CORS issues, using alternative approach
    // For production, implement server-side proxy to MCA API
    
    // Alternative: Use Government of India's Open Data Portal
    // This is a simplified version; real implementation needs server-side handling
    
    return []; // Placeholder - would integrate real MCA API
  } catch (err) {
    console.warn('MCA API error:', err.message);
    return [];
  }
}

// ═══ DISPLAY RESULTS ═══
function displaySearchResults(results) {
  const container = document.getElementById('company-search-results');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="glass" style="padding:2rem;text-align:center;color:var(--txt3)">
        <i class="fas fa-search" style="font-size:2rem;margin-bottom:1rem;display:block"></i>
        <p>No companies found. Try a different search term.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(company => `
    <div class="company-card">
      <div class="cc-header">
        <div>
          <h3 class="cc-name">${company.name}</h3>
          <p class="cc-subtitle">${company.type} • ${company.city}, ${company.state}</p>
        </div>
        <span class="status-badge ${company.status === 'Active' ? 'active' : 'inactive'}">
          ${company.status}
        </span>
      </div>

      <div class="cc-grid">
        <!-- Registration Details -->
        <div class="cc-section">
          <h4><i class="fas fa-file-alt"></i> Registration</h4>
          <div class="cc-row">
            <span>Registration #</span>
            <span class="cc-value">${company.registration}</span>
          </div>
          <div class="cc-row">
            <span>Type</span>
            <span class="cc-value">${company.type}</span>
          </div>
          <div class="cc-row">
            <span>Established</span>
            <span class="cc-value">${company.established}</span>
          </div>
          ${company.pan ? `
          <div class="cc-row">
            <span>PAN</span>
            <span class="cc-value">${company.pan}</span>
          </div>
          ` : ''}
        </div>

        <!-- Location -->
        <div class="cc-section">
          <h4><i class="fas fa-map-marker-alt"></i> Location</h4>
          <div class="cc-row">
            <span>City</span>
            <span class="cc-value">${company.city}</span>
          </div>
          <div class="cc-row">
            <span>State</span>
            <span class="cc-value">${company.state}</span>
          </div>
          <div class="cc-row">
            <span>Country</span>
            <span class="cc-value">India</span>
          </div>
        </div>

        <!-- Business Details -->
        <div class="cc-section">
          <h4><i class="fas fa-briefcase"></i> Business</h4>
          <div class="cc-row">
            <span>Industry</span>
            <span class="cc-value">${company.industry}</span>
          </div>
          <div class="cc-row">
            <span>Employees</span>
            <span class="cc-value">${company.employees}</span>
          </div>
          <div class="cc-row">
            <span>Turnover</span>
            <span class="cc-value">${company.turnover}</span>
          </div>
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
