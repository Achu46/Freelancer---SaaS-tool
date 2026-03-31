import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, getDocs,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('useTasks error:', err);
      // Fallback for demo/dev
      if (!projectId || projectId.startsWith('demo-')) {
        setTasks([
          { id: 't1', title: 'Review initial requirements', status: 'done', dueDate: '2025-04-01' },
          { id: 't2', title: 'Design system setup', status: 'in-progress', dueDate: '2025-04-05' },
          { id: 't3', title: 'Final portal delivery', status: 'pending', dueDate: '2025-04-10' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function addTask({ title, dueDate }) {
    await addDoc(collection(db, 'tasks'), {
      projectId,
      title,
      status: 'pending',
      dueDate: dueDate || null,
      createdAt: serverTimestamp(),
    });
    await fetchTasks();
  }

  async function updateTask(taskId, data) {
    await updateDoc(doc(db, 'tasks', taskId), data);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...data } : t)));
  }

  async function deleteTask(taskId) {
    await deleteDoc(doc(db, 'tasks', taskId));
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  return { tasks, loading, addTask, updateTask, deleteTask, refetch: fetchTasks };
}
