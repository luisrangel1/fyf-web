import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

// ⚡ Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDwLd-UGGzx_xlNLSs7m1LLYnyhAJ9w8fg",
  authDomain: "fireyoufireweb.firebaseapp.com",
  projectId: "fireyoufireweb",
  storageBucket: "fireyoufireweb.appspot.com",
  messagingSenderId: "987094825321",
  appId: "1:987094825321:web:fb52f2613b3bb3901b65f8",
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// 🔹 Tipo de respuesta esperado desde la Cloud Function
export type RegisterResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

// 🔹 Helper para llamar a la función de Firebase
export async function registerPlayerOnCall(data: {
  wallet: string;
  nickname: string;
  eventId: string;
  txHash: string;
}): Promise<RegisterResponse> {
  const callable = httpsCallable<RegisterResponse>(functions, "registerPlayer");
  const res = await callable(data);
  return res.data;
}

