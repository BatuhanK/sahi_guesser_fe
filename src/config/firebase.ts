import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCJcgdpqGVOjV3kKdCimzarZ-aAVDlfgrU",
  authDomain: "comsahikaca.firebaseapp.com",
  projectId: "comsahikaca",
  storageBucket: "comsahikaca.firebasestorage.app",
  messagingSenderId: "28944065882",
  appId: "1:28944065882:web:912de797afec497384bf63",
  measurementId: "G-L118SHYHB8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 