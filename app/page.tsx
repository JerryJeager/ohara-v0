"use client";

import { FormEvent, useMemo, useRef, useState } from 'react';
import { Check, ExternalLink, Globe2, Menu } from 'lucide-react';

import { ChatComposer } from '@/components/chat-composer';
import { ChatThread } from '@/components/chat-thread';
import { CreateKnowledgeBaseForm } from '@/components/create-knowledge-base-form';
import { KnowledgeBaseSidebar } from '@/components/knowledge-base-sidebar';
import { initialWebsites } from '@/data/websites';
import type { Message, Website } from '@/types/knowledge-base';

function formatUrl(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export default function Page() {
  const [websites, setWebsites] = useState(initialWebsites);
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const selectedWebsite = useMemo(
    () => websites.find((site) => site.id === selectedId),
    [websites, selectedId],
  );

  function selectWebsite(id: number) {
    setSelectedId(id);
    setIsCreating(false);
    setShowSidebar(false);
  }

  function createWebsite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !url.trim()) return;

    const next: Website = {
      id: Date.now(),
      name: name.trim(),
      url: formatUrl(url.trim()),
      messages: [],
    };

    setWebsites((current) => [next, ...current]);
    setSelectedId(next.id);
    setName('');
    setUrl('');
    setIsCreating(false);
  }

  function sendQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim() || !selectedWebsite) return;

    const content = question.trim();
    const now = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

    const answer: Message = {
      id: Date.now() + 1,
      role: 'assistant',
      content: `Based on the indexed content from ${selectedWebsite.url}, I can help answer that. This knowledge base contains the site's key pages and documentation, and a detailed response would be generated here in the connected version of Ohara.`,
      time: now,
    };

    setWebsites((current) =>
      current.map((site) =>
        site.id === selectedWebsite.id
          ? {
              ...site,
              messages: [
                ...site.messages,
                { id: Date.now(), role: 'user', content, time: now },
                answer,
              ],
            }
          : site,
      ),
    );

    setQuestion('');
    requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground">
      <KnowledgeBaseSidebar
        websites={websites}
        selectedId={selectedId}
        isCreating={isCreating}
        showSidebar={showSidebar}
        onSelectWebsite={selectWebsite}
        onCreateNew={() => {
          setIsCreating(true);
          setSelectedId(null);
          setShowSidebar(false);
        }}
        onCloseSidebar={() => setShowSidebar(false)}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-7">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Open sidebar"
            onClick={() => setShowSidebar(true)}
          >
            <Menu className="size-5" />
          </button>

          {selectedWebsite && !isCreating ? (
            <div className="ml-2 flex min-w-0 items-center gap-3 lg:ml-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                <Globe2 className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-medium">
                  {selectedWebsite.name}
                </h1>
                <a
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  href={`https://${selectedWebsite.url}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {selectedWebsite.url}
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          ) : (
            <div />
          )}

          {selectedWebsite && !isCreating && (
            <div className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              <Check className="size-3.5 text-emerald-400" /> Indexed
            </div>
          )}
        </header>

        {isCreating ? (
          <CreateKnowledgeBaseForm
            name={name}
            url={url}
            onNameChange={setName}
            onUrlChange={setUrl}
            onSubmit={createWebsite}
          />
        ) : selectedWebsite ? (
          <>
            <ChatThread messages={selectedWebsite.messages} endRef={endRef} />
            <ChatComposer
              question={question}
              onQuestionChange={setQuestion}
              onSubmit={sendQuestion}
              disabled={!question.trim()}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Select a knowledge base to get started.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
