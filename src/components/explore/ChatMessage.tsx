import type { ExploreMessage } from '../../types';

export default function ChatMessage({ role, content }: ExploreMessage) {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAssistant
            ? 'bg-gray-50 text-gray-700'
            : 'bg-gradient-to-r from-orange-400 to-pink-400 text-white'
        }`}
      >
        {content}
      </div>
    </div>
  );
}
