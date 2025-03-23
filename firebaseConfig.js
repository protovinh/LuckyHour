import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";  // If you need Firestore
import 'dotenv/config'; // This will load the .env file


// Your Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGE,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firestore (or other services you need)
const db = getFirestore(app);

// Export the storage and config (optionally you can export the config separately if you need it elsewhere)
console.log(process.env.FIREBASE_API_KEY); // Check if the value is loaded

export { storage, firebaseConfig, db };
