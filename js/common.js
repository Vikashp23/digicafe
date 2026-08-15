// ═══ COMMON FUNCTIONS ═══
// Shared JavaScript utilities used by all pages

/* PAGE NAVIGATION */
function showPage(pageName) {
  // Hide all pages
  const pages = document.querySelectorAll('[data-page]');
  pages.forEach(page => {
    page.style.display = 'none';
    page.classList.remove('active');
  });

  // Show selected page
  const selectedPage = document.querySelector(`[data-page="${pageName}"]`);
  if (selectedPage) {
    selectedPage.style.display = 'block';
    selectedPage.classList.add('active');
  }

  // Update navigation highlight
  updateNav(pageName);

  // Scroll to top
  window.scrollTo(0, 0);
}

/* UPDATE NAVIGATION HIGHLIGHT */
function updateNav(pageName) {
  const navItems = document.querySelectorAll('[data-nav]');
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-nav') === pageName) {
      item.classList.add('active');
    }
  });
}

/* TOAST NOTIFICATIONS */
function showToast(message, type = 'success', duration = 3000) {
  const toast = document.getElementById('toast');
  
  if (!toast) {
    console.warn('Toast element not found');
    return;
  }

  // Set message and style
  toast.textContent = message;
  toast.className = `toast show toast-${type}`;

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* FIREBASE AUTH STATE MONITORING */
function onAuthStateChanged(callback) {
  if (!auth) {
    console.error('Firebase auth not initialized');
    return;
  }

  auth.onAuthStateChanged(user => {
    callback(user);
  });
}

/* LOGIN USER */
function loginUser(email, password) {
  return auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      showToast('✅ Logged in successfully!');
      return userCredential.user;
    })
    .catch(error => {
      showToast(`❌ Login failed: ${error.message}`, 'danger');
      throw error;
    });
}

/* SIGNUP USER */
function signupUser(email, password, displayName = '') {
  return auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      if (displayName) {
        return user.updateProfile({ displayName })
          .then(() => user);
      }
      return user;
    })
    .then(user => {
      showToast(`✅ Account created! Welcome ${user.displayName || email}`);
      return user;
    })
    .catch(error => {
      showToast(`❌ Signup failed: ${error.message}`, 'danger');
      throw error;
    });
}

/* LOGOUT USER */
function logoutUser() {
  return auth.signOut()
    .then(() => {
      showToast('👋 Logged out successfully');
      // Redirect to home after logout
      if (typeof showPage === 'function') {
        showPage('home');
      }
    })
    .catch(error => {
      showToast(`❌ Logout failed: ${error.message}`, 'danger');
      throw error;
    });
}

/* GOOGLE SIGNIN */
function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  return auth.signInWithPopup(provider)
    .then(result => {
      showToast(`✅ Welcome ${result.user.displayName}!`);
      return result.user;
    })
    .catch(error => {
      // If popup blocked, try redirect
      if (error.code === 'auth/popup-blocked') {
        return auth.signInWithRedirect(provider);
      }
      showToast(`❌ Google signin failed: ${error.message}`, 'danger');
      throw error;
    });
}

/* FORMAT DATE */
function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-IN', options);
}

/* FORMAT CURRENCY */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
}

/* VALIDATE EMAIL */
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/* GET CURRENT USER */
function getCurrentUser() {
  return auth.currentUser;
}

/* CHECK IF USER IS LOGGED IN */
function isLoggedIn() {
  return auth.currentUser !== null;
}

/* HIDE ELEMENT */
function hideElement(elementOrSelector) {
  const element = typeof elementOrSelector === 'string'
    ? document.querySelector(elementOrSelector)
    : elementOrSelector;
  
  if (element) {
    element.style.display = 'none';
  }
}

/* SHOW ELEMENT */
function showElement(elementOrSelector, display = 'block') {
  const element = typeof elementOrSelector === 'string'
    ? document.querySelector(elementOrSelector)
    : elementOrSelector;
  
  if (element) {
    element.style.display = display;
  }
}

/* TOGGLE ELEMENT */
function toggleElement(elementOrSelector) {
  const element = typeof elementOrSelector === 'string'
    ? document.querySelector(elementOrSelector)
    : elementOrSelector;
  
  if (element) {
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
  }
}

/* CLEAR FORM */
function clearForm(formSelector) {
  const form = document.querySelector(formSelector);
  if (form) {
    form.reset();
  }
}

/* GET FORM DATA */
function getFormData(formSelector) {
  const form = document.querySelector(formSelector);
  if (!form) return {};
  
  const formData = new FormData(form);
  const data = {};
  
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  
  return data;
}

/* DEBOUNCE FUNCTION */
function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/* THROTTLE FUNCTION */
function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

console.log('✅ Common functions loaded');
