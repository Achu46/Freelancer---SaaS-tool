import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useProjects() {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Use onSnapshot (real-time) — no composite index needed without orderBy
    const q = query(
      collection(db, 'projects'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort client-side by createdAt descending (avoids index requirement)
        data.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });
        setProjects(data);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore projects error:', err.code, err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  async function createProject({ clientName, clientEmail, description }) {
    if (!currentUser) throw new Error('Not authenticated');
    try {
      const publicLinkId = nanoid(10);
      const ref = await addDoc(collection(db, 'projects'), {
        userId: currentUser.uid,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim().toLowerCase(),
        description: description?.trim() || '',
        status: 'active',
        publicLinkId,
        createdAt: serverTimestamp(),
      });
      // onSnapshot will auto-update projects list
      return { id: ref.id, publicLinkId };
    } catch (err) {
      console.error('createProject failed:', err.code, err.message);
      throw err;
    }
  }

  async function updateProject(projectId, data) {
    try {
      await updateDoc(doc(db, 'projects', projectId), data);
    } catch (err) {
      console.error('updateProject failed:', err.code, err.message);
      throw err;
    }
  }

  async function deleteProject(projectId) {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (err) {
      console.error('deleteProject failed:', err.code, err.message);
      throw err;
    }
  }

  const refetch = useCallback(() => {}, []);

  return { projects, loading, error, createProject, updateProject, deleteProject, refetch };
}

