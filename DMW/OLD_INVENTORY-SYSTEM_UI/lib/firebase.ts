// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: This is a public configuration and is safe to expose.
// Security is handled by Firestore Security Rules.
const firebaseConfig = {
  "projectId": "trial-dmw13-inventory-7ieo6",
  "appId": "1:913232122164:web:673ed5e9dafbe90d74d561",
  "storageBucket": "trial-dmw13-inventory-7ieo6.firebasestorage.app",
  "apiKey": "AIzaSyA5p7tKMDZ__UhK7dJkkGH63fUpoSCd1V0",
  "authDomain": "trial-dmw13-inventory-7ieo6.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "913232122164"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
