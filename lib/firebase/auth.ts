import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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

export async function signInWithGoogle(): Promise<UserCredential> {
  await ensureAuthPersistence();
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  await signOut(auth);
}
