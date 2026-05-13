import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  signOut,
  UserCredential,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, googleProvider } from './client';

export async function ensureAuthPersistence() {
  await setPersistence(auth, browserLocalPersistence);
}

export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  await ensureAuthPersistence();
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  await ensureAuthPersistence();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle(): Promise<UserCredential | void> {
  await ensureAuthPersistence();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isStandalone = typeof window !== 'undefined' && 
    ((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches);
    
  if (isStandalone) {
    return signInWithRedirect(auth, googleProvider);
  } else {
    return signInWithPopup(auth, googleProvider);
  }
}

export async function signOutUser() {
  await signOut(auth);
}
