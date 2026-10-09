import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDXvtvzJRHgl8EcFStCauDcVlBeyW3Y84U',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'api-testing-tool-87282.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'api-testing-tool-87282',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'api-testing-tool-87282.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '694349200802',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:694349200802:web:2e8e842d018c53121fc6fb',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogleFirebase = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return {
    email: user.email,
    name: user.displayName || user.email?.split('@')[0],
    photoURL: user.photoURL || '',
    googleId: user.uid,
  };
};

