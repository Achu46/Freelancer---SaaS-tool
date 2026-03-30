import { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useMessages(projectId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Query the top-level 'messages' collection filtered by projectId
    // No orderBy — sort client-side to avoid needing a composite index
    const q = query(
      collection(db, 'messages'),
      where('projectId', '==', projectId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort ascending by timestamp client-side
        data.sort((a, b) => {
          const aTime = a.timestamp?.toMillis?.() ?? 0;
          const bTime = b.timestamp?.toMillis?.() ?? 0;
          return aTime - bTime;
        });
        setMessages(data);
        setLoading(false);
      },
      (err) => {
        console.error('useMessages error:', err.code, err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  async function sendMessage({ text, sender }) {
    if (!projectId) throw new Error('No projectId');
    try {
      await addDoc(collection(db, 'messages'), {
        projectId,
        text: text.trim(),
        sender,
        timestamp: serverTimestamp(),
      });
      // onSnapshot auto-updates the list
    } catch (err) {
      console.error('sendMessage failed:', err.code, err.message);
      throw err;
    }
  }

  return { messages, loading, error, sendMessage };
}

