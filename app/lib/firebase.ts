import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZqLnd1CK7bMxi0mvneFG1W3uxM-PT3R0",
  authDomain: "poizon-30237.firebaseapp.com",
  projectId: "poizon-30237",
  storageBucket: "poizon-30237.firebasestorage.app",
  messagingSenderId: "179366328761",
  appId: "1:179366328761:web:0c52112790778b48d15e68",
  measurementId: "G-WY5L1HNNVS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };

