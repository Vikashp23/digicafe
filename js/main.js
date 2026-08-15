// ═══ MAIN WEBSITE LOGIC ═══
// Public website functionality

/* INITIALIZE HOMEPAGE */
function initHomepage() {
  // Render services on homepage
  renderServices('.services-container');
  
  // Render latest news on homepage
  renderNews('.latest-news-container', 3);
  
  // Setup event listeners
  setupEventListeners();
}

/* INITIALIZE NEWS PAGE */
function initNewsPage() {
  renderNews('.all-news-container');
}

/* INITIALIZE SERVICES PAGE */
function initServicesPage() {
  renderServices('.services-container');
  
  // Setup filter buttons
  const filterButtons = document.querySelectorAll('[data-filter]');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const filter = this.getAttribute('data-filter');
      
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Render filtered services
      if (filter === 'all') {
        renderServices('.services-container');
      } else {
        renderServices('.services-container', filter);
      }
    });
  });
}

/* INITIALIZE DIGITAL ASSISTANCE PAGE */
function initAssistancePage() {
  // Add any assistance page specific logic here
  console.log('Digital Assistance page initialized');
}

/* SETUP EVENT LISTENERS */
function setupEventListeners() {
  // Navigation
  const navItems = document.querySelectorAll('[data-nav]');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const page = this.getAttribute('data-nav');
      showPage(page);
    });
  });

  // Auth related
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => showPage('auth'));
  }
}

/* HANDLE SERVICE REQUEST SUBMISSION */
function submitServiceRequest() {
  const serviceSelect = document.getElementById('service-select');
  const messageArea = document.getElementById('message-area');
  
  if (!serviceSelect || !serviceSelect.value) {
    showToast('Please select a service', 'warning');
    return;
  }

  if (!messageArea || !messageArea.value) {
    showToast('Please enter service details', 'warning');
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    showToast('Please log in first', 'info');
    return;
  }

  // Show loading
  const submitBtn = document.querySelector('[onclick="submitServiceRequest()"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Submitting...';
  }

  // Save request to Firebase
  db.collection('service_requests').add({
    clientId: user.uid,
    clientEmail: user.email,
    clientName: user.displayName || user.email,
    service: serviceSelect.value,
    message: messageArea.value,
    status: 'pending',
    amount: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  })
    .then(docRef => {
      showToast(`✅ Request submitted! ID: ${docRef.id}`);
      
      // Clear form
      serviceSelect.value = '';
      messageArea.value = '';
      
      // Redirect to dashboard
      setTimeout(() => showPage('dashboard'), 1500);
    })
    .catch(error => {
      showToast(`❌ Error: ${error.message}`, 'danger');
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '📤 Submit Request';
      }
    });
}

/* HANDLE GOOGLE SIGN UP */
function handleGoogleSignup() {
  googleSignIn()
    .then(user => {
      showToast(`✅ Welcome ${user.displayName}!`);
      setTimeout(() => showPage('dashboard'), 1500);
    })
    .catch(error => {
      console.error('Google signup error:', error);
    });
}

/* HANDLE EMAIL SIGN UP */
function handleEmailSignup() {
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');
  const nameInput = document.getElementById('signup-name');

  if (!emailInput || !emailInput.value) {
    showToast('Please enter email', 'warning');
    return;
  }

  if (!passwordInput || !passwordInput.value) {
    showToast('Please enter password', 'warning');
    return;
  }

  if (!nameInput || !nameInput.value) {
    showToast('Please enter your name', 'warning');
    return;
  }

  if (!validateEmail(emailInput.value)) {
    showToast('Please enter a valid email', 'warning');
    return;
  }

  const signupBtn = document.querySelector('[onclick="handleEmailSignup()"]');
  if (signupBtn) {
    signupBtn.disabled = true;
    signupBtn.textContent = '⏳ Creating account...';
  }

  signupUser(emailInput.value, passwordInput.value, nameInput.value)
    .then(user => {
      showToast('✅ Account created!');
      
      // Clear form
      emailInput.value = '';
      passwordInput.value = '';
      nameInput.value = '';
      
      // Redirect to dashboard
      setTimeout(() => showPage('dashboard'), 1500);
    })
    .catch(error => {
      console.error('Signup error:', error);
    })
    .finally(() => {
      if (signupBtn) {
        signupBtn.disabled = false;
        signupBtn.textContent = '📝 Create Account';
      }
    });
}

/* HANDLE EMAIL LOGIN */
function handleEmailLogin() {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  if (!emailInput || !emailInput.value) {
    showToast('Please enter email', 'warning');
    return;
  }

  if (!passwordInput || !passwordInput.value) {
    showToast('Please enter password', 'warning');
    return;
  }

  const loginBtn = document.querySelector('[onclick="handleEmailLogin()"]');
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = '⏳ Logging in...';
  }

  loginUser(emailInput.value, passwordInput.value)
    .then(user => {
      showToast('✅ Logged in!');
      
      // Clear form
      emailInput.value = '';
      passwordInput.value = '';
      
      // Redirect to dashboard
      setTimeout(() => showPage('dashboard'), 1500);
    })
    .catch(error => {
      console.error('Login error:', error);
    })
    .finally(() => {
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = '🔓 Log In';
      }
    });
}

/* MONITOR AUTH STATE */
onAuthStateChanged(user => {
  const authBtn = document.getElementById('auth-btn');
  
  if (user) {
    // User is logged in
    if (authBtn) {
      authBtn.textContent = '👤 Dashboard';
      authBtn.onclick = () => showPage('dashboard');
    }
    
    // Update logout button if present
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.style.display = 'block';
    }
  } else {
    // User is logged out
    if (authBtn) {
      authBtn.textContent = '🔓 Log In';
      authBtn.onclick = () => showPage('auth');
    }
    
    // Hide logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.style.display = 'none';
    }
  }
});

console.log('✅ Main website logic loaded');
