import type { Message } from '@/types/knowledge-base';

type ChatThreadProps = {
  messages: Message[];
  endRef: React.RefObject<HTMLDivElement | null>;
};

export function ChatThread({ messages, endRef }: ChatThreadProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[72%] ${message.role === 'user' ? 'order-1' : ''}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md border border-border bg-card text-card-foreground'}`}
              >
                {message.content}
              </div>
              <p
                className={`mt-1.5 text-[11px] text-muted-foreground ${message.role === 'user' ? 'text-right' : ''}`}
              >
                {message.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
