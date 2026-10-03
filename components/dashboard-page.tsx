"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  ExternalLink,
  Globe2,
  LayoutDashboard,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Settings,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  createWebsite,
  deleteWebsite,
  getApiErrorMessage,
  getIndexedPages,
  getWebsites,
  getAllowedOrigins,
  isValidWebsiteUrl,
  normalizeWebsiteUrl,
  updateAllowedOrigins,
  type IndexedPage,
  type Website,
} from "@/lib/websites-api";
import { User } from "@/types/type";
import Image from "next/image";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="size-4" />
      </span>
      <span className="font-semibold tracking-tight">Ohara</span>
    </div>
  );
}

function getInitials(name: string) {
  if (!name) return "O";

  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "O"
  );
}

function ProfileAvatar({ user, className }: { user: User; className?: string }) {
  const initials = getInitials(user.name);

  if (user.profile_picture) {
    return (
      <Image
        src={user.profile_picture}
        width={36}
        height={36}
        alt={user.name || "User profile"}
        className={`rounded-full object-cover ${className ?? "size-9"}`}
      />
    );
  }

  return (
    <div
      className={`grid place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary ${
        className ?? "size-9"
      }`}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label =
    status === "success" ? "Ready" : status === "failed" ? "Failed" : "Indexing";
  const styles =
    status === "success"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : status === "failed"
      ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
      : "border-amber-400/20 bg-amber-400/10 text-amber-300";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs ${styles}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function ScriptBlock({ id, onCopy }: { id: string; onCopy: () => void }) {
  const parts = [
    "<script",
    `src=\"${typeof window !== "undefined" ? window.location.origin : ""}/widget.js\"`,
    `data-website-id=\"${id}\"`,
    "defer",
  ];
  const scriptMarkup = parts.join(" ") + ("</scr" + "ipt>");

  return (
    <div className="relative overflow-x-auto rounded-lg border border-border bg-background/70 p-4 pr-12 font-mono text-xs leading-6 text-muted-foreground">
      <code className="block min-w-[260px] break-words whitespace-pre-wrap">{scriptMarkup}</code>
      <button onClick={onCopy} className="absolute right-3 top-3 rounded-md p-2 hover:bg-muted" aria-label="Copy installation script">
        <Clipboard className="size-4" />
      </button>
    </div>
  );
}

export function DashboardPage({ user }: { user: User }) {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selected, setSelected] = useState<Website | null>(null);
  const displayName = user?.name?.trim() || "Your workspace";
  const [pages, setPages] = useState<IndexedPage[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [originInput, setOriginInput] = useState("");
  const [originError, setOriginError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const load = useCallback(async (preferredId?: string) => {
    try {
      setError("");
      const list = await getWebsites();
      setWebsites(list);
      setSelected((current) => {
        if (preferredId) return list.find((s) => s.id === preferredId) ?? current ?? list[0] ?? null;
        return list.find((s) => s.id === current?.id) ?? list[0] ?? null;
      });
      return list;
    } catch (e) {
      setError(getApiErrorMessage(e, "Could not load your website. Check that the API is running."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selected || selected.status === "success" || selected.status === "failed") return;
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [selected, load]);

  useEffect(() => {
    if (!selected) {
      setPages([]);
      setOrigins([]);
      return;
    }

    void (async () => {
      try {
        const allowed = await getAllowedOrigins(selected.id);
        setOrigins(allowed ?? []);
      } catch {
        setOrigins(selected.allowed_origins ?? []);
      }
    })();

    if (selected.status === "success") {
      void getIndexedPages(selected.id).then(setPages).catch(() => setPages([]));
    }
  }, [selected]);

  const copyScript = async () => {
    if (!selected) return;
    const parts = [
      "<script",
      `src=\"${window.location.origin}/widget.js\"`,
      `data-website-id=\"${selected.id}\"`,
      "defer",
    ];
    const script = parts.join(" ") + ("</scr" + "ipt>");
    await navigator.clipboard.writeText(script);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const submitWebsite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const rawUrl = String(data.get("url") ?? "").trim();
    if (!name || !isValidWebsiteUrl(rawUrl)) {
      setFormError("Enter a name and a valid website URL, such as yoursite.com.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const created = await createWebsite({ name, url: normalizeWebsiteUrl(rawUrl) });
      setModalOpen(false);
      event.currentTarget.reset();
      const list = await load();
      const newId = (created as any)?.website_id ?? (created as any)?.id;
      if (list && newId) {
        const found = list.find((w) => w.id === newId);
        if (found) setSelected(found);
      }
    } catch (e) {
      setFormError(getApiErrorMessage(e, "Could not create the website. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const removeWebsite = async () => {
    if (!selected || !window.confirm(`Delete ${selected.name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteWebsite(selected.id);
      setSelected(null);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Could not delete the website."));
    } finally {
      setDeleting(false);
    }
  };

  const addOrigin = async () => {
    setOriginError("");
    const raw = originInput.trim();
    if (!selected) return;
    if (!raw) {
      setOriginError("Enter an origin URL.");
      return;
    }
    if (!isValidWebsiteUrl(raw)) {
      setOriginError("Enter a valid origin, e.g. https://example.com");
      return;
    }
    const normalized = normalizeWebsiteUrl(raw);
    if (origins.includes(normalized)) {
      setOriginError("This origin is already added.");
      return;
    }

    const next = [...origins, normalized];
    try {
      await updateAllowedOrigins(selected.id, next);
      setOrigins(next);
      setOriginInput("");
      setOriginError("");
    } catch (e) {
      setError(getApiErrorMessage(e, "Could not update allowed origins."));
    }
  };

  const removeOrigin = async (origin: string) => {
    if (!selected) return;
    const next = origins.filter((item) => item !== origin);
    try {
      await updateAllowedOrigins(selected.id, next);
      setOrigins(next);
    } catch (e) {
      setError(getApiErrorMessage(e, "Could not update allowed origins."));
    }
  };

  const displayPages = useMemo(() => pages.slice(0, 20), [pages]);

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <aside className="flex w-full shrink-0 flex-col border-b border-border bg-card/25 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-16 items-center justify-between px-5 md:px-6">
          <Logo />
          <button className="rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden" aria-label="Open menu">
            <LayoutDashboard className="size-4" />
          </button>
        </div>
        <nav className="flex gap-1 px-3 pb-3 md:flex-col md:px-3 md:py-5" aria-label="Main navigation">
          <a href="#websites" className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary">
            <Globe2 className="size-4" />
            Websites
          </a>
          <a href="#settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <Settings className="size-4" />
            Settings
          </a>
        </nav>
        <div className="mt-auto hidden border-t border-border p-4 md:block">
          <div className="flex items-center gap-3">
            <ProfileAvatar user={user} className="size-9" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email || "Website owner"}</p>
            </div>
            <button className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Sign out">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex min-h-16 items-center justify-between border-b border-border px-5 sm:px-8">
          <div>
            <p className="text-xs text-muted-foreground">Workspace</p>
            <p className="text-sm font-medium">{displayName}</p>
          </div>
          <ProfileAvatar user={user} className="size-8" />
        </header>
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[.18em] text-primary">Website assistants</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, {displayName.split(" ")[0]}</h1>
              <p className="mt-2 text-sm text-muted-foreground">Manage your website assistant and embedded chat widget.</p>
            </div>
            {websites.length === 0 && (
              <button onClick={() => setModalOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="size-4" />
                Add Website
              </button>
            )}
          </div>

          {error && (
            <div className="mt-6 flex items-center justify-between rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Dismiss error"><X className="size-4" /></button>
            </div>
          )}

          {loading ? (
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Loading your website...</div>
          ) : !selected ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/20 px-6 py-16 text-center">
              <Globe2 className="mx-auto size-10 text-primary/70" />
              <h2 className="mt-4 text-lg font-medium">Create your website assistant</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Connect one website to index its content and give visitors instant, grounded answers.</p>
              <button onClick={() => setModalOpen(true)} className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"><Plus className="size-4" />Add Website</button>
            </div>
          ) : (
            <>
              <article className="mt-8 w-full min-w-0 rounded-xl border border-border bg-card/35 p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-background text-primary"><Globe2 className="size-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="min-w-0 max-w-full break-words text-lg font-medium">{selected.name}</h2>
                        <StatusBadge status={selected.status} />
                      </div>
                      <a href={selected.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-sm text-muted-foreground hover:text-foreground"><span className="break-all">{selected.url}</span><ExternalLink className="size-3 shrink-0" /></a>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => void load()} className="rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label="Refresh website"><RefreshCw className="size-4" /></button>
                    <button onClick={removeWebsite} disabled={deleting} className="rounded-md p-2 text-muted-foreground hover:bg-rose-400/10 hover:text-rose-300" aria-label="Delete website">{deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}</button>
                  </div>
                </div>

                {selected.status !== "success" && selected.status !== "failed" && (
                  <div className="mt-6 flex items-center gap-3 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"><Loader2 className="size-4 animate-spin" /><div className="break-words">Ohara is indexing your website. This can take a few minutes.</div></div>
                )}

                {selected.status === "failed" && (
                  <div className="mt-6 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">We could not finish indexing this website. Check that it is online and does not block crawlers, then delete it and try again.</div>
                )}
              </article>

              {selected.status === "success" && (
                <>
                  <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
                    <div className="w-full min-w-0 rounded-xl border border-border bg-card/35 p-5">
                      <div className="flex items-center justify-between"><div><h2 className="font-medium">Install your widget</h2><p className="mt-1 text-sm text-muted-foreground">Add this snippet before the closing body tag.</p></div><Check className="size-5 text-emerald-400" /></div>
                      <div className="mt-5"><ScriptBlock id={selected.id} onCopy={() => void copyScript()} />{copied && <p className="mt-2 text-xs text-emerald-300">Script copied to clipboard.</p>}</div>
                    </div>
                    <div className="w-full min-w-0 rounded-xl border border-border bg-card/35 p-5">
                      <h2 className="font-medium">Indexed content</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{pages.length} pages are ready for answers.</p>
                      <div className="mt-4 max-h-40 overflow-auto rounded-lg border border-border">{displayPages.length ? displayPages.map((page) => <div key={page.page_url} className="border-b border-border px-3 py-2 text-xs text-muted-foreground last:border-0 break-words">{page.page_url}</div>) : <p className="p-3 text-xs text-muted-foreground">No indexed pages returned.</p>}</div>
                    </div>
                  </section>

                  <section className="mt-6 rounded-xl border border-border bg-card/35 p-5">
                    <div className="flex items-start justify-between gap-4"><div><h2 className="font-medium">Allowed origins</h2><p className="mt-1 text-sm text-muted-foreground">Only these domains can load your widget.</p></div><Settings className="size-5 text-muted-foreground" /></div>
                    <div className="mt-5">
                      <div className="flex gap-2">
                        <input value={originInput} onChange={(event) => { setOriginInput(event.target.value); setOriginError(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void addOrigin(); } }} placeholder="https://yourdomain.com" className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
                        <button onClick={() => void addOrigin()} className="h-10 rounded-lg border border-border px-4 text-sm hover:bg-muted">Add</button>
                      </div>
                      {originError && <p className="mt-2 text-sm text-rose-300">{originError}</p>}
                      <div className="mt-4 flex flex-wrap gap-2">{origins.length ? origins.map((origin) => <span key={origin} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">{origin}<button onClick={() => void removeOrigin(origin)} aria-label={`Remove ${origin}`}><X className="size-3" /></button></span>) : <p className="text-xs text-muted-foreground">No origins configured yet.</p>}</div>
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </main>
      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-5">
          <div role="dialog" aria-modal="true" aria-labelledby="add-website-title" className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between"><div><h2 id="add-website-title" className="text-lg font-semibold">Add your website</h2><p className="mt-1 text-sm text-muted-foreground">Ohara will crawl up to 20 pages from it.</p></div><button onClick={() => setModalOpen(false)} aria-label="Close dialog" className="rounded-md p-2 hover:bg-muted"><X className="size-4" /></button></div>
            <form onSubmit={submitWebsite} className="mt-6 flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-medium">Website name<input name="name" required placeholder="Acme Studio" className="h-10 rounded-lg border border-border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary" /></label><label className="flex flex-col gap-2 text-sm font-medium">Website URL<input name="url" required placeholder="acme.studio" className="h-10 rounded-lg border border-border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary" /></label>{formError && <p className="text-sm text-rose-300">{formError}</p>}<button disabled={submitting} className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60">{submitting && <Loader2 className="size-4 animate-spin" />}{submitting ? "Starting indexing..." : "Create website"}</button></form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
