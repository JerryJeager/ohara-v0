"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, ChevronDown, Sparkles, X } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const mdComponents: Components = {
  p: ({ children }) => <p className="[&:not(:first-child)]:mt-2">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-2 list-disc space-y-1 pl-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-2 list-decimal space-y-1 pl-4">{children}</ol>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[#191918]">{children}</strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 hover:opacity-70"
    >
      {children}
    </a>
  ),
};

// Commented out starter prompts for now per request
// const starterPrompts = [
//   "What can I use Ohara for?",
//   "How does pricing work?",
//   "I need help with my account",
// ];

type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

export function OharaWidget() {
  const [open, setOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const websiteId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("websiteId")
      : null;
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages]);

  async function submitMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !websiteId) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      text: trimmed,
    };
    setMessages((c) => [...c, userMsg]);
    setMessage("");

    // optimistic assistant placeholder
    const assistantId = `a_${Date.now()}`;
    setMessages((c) => [
      ...c,
      { id: assistantId, role: "assistant", text: "" },
    ]);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1"}/documents/query/${encodeURIComponent(websiteId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
          credentials: "include",
        },
      );

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message ?? `API error ${res.status}`);
      }

      const data = (await res.json()) as { response: string };
      // animate typing by gradually adding characters
      await typeOutAssistantResponse(assistantId, data.response);
    } catch (err) {
      const msg = (err as Error)?.message ?? "Unknown error";
      setError(msg);
      // replace assistant placeholder with error text
      setMessages((c) =>
        c.map((m) =>
          m.id === assistantId ? { ...m, text: `Error: ${msg}` } : m,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function closeWidget() {
    setOpen(false);
    if (typeof window !== "undefined" && window.parent !== window)
      window.parent.postMessage({ type: "ohara-close" }, "*");
  }

  async function typeOutAssistantResponse(id: string, full: string) {
    const chunkMs = 18;
    for (let i = 0; i <= full.length; i++) {
      const part = full.slice(0, i);
      setMessages((c) =>
        c.map((m) => (m.id === id ? { ...m, text: part } : m)),
      );
      // allow UI to update
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, chunkMs));
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f3f1] text-[#191918]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,.95),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(226,224,219,.72),transparent_36%)]" />
      {!open && (
        <button
          aria-label="Open Ohara chat"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 flex size-14 items-center justify-center rounded-full bg-[#20201f] text-white shadow-[0_10px_30px_rgba(0,0,0,.18)] transition-transform hover:scale-105 sm:bottom-7 sm:right-7"
        >
          <Sparkles className="size-5" />
        </button>
      )}

      {open && (
        <section
          aria-label="Ohara chat"
          className="fixed inset-x-3 bottom-3 flex h-[min(680px,calc(100vh-24px))] flex-col overflow-hidden rounded-[24px] border border-black/10 bg-[#fbfaf8] shadow-[0_24px_80px_rgba(32,30,26,.22)] sm:inset-x-auto sm:bottom-7 sm:right-7 sm:h-[min(680px,calc(100vh-56px))] sm:w-[390px]"
        >
          <header className="flex items-center justify-between border-b border-black/[.07] bg-[#232322] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-white text-sm font-semibold text-[#242423]">
                o
              </div>
              <div>
                <p className="text-[14px] font-semibold tracking-[-0.01em]">
                  Ohara
                </p>
                <p className="mt-0.5 text-[11px] text-white/55">
                  Typically replies instantly
                </p>
              </div>
            </div>
            <button
              aria-label="Close Ohara chat"
              onClick={closeWidget}
              className="flex size-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </header>

          <div
            ref={messagesRef}
            className="flex flex-1 flex-col overflow-y-auto px-5 py-6"
          >
            <div className="mb-6 flex items-center gap-2 text-[11px] text-black/35">
              <div className="size-1.5 rounded-full bg-emerald-500" /> Ohara is
              online
            </div>

            {messages.length === 0 && (
              <div className="mb-5 flex items-start gap-2.5">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#242423] text-[11px] font-semibold text-white">
                  o
                </div>
                <div className="max-w-[285px] rounded-2xl rounded-tl-md bg-[#f0efec] px-4 py-3.5 text-[13px] leading-5 text-[#30302e]">
                  Hi there. I&apos;m Ohara, the AI assistant for this site. How
                  can I help you today?
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`mt-5 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`${m.role === "user" ? "max-w-[275px] rounded-2xl rounded-br-md bg-[#242423] text-white" : "max-w-[285px] rounded-2xl rounded-tl-md bg-[#f0efec] text-[#30302e]"} px-4 py-3 text-[13px] leading-5 break-words`}
                >
                  {m.role === "user" ? (
                    <span className="whitespace-pre-wrap">{m.text}</span>
                  ) : m.text === "" && loading ? (
                    <span className="flex gap-1 py-1">
                      <i className="size-1.5 animate-bounce rounded-full bg-black/30 [animation-delay:-0.3s]" />
                      <i className="size-1.5 animate-bounce rounded-full bg-black/30 [animation-delay:-0.15s]" />
                      <i className="size-1.5 animate-bounce rounded-full bg-black/30" />
                    </span>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={mdComponents}
                    >
                      {m.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}
          </div>

          <div className="border-t border-black/[.07] bg-[#fbfaf8] p-4">
            <form
              onSubmit={submitMessage}
              className="rounded-2xl border border-black/10 bg-white p-2 shadow-sm focus-within:border-black/25"
            >
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing &&
                    event.keyCode !== 229
                  ) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={2}
                placeholder={
                  websiteId ? "Ask a question..." : "No website selected"
                }
                aria-label="Message Ohara"
                className="w-full resize-none bg-transparent px-2 py-1 text-[13px] outline-none placeholder:text-black/35"
              />
              <div className="flex items-center justify-between px-1 pt-1">
                <div className="flex items-center gap-1">
                  {/* attachments removed per request */}
                </div>
                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={!message.trim() || !websiteId || loading}
                  className="flex size-8 items-center justify-center rounded-xl bg-[#242423] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
            </form>
            <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-black/30">
              Powered by{" "}
              <span className="font-semibold text-black/45">Ohara</span>
              <ChevronDown className="size-3 rotate-[-90deg]" />
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

export default OharaWidget;
