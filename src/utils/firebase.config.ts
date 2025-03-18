import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// Firebase konfiguratsiyasi
const firebaseConfig = {
  apiKey: "AIzaSyCYk9-jrJL2iZmLsyjt_tAN_dOkgN8u4ec",
  authDomain: "fir-10b42.firebaseapp.com",
  databaseURL: "https://fir-10b42-default-rtdb.firebaseio.com",
  projectId: "fir-10b42",
  storageBucket: "fir-10b42.appspot.com",
  messagingSenderId: "409036899664",
  appId: "1:409036899664:web:a4aa27e8b9632c3f945855",
  measurementId: "G-6724YMS2ZS",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const database = getDatabase(app);
