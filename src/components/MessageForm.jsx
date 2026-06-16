import { Send, Zap } from 'lucide-react';

export default function MessageForm({ msgText, setMsgText, onSubmit, sending, inputId, buttonId, placeholder = 'Type a message\u2026' }) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder={placeholder}
        value={msgText}
        onChange={(e) => setMsgText(e.target.value)}
        id={inputId}
        className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
      />
      <button
        type="submit"
        disabled={sending || !msgText.trim()}
        id={buttonId}
        className="w-11 h-11 flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        title="Send message"
      >
        {sending ? <Zap size={15} className="text-white thunder-loader" /> : <Send size={15} />}
      </button>
    </form>
  );
}
