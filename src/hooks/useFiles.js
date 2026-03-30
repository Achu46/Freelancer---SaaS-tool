import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, getDocs,
  addDoc, serverTimestamp,
} from 'firebase/firestore';
import {
  ref, uploadBytesResumable, getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function useFiles(projectId) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchFiles = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'files'),
        where('projectId', '==', projectId),
        orderBy('timestamp', 'desc')
      );
      const snap = await getDocs(q);
      setFiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('useFiles error:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  async function uploadFile(file, uploadedBy = 'client') {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10 MB limit.');
    }

    setUploading(true);
    setUploadProgress(0);

    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `projects/${projectId}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          setUploading(false);
          reject(error);
        },
        async () => {
          const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'files'), {
            projectId,
            fileName: file.name,
            fileUrl,
            fileType: file.type,
            fileSize: file.size,
            uploadedBy,
            timestamp: serverTimestamp(),
          });
          await fetchFiles();
          setUploading(false);
          setUploadProgress(0);
          resolve(fileUrl);
        }
      );
    });
  }

  return { files, loading, uploading, uploadProgress, uploadFile, refetch: fetchFiles };
}
