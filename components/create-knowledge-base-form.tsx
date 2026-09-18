import { Library } from 'lucide-react';

import { Button } from '@/components/ui/button';

type CreateKnowledgeBaseFormProps = {
  name: string;
  url: string;
  onNameChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function CreateKnowledgeBaseForm({
  name,
  url,
  onNameChange,
  onUrlChange,
  onSubmit,
}: CreateKnowledgeBaseFormProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-xl border border-border bg-card">
            <Library className="size-5 text-muted-foreground" />
          </div>
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Chat with any website
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-6 text-muted-foreground">
            Enter a website URL and create an AI assistant that answers questions
            using information from that website.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-border bg-card/50 p-5 sm:p-6"
        >
          <label className="block space-y-2">
            <span className="text-sm font-medium">Website name</span>
            <input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="e.g. Acme Docs"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Website URL</span>
            <input
              type="url"
              value={url}
              onChange={(event) => onUrlChange(event.target.value)}
              placeholder="https://example.com"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </label>

          <Button type="submit" className="h-10 w-full">
            Create Knowledge Base
          </Button>
        </form>
      </div>
    </div>
  );
}
