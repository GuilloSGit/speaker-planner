import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, signInAnonymously, setPersistence, browserLocalPersistence, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, doc, getDoc, setDoc, collection, addDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Inicializa Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializa Auth controlando si ya está inicializado
let auth: any;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence
  });
}

const db = getFirestore(app);

// Inicialización condicional de persistencia y analytics (solo cliente)
if (typeof window !== 'undefined') {
  // Persistencia de Firestore
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistencia fallida: Múltiples pestañas abiertas');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistencia no soportada en este navegador');
    }
  });

  // Autenticación automática anónima si es necesario
  const initAuth = async () => {
    try {
      // Nos aseguramos de que la persistencia esté configurada
      await setPersistence(auth, browserLocalPersistence);
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    } catch (error) {
      console.error('Error en inicialización de autenticación:', error);
    }
  };
  initAuth();

  // Analytics
  import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
    isSupported().then(yes => {
      if (yes) {
        getAnalytics(app);
      }
    });
  }).catch(error => {
    console.warn('Firebase Analytics no pudo ser cargado:', error);
  });
}

export {
  db,
  auth,
  app,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  signInAnonymously,
  signInWithCustomToken
};
