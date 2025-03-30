
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9S9fP2wHX8UTuwRR26Y9Sls0DbMyaqoc",
  authDomain: "isp-chatbot.firebaseapp.com",
  databaseURL: "https://isp-chatbot-default-rtdb.firebaseio.com",
  projectId: "isp-chatbot",
  storageBucket: "isp-chatbot.appspot.com", // Fixed the storage bucket URL
  messagingSenderId: "16927512964",
  appId: "1:16927512964:web:62f88bb6866df195d8e5d1",
  measurementId: "G-LEGP394Z8P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { app, analytics, auth, database, storage };
