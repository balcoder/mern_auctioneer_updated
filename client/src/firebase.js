// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-auctioneer-updated.firebaseapp.com",
  projectId: "mern-auctioneer-updated",
  storageBucket: "mern-auctioneer-updated.firebasestorage.app",
  messagingSenderId: "918689524546",
  appId: "1:918689524546:web:94df5b04424d18a87876db",
  measurementId: "G-H0NTJ0D4X5",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
