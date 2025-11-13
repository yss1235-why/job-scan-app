import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3KNFDxcvlpj235SxHwMam1b8xhM8l7wM",
  authDomain: "pi-lottery-901c4.firebaseapp.com",
  projectId: "pi-lottery-901c4",
  storageBucket: "pi-lottery-901c4.firebasestorage.app",
  messagingSenderId: "1028018249150",
  appId: "1:1028018249150:web:fe6070771c08617635edef",
  measurementId: "G-6YJRWNRJMN"
};

// Admin emails list - will be moved to Firestore for production
export const ADMIN_EMAILS = [
  'yursccc@gmail.com',
  // Add more admin emails here as needed
];

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
