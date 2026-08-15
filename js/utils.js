// ═══ UTILITIES MODULE ═══
// Helper functions and utilities

/* GENERATE UNIQUE ID */
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/* COPY TO CLIPBOARD */
function copyToClipboard(text) {
  return navigator.clipboard.writeText(text)
    .then(() => {
      showToast('✅ Copied to clipboard!');
      return true;
    })
    .catch(err => {
      console.error('Failed to copy:', err);
      return false;
    });
}

/* DOWNLOAD FILE */
function downloadFile(filename, content, contentType = 'text/plain') {
  const element = document.createElement('a');
  element.setAttribute('href', `data:${contentType};charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/* READ FILE AS TEXT */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsText(file);
  });
}

/* READ FILE AS DATA URL */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });
}

/* FORMAT FILE SIZE */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/* SLEEP / DELAY */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* RETRY FUNCTION */
async function retry(fn, maxAttempts = 3, delay = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      await sleep(delay);
    }
  }
}

/* CHECK OBJECT IS EMPTY */
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/* DEEP CLONE OBJECT */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* MERGE OBJECTS */
function mergeObjects(target, source) {
  return { ...target, ...source };
}

/* GET QUERY PARAMETER */
function getQueryParam(param) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(param);
}

/* SET LOCAL STORAGE */
function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
}

/* GET LOCAL STORAGE */
function getStorage(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Storage error:', error);
    return null;
  }
}

/* REMOVE FROM LOCAL STORAGE */
function removeStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
}

console.log('✅ Utilities module loaded');
