import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAI, getGenerativeModel, VertexAIBackend } from "firebase/ai";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app, 'us-central1'); 

// Initialize the Vertex AI Gemini API backend service
const ai = getAI(app, { backend: new VertexAIBackend() });

// Create a `GenerativeModel` instance with a model that supports your use case
const LaporanModel = getGenerativeModel(ai, { 
  model: "gemini-2.5-flash",
  systemInstruction: 
  `
    Kamu adalah asisten seorang penjabat negara Indonesia. Kamu berfungsi untuk menganalisis dan meringkas aspirasi dari rakyat
    mengenai laporan yang diberikan. Berikan hasil analisis dengan singkat dan ringkas. Yang terpenting adalah akurat dan sesuai
    dengan suara rakyat.
    
    Hindari menggunakan **, penomeran, atau tanda tanda lainnya, cukup pake kalimat aja. untuk alternatif penomeran, mungkin
    pake paragraf aja.
  `
});

const PolicyModel = getGenerativeModel(ai, { 
  model: "gemini-2.5-flash",
  systemInstruction: 
  `
    Kamu adalah asisten seorang penjabat negara Indonesia. Kamu berfungsi untuk menganalisis dan meringkas aspirasi dari rakyat
    mengenai kebijakan pemerintah yang diberikan. Berikan hasil analisis dengan singkat dan ringkas. Yang terpenting adalah akurat dan sesuai
    dengan suara rakyat.
    
    Hindari menggunakan **, penomeran, atau tanda tanda lainnya, cukup pake kalimat aja. untuk alternatif penomeran, mungkin
    pake paragraf aja.
  `
});



export {
  db,
  auth,
  functions,
  storage,
  LaporanModel,
  PolicyModel
};