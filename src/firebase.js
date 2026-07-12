import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace these with your actual Firebase project config
// Once you add these, the app will automatically switch from LocalStorage to Cloud Storage!
const firebaseConfig = {
  apiKey: "", // e.g. "AIzaSy..."
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Check if Firebase is actually configured
export const isFirebaseConfigured = firebaseConfig.apiKey !== "";

let app;
let auth;
let db;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };
