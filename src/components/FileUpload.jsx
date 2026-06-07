import { useRef, useState } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import toast from 'react-hot-toast';

function getFileIcon(type) {
  if (type?.startsWith('image/')) return <Image size={18} className="text-indigo-500" />;
  if (type === 'application/pdf') return <FileText size={18} className="text-rose-500" />;
  return <File size={18} className="text-slate-400" />;
}

export default function FileUpload({ onUpload, uploading, isCompressing, uploadProgress }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  function handleFile(file) {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File exceeds 20 MB limit');
      return;
    }
    setSelectedFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      // Success toast is now handled by the parent caller (e.g. ClientPortal) to avoid double notifications
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : selectedFile
            ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
          id="file-upload-input"
        />

        {selectedFile ? (
          <div className="flex items-center gap-3 justify-center">
            {getFileIcon(selectedFile.type)}
            <div className="text-left">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            {!uploading && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                title="Remove file"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          <>
            <Upload size={24} className="mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Drop a file or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">Max 20 MB · Images compressed automatically</p>
          </>
        )}
      </div>

      {/* Upload progress */}
      {(uploading || isCompressing) && (
        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>
              {isCompressing 
                ? 'Optimizing Image...' 
                : uploadProgress === 100 
                ? 'Finalizing...' 
                : 'Uploading...'}
            </span>
            <span>{isCompressing ? '...' : `${uploadProgress}%`}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300 ${isCompressing ? 'w-1/4 animate-pulse' : ''}`}
              style={{ width: isCompressing ? '33%' : `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload button */}
      {selectedFile && !uploading && !isCompressing && (
        <button
          onClick={handleUpload}
          className="w-full py-2.5 text-sm font-bold text-slate-900 bg-indigo-500 hover:bg-indigo-400 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
          id="file-upload-btn"
        >
          Upload to Cloud
        </button>
      )}
    </div>
  );
}
