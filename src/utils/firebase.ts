import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database ID from the config
export const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

export { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, doc, getDoc, setDoc, updateDoc };

