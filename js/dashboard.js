// ═══ DASHBOARD LOGIC ═══
// Client portal functionality

/* INITIALIZE DASHBOARD */
function initDashboard() {
  const user = getCurrentUser();
  
  if (!user) {
    showPage('auth');
    showToast('Please log in to access dashboard', 'info');
    return;
  }

  // Display user info
  displayUserInfo(user);
  
  // Load user's applications
  loadClientApplications(user.uid);
  
  // Setup tab navigation
  setupDashboardTabs();
}

/* DISPLAY USER INFO */
function displayUserInfo(user) {
  // Update user name
  const userNameEl = document.getElementById('user-name');
  if (userNameEl) {
    userNameEl.textContent = `Welcome, ${user.displayName || user.email.split('@')[0]}!`;
  }

  // Update avatar
  const avatarEl = document.getElementById('user-avatar');
  if (avatarEl) {
    const initials = (user.displayName || user.email)
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    avatarEl.textContent = initials;
  }

  // Update email display
  const emailEl = document.getElementById('user-email');
  if (emailEl) {
    emailEl.textContent = user.email;
  }
}

/* LOAD CLIENT APPLICATIONS */
function loadClientApplications(userId) {
  // Show loading state
  const appsContainer = document.getElementById('applications-container');
  if (appsContainer) {
    appsContainer.innerHTML = '<p style="text-align:center; color:var(--txt3);">Loading applications...</p>';
  }

  db.collection('service_requests')
    .where('clientId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get()
    .then(snapshot => {
      const applications = [];
      
      snapshot.forEach(doc => {
        applications.push({
          id: doc.id,
          ...doc.data(),
          createdDate: doc.data().createdAt?.toDate()
        });
      });

      displayApplications(applications);
    })
    .catch(error => {
      console.error('Error loading applications:', error);
      if (appsContainer) {
        appsContainer.innerHTML = `<p style="text-align:center; color:var(--red);">Error loading applications</p>`;
      }
    });
}

/* DISPLAY APPLICATIONS */
function displayApplications(applications) {
  const container = document.getElementById('applications-container');
  if (!container) return;

  if (applications.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:2rem; color:var(--txt3);">
        <p>No applications yet</p>
        <button class="btn btn-primary mt-3" onclick="showPage('home')">Browse Services</button>
      </div>
    `;
    return;
  }

  container.innerHTML = applications.map(app => `
    <div class="card mb-2">
      <div class="flex-between">
        <div>
          <h4>${app.service}</h4>
          <p style="color:var(--txt3); font-size:0.9rem;">
            ${formatDate(app.createdDate)}
          </p>
        </div>
        <span class="badge badge-${getStatusColor(app.status)}">
          ${app.status.toUpperCase()}
        </span>
      </div>
    </div>
  `).join('');
}

/* GET STATUS COLOR */
function getStatusColor(status) {
  const colors = {
    'pending': 'warning',
    'progress': 'primary',
    'completed': 'success',
    'hold': 'danger'
  };
  return colors[status] || 'primary';
}

/* HANDLE FILE UPLOAD */
function handleFileUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const filesList = document.getElementById('uploaded-files');
  if (!filesList) return;

  let html = '';
  for (let file of files) {
    html += `
      <tr>
        <td>📄 ${file.name}</td>
        <td>${formatFileSize(file.size)}</td>
        <td>${new Date().toLocaleDateString('en-IN')}</td>
        <td>
          <button class="btn btn-secondary btn-small" onclick="deleteFile(this)">🗑️ Delete</button>
        </td>
      </tr>
    `;
  }

  filesList.innerHTML += html;
  showToast(`✅ ${files.length} file(s) uploaded`);

  // Reset input
  event.target.value = '';
}

/* DELETE FILE */
function deleteFile(btn) {
  btn.closest('tr').remove();
  showToast('🗑️ File deleted');
}

/* TRIGGER FILE UPLOAD */
function triggerFileUpload() {
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.click();
  }
}

/* SETUP DASHBOARD TABS */
function setupDashboardTabs() {
  const tabButtons = document.querySelectorAll('[data-dashboard-tab]');
  const tabs = document.querySelectorAll('[data-dashboard-page]');

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-dashboard-tab');

      // Update active tab button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Show selected tab
      tabs.forEach(tab => {
        if (tab.getAttribute('data-dashboard-page') === tabName) {
          tab.style.display = 'block';
        } else {
          tab.style.display = 'none';
        }
      });
    });
  });
}

/* LOGOUT FROM DASHBOARD */
function dashboardLogout() {
  if (confirm('Are you sure you want to log out?')) {
    logoutUser()
      .then(() => showPage('home'))
      .catch(error => showToast(`Error: ${error.message}`, 'danger'));
  }
}

console.log('✅ Dashboard logic loaded');
