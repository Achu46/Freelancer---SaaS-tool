import { FileText, Image, File } from 'lucide-react';

export default function FileIcon({ type, size = 16 }) {
  if (type?.startsWith('image/')) return <Image size={size} className="text-indigo-500" />;
  if (type === 'application/pdf') return <FileText size={size} className="text-rose-500" />;
  return <File size={size} className="text-slate-400" />;
}
