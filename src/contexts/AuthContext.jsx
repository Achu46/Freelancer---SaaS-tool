import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, IS_DEMO_MODE } from '../lib/firebase';
import { ADMIN_EMAIL } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    
    const defaultProfile = {
      email,
      displayName,
      role: 'freelancer', // Default role for all new signups
      plan: 'free',
      createdAt: serverTimestamp(),
    };
    // Create user document in Firestore
    await setDoc(doc(db, 'users', result.user.uid), defaultProfile);
    setUserProfile(defaultProfile);
    return result;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const { user } = result;

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const isAdmin = user.email === ADMIN_EMAIL;
      const defaultProfile = {
        email: user.email,
        displayName: user.displayName || 'Freelancer',
        role: isAdmin ? 'admin' : 'freelancer',
        plan: isAdmin ? 'pro' : 'free',
        isAdmin: isAdmin ? true : false,
        createdAt: serverTimestamp(),
      };
      await setDoc(userDocRef, defaultProfile);
      setUserProfile(defaultProfile);
    } else {
      setUserProfile(userDoc.data());
    }
    return result;
  }

  function logout() {
    return signOut(auth);
  }

  async function fetchUserProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      setUserProfile(snap.data());
    }
  }

  useEffect(() => {
    // If running without Firebase credentials, resolve immediately
    if (IS_DEMO_MODE) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }
  , []);

  const value = {
    currentUser,
    userProfile,
    isAdmin: userProfile?.role === 'admin' || userProfile?.isAdmin === true,
    setUserProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    loading,
    refetchProfile: () => currentUser && fetchUserProfile(currentUser.uid),
  };


  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

