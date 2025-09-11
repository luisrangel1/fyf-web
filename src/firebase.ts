// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDwLd-UGGzx_xlNLSs7m1LLYnyhAJ9w8fg",
  authDomain: "fireyoufireweb.firebaseapp.com",
  projectId: "fireyoufireweb",
  storageBucket: "fireyoufireweb.firebasestorage.app",
  messagingSenderId: "987094825321",
  appId: "1:987094825321:web:fb52f2613b3bb3901b65f8",
  measurementId: "G-WG4QYDT873"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Login anónimo automático
signInAnonymously(auth).catch((error) => {
  console.error("❌ Error en login anónimo:", error);
});

// Debug: ver estado de usuario en consola
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ Usuario anónimo autenticado:", user.uid);
  }
});
