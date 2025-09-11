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

// 🔹 Tipo de entrada
export type RegisterData = {
  wallet: string;
  nickname: string;
  eventId: string;
  txHash: string;
};

// 🔹 Tipo de salida
export type RegisterResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

// 🔹 Helper para llamar a la función de Firebase
export async function registerPlayerOnCall(data: RegisterData): Promise<RegisterResponse> {
  const callable = httpsCallable<RegisterData, RegisterResponse>(functions, "registerPlayer");
  const res = await callable(data);
  return res.data;
}


