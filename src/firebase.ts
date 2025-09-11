// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDwLd-UGGzx_xlNLSs7m1LLYnyhAJ9w8fg",
  authDomain: "fireyoufireweb.firebaseapp.com",
  projectId: "fireyoufireweb",
  storageBucket: "fireyoufireweb.firebasestorage.app",
  messagingSenderId: "987094825321",
  appId: "1:987094825321:web:fb52f2613b3bb3901b65f8",
  measurementId: "G-WG4QYDT873",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore y Functions
const db = getFirestore(app);
const functions = getFunctions(app);

export { db, functions };
