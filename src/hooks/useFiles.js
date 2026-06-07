import { useState, useEffect, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import {
  collection, query, where, orderBy, getDocs,
  addDoc, serverTimestamp,
} from 'firebase/firestore';
import {
  ref, uploadBytesResumable, getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB (increased with compression)

export function useFiles(projectId) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
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
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)} MB limit.`);
    }

    setUploading(true);
    setUploadProgress(0);

    let fileToUpload = file;

    // 1. Image Compression (if applicable)
    if (file.type.startsWith('image/')) {
      setIsCompressing(true);
      try {
        const options = {
          maxSizeMB: 1, // Aim for < 1MB
          maxWidthOrHeight: 1920, // Max 1080p-ish
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(file, options);
      } catch (error) {
        console.warn('Compression failed, using original file:', error);
      } finally {
        setIsCompressing(false);
      }
    }

    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `projects/${projectId}/${Date.now()}_${fileToUpload.name}`);
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          setUploading(false);
          setUploadProgress(0);
          reject(error);
        },
        async () => {
          try {
            const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
            await addDoc(collection(db, 'files'), {
              projectId,
              fileName: file.name,
              fileUrl,
              fileType: file.type,
              fileSize: fileToUpload.size,
              originalSize: file.size,
              uploadedBy,
              timestamp: serverTimestamp(),
            });
            await fetchFiles();
            setUploading(false);
            setUploadProgress(0);
            resolve(fileUrl);
          } catch (err) {
            setUploading(false);
            reject(err);
          }
        }
      );
    });
  }

  return { files, loading, uploading, isCompressing, uploadProgress, uploadFile, refetch: fetchFiles };
}
