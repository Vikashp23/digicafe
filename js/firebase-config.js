// ═══ FIREBASE CONFIGURATION ═══
// Shared Firebase setup for all pages

const firebaseConfig = {
  apiKey: "AIzaSyDcdR-ba5Lh-DfG-wuABRntQm1sSYSr3Kk",
  authDomain: "digicafe-ee519.firebaseapp.com",
  projectId: "digicafe-ee519",
  storageBucket: "digicafe-ee519.appspot.com",
  messagingSenderId: "582268562769",
  appId: "1:582268562769:web:720288e24fd8de7166f770",
  measurementId: "G-25T4WHH8X4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global Firebase instances
const auth = firebase.auth();
const db = firebase.firestore();

console.log('✅ Firebase initialized - digicafe-ee519');
