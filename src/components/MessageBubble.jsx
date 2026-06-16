import { formatTime } from '../utils/formatters';

export default function MessageBubble({ message, isOwnMessage, ownLabel = 'You', otherLabel = 'Client' }) {
  const ts = formatTime(message.timestamp);
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-2.5 ${
        isOwnMessage
          ? 'bg-indigo-500 text-slate-900 rounded-br-sm'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'
      }`}>
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-indigo-200' : 'text-slate-400'}`}>
          {isOwnMessage ? ownLabel : otherLabel} · {ts}
        </p>
      </div>
    </div>
  );
}
