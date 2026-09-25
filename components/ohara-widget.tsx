"use client";

import { FormEvent, useState } from "react";
import {
  ArrowUp,
  ChevronDown,
  Paperclip,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

const starterPrompts = [
  "What can I use Ohara for?",
  "How does pricing work?",
  "I need help with my account",
];

export function OharaWidget() {
  const [open, setOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    setMessages((current) => [...current, message.trim()]);
    setMessage("");
  }

  function closeWidget() {
    setOpen(false);
    if (window.parent !== window)
      window.parent.postMessage({ type: "ohara-close" }, "*");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f3f1] text-[#191918]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,.95),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(226,224,219,.72),transparent_36%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-6 py-8 sm:px-10 sm:py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#20201f] text-xs font-semibold text-white">
              o
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.02em]">
              Ohara
            </span>
          </div>
          <span className="rounded-full border border-black/10 bg-white/55 px-3 py-1.5 text-xs text-black/50">
            Embedded support preview
          </span>
        </header>

        <div className="max-w-xl pb-28 pt-24 sm:pb-36">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-black/40">
            AI support, made clear
          </p>
          <h1 className="max-w-lg text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-[#1b1b1a] sm:text-7xl">
            Answers your customers can actually use.
          </h1>
          <p className="mt-7 max-w-md text-base leading-7 text-black/50">
            Ohara learns from your website and gives every visitor a thoughtful,
            on-brand place to ask questions.
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-black/10 pt-5 text-xs text-black/40">
          <span>ohara.ai</span>
          <span>Powered by your knowledge base</span>
        </div>
      </div>

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

          <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
            <div className="mb-6 flex items-center gap-2 text-[11px] text-black/35">
              <div className="size-1.5 rounded-full bg-emerald-500" /> Ohara is
              online
            </div>
            <div className="mb-5 flex items-start gap-2.5">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#242423] text-[11px] font-semibold text-white">
                o
              </div>
              <div className="max-w-[285px] rounded-2xl rounded-tl-md bg-[#f0efec] px-4 py-3.5 text-[13px] leading-5 text-[#30302e]">
                Hi there. I&apos;m Ohara, the AI assistant for this site. How
                can I help you today?
              </div>
            </div>
            <div className="flex flex-col gap-2 pl-9">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setMessage(prompt)}
                  className="w-fit max-w-full rounded-full border border-black/10 bg-white px-3.5 py-2 text-left text-xs text-black/60 transition-colors hover:border-black/25 hover:text-black"
                >
                  {prompt}
                </button>
              ))}
            </div>
            {messages.map((item, index) => (
              <div key={`${item}-${index}`} className="mt-5 flex justify-end">
                <div className="max-w-[275px] rounded-2xl rounded-br-md bg-[#242423] px-4 py-3 text-[13px] leading-5 text-white">
                  {item}
                </div>
              </div>
            ))}
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
                placeholder="Ask a question..."
                aria-label="Message Ohara"
                className="w-full resize-none bg-transparent px-2 py-1 text-[13px] outline-none placeholder:text-black/35"
              />
              <div className="flex items-center justify-between px-1 pt-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Add attachment"
                    className="flex size-7 items-center justify-center rounded-lg text-black/35 hover:bg-black/5 hover:text-black/70"
                  >
                    <Paperclip className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="New conversation"
                    className="flex size-7 items-center justify-center rounded-lg text-black/35 hover:bg-black/5 hover:text-black/70"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={!message.trim()}
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
