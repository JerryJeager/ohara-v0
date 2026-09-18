import { ArrowUp } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ChatComposerProps = {
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
};

export function ChatComposer({
  question,
  onQuestionChange,
  onSubmit,
  disabled,
}: ChatComposerProps) {
  return (
    <div className="shrink-0 px-5 pb-5 pt-3 sm:px-8">
      <form
        onSubmit={onSubmit}
        className="mx-auto flex max-w-3xl items-center gap-2 rounded-xl border border-input bg-card p-2 shadow-sm"
      >
        <input
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="Ask a question about this website..."
          className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          size="icon"
          className="size-9 shrink-0 rounded-lg"
          disabled={disabled}
          aria-label="Send message"
        >
          <ArrowUp className="size-4" />
        </Button>
      </form>

      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Ohara can make mistakes. Check important information.
      </p>
    </div>
  );
}
