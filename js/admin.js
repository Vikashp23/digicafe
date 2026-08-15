// ═══ ADMIN LOGIC ═══
// Admin portal functionality

const ADMIN_EMAILS = ['admin@digicafe.com', 'support@digicafe.com', 'vikashpathak.mgmt@gmail.com'];

/* INITIALIZE ADMIN */
function initAdmin() {
  const user = getCurrentUser();
  
  if (!user || !isAdminUser(user.email)) {
    showToast('Unauthorized access', 'danger');
    document.location.href = '/';
    return;
  }

  // Load admin dashboard
  loadAdminDashboard();
  
  // Setup admin navigation
  setupAdminNavigation();
}

/* CHECK IF USER IS ADMIN */
function isAdminUser(email) {
  return ADMIN_EMAILS.includes(email);
}

/* LOAD ADMIN DASHBOARD */
function loadAdminDashboard() {
  loadRequestsList();
  loadDashboardStats();
}

/* LOAD REQUESTS LIST */
function loadRequestsList() {
  const requestsContainer = document.getElementById('admin-requests-body');
  if (!requestsContainer) return;

  requestsContainer.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading...</td></tr>';

  db.collection('service_requests')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        requestsContainer.innerHTML = '<tr><td colspan="7" style="text-align:center;">No requests yet</td></tr>';
        return;
      }

      let html = '';
      snapshot.forEach(doc => {
        const req = doc.data();
        html += `
          <tr>
            <td>${req.clientName}</td>
            <td>${req.clientEmail}</td>
            <td>${req.service}</td>
            <td>${formatDate(req.createdAt?.toDate())}</td>
            <td>
              <select class="badge badge-${getStatusColor(req.status)}" onchange="updateRequestStatus('${doc.id}', this.value)">
                <option value="pending" ${req.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="progress" ${req.status === 'progress' ? 'selected' : ''}>In Progress</option>
                <option value="completed" ${req.status === 'completed' ? 'selected' : ''}>Completed</option>
                <option value="hold" ${req.status === 'hold' ? 'selected' : ''}>On Hold</option>
              </select>
            </td>
            <td>${req.amount || '₹0'}</td>
            <td>
              <button class="btn btn-secondary btn-small" onclick="viewRequestDetails('${doc.id}')">📋 View</button>
            </td>
          </tr>
        `;
      });

      requestsContainer.innerHTML = html;
    })
    .catch(error => {
      console.error('Error loading requests:', error);
      requestsContainer.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error loading requests</td></tr>';
    });
}

/* UPDATE REQUEST STATUS */
function updateRequestStatus(requestId, newStatus) {
  db.collection('service_requests').doc(requestId).update({
    status: newStatus,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  })
    .then(() => {
      showToast(`✅ Status updated to ${newStatus}`);
      loadRequestsList();
    })
    .catch(error => {
      showToast(`❌ Error: ${error.message}`, 'danger');
    });
}

/* VIEW REQUEST DETAILS */
function viewRequestDetails(requestId) {
  db.collection('service_requests').doc(requestId).get()
    .then(doc => {
      if (!doc.exists) {
        showToast('Request not found', 'warning');
        return;
      }

      const req = doc.data();
      const details = `
CLIENT NAME: ${req.clientName}
EMAIL: ${req.clientEmail}
SERVICE: ${req.service}
MESSAGE: ${req.message}
STATUS: ${req.status}
DATE: ${formatDate(req.createdAt?.toDate())}
AMOUNT: ${req.amount || '₹0'}
ID: ${requestId}
      `;

      alert(details);
    })
    .catch(error => {
      showToast(`❌ Error: ${error.message}`, 'danger');
    });
}

/* LOAD DASHBOARD STATS */
function loadDashboardStats() {
  db.collection('service_requests')
    .get()
    .then(snapshot => {
      const stats = {
        total: snapshot.size,
        pending: 0,
        progress: 0,
        completed: 0,
        hold: 0
      };

      snapshot.forEach(doc => {
        const status = doc.data().status;
        stats[status] = (stats[status] || 0) + 1;
      });

      displayDashboardStats(stats);
    })
    .catch(error => console.error('Error loading stats:', error));
}

/* DISPLAY DASHBOARD STATS */
function displayDashboardStats(stats) {
  const statsContainer = document.getElementById('admin-stats');
  if (!statsContainer) return;

  statsContainer.innerHTML = `
    <div class="card">
      <h3>📊 Dashboard Stats</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:1rem; margin-top:1rem;">
        <div style="background:var(--bg3); padding:1rem; border-radius:var(--r); text-align:center;">
          <div style="font-size:2rem; font-weight:900; color:var(--blue);">${stats.total}</div>
          <div style="color:var(--txt3); font-size:0.9rem;">Total Requests</div>
        </div>
        <div style="background:var(--bg3); padding:1rem; border-radius:var(--r); text-align:center;">
          <div style="font-size:2rem; font-weight:900; color:var(--gold);">${stats.pending}</div>
          <div style="color:var(--txt3); font-size:0.9rem;">Pending</div>
        </div>
        <div style="background:var(--bg3); padding:1rem; border-radius:var(--r); text-align:center;">
          <div style="font-size:2rem; font-weight:900; color:var(--blue);">${stats.progress}</div>
          <div style="color:var(--txt3); font-size:0.9rem;">In Progress</div>
        </div>
        <div style="background:var(--bg3); padding:1rem; border-radius:var(--r); text-align:center;">
          <div style="font-size:2rem; font-weight:900; color:var(--green);">${stats.completed}</div>
          <div style="color:var(--txt3); font-size:0.9rem;">Completed</div>
        </div>
      </div>
    </div>
  `;
}

/* SETUP ADMIN NAVIGATION */
function setupAdminNavigation() {
  const navItems = document.querySelectorAll('[data-admin-tab]');
  
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const tab = this.getAttribute('data-admin-tab');
      showAdminTab(tab);
    });
  });
}

/* SHOW ADMIN TAB */
function showAdminTab(tabName) {
  // Hide all tabs
  const tabs = document.querySelectorAll('[data-admin-page]');
  tabs.forEach(tab => tab.style.display = 'none');

  // Show selected tab
  const selectedTab = document.querySelector(`[data-admin-page="${tabName}"]`);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }

  // Update navigation highlight
  const navItems = document.querySelectorAll('[data-admin-tab]');
  navItems.forEach(item => item.classList.remove('active'));
  document.querySelector(`[data-admin-tab="${tabName}"]`)?.classList.add('active');

  // Load tab-specific data
  if (tabName === 'requests') {
    loadRequestsList();
  }
}

/* ADMIN LOGOUT */
function adminLogout() {
  if (confirm('Are you sure you want to log out?')) {
    logoutUser()
      .then(() => {
        document.location.href = '/';
      })
      .catch(error => showToast(`Error: ${error.message}`, 'danger'));
  }
}

/* MONITOR AUTH STATE FOR ADMIN */
onAuthStateChanged(user => {
  if (!user || !isAdminUser(user.email)) {
    // Redirect non-admin users
    const adminPanel = document.querySelector('[data-admin-panel]');
    if (adminPanel) {
      adminPanel.style.display = 'none';
      showToast('Unauthorized access', 'danger');
    }
  }
});

console.log('✅ Admin logic loaded');
