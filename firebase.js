// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7hkAeAb3nKY-4pE4QLpHMTEp8W0_vnJM",
  authDomain: "familyfinance-a4355.firebaseapp.com",
  projectId: "familyfinance-a4355",
  storageBucket: "familyfinance-a4355.firebasestorage.app",
  messagingSenderId: "330135895451",
  appId: "1:330135895451:web:e287165cc7764d7b5d353e",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
