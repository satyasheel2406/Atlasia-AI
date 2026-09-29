// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "atlasiaai.firebaseapp.com",
  projectId: "atlasiaai",
  storageBucket: "atlasiaai.firebasestorage.app",
  messagingSenderId: "917498590324",
  appId: "1:917498590324:web:21d3a41936f58f91164d21",
  measurementId: "G-DEXWMTJNQS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth =getAuth(app)
export const googleProvider = new GoogleAuthProvider()
