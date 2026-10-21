"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Clipboard,
  ExternalLink,
  Globe2,
  Loader2,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { googleLogout } from "@react-oauth/google";
import {
  createWebsite,
  deleteWebsite,
  getApiErrorMessage,
  getIndexedPages,
  getWebsites,
  getAllowedOrigins,
  isValidContact,
  isValidWebsiteUrl,
  normalizeWebsiteUrl,
  updateAllowedOrigins,
  type IndexedPage,
  type Website,
} from "@/lib/websites-api";
import { deleteCookie } from "@/actions/clientCookies";
import { User } from "@/types/type";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../public/ohara-logo.png";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-8 place-items-center overflow-hidden rounded-full border border-border bg-[#232322] shadow-sm">
        <Image src={logo} alt="Ohara logo" width={32} height={32} className="size-full object-cover" />
      </div>
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

function normalizeWebsiteStatus(status?: string | null) {
  return (status ?? "").trim().toLowerCase();
}

function isPendingWebsite(status?: string | null) {
  const normalized = normalizeWebsiteStatus(status);

  return (
    normalized === "" ||
    normalized === "pending" ||
    normalized === "processing" ||
    normalized === "queued" ||
    normalized === "creating" ||
    normalized === "created" ||
    normalized === "indexing" ||
    normalized === "in_progress" ||
    normalized === "in-progress"
  );
}

function isSuccessWebsiteStatus(status?: string | null) {
  return normalizeWebsiteStatus(status) === "success";
}

function isFailedWebsiteStatus(status?: string | null) {
  return normalizeWebsiteStatus(status) === "failed";
}

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeWebsiteStatus(status);
  const label = isSuccessWebsiteStatus(status) ? "Ready" : isFailedWebsiteStatus(status) ? "Failed" : "Pending";
  const styles =
    isSuccessWebsiteStatus(status)
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : isFailedWebsiteStatus(status)
      ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
      : "border-amber-400/20 bg-amber-400/10 text-amber-300";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs ${styles}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {normalized === "" ? "Pending" : label}
    </span>
  );
}

function ScriptBlock({ id, onCopy }: { id: string; onCopy: () => void }) {
  const scriptMarkup = [
    "<script",
    `src="${typeof window !== "undefined" ? window.location.origin : ""}/widget.js"`,
    `data-website-id="${id}"`,
    "defer></script>",
  ].join(" ");

  return (
    <div className="relative overflow-x-auto rounded-lg border border-border bg-background/70 p-4 pr-12 font-mono text-xs leading-6 text-muted-foreground">
      <code className="block min-w-65 wrap-break-word whitespace-pre-wrap">{scriptMarkup}</code>
      <button onClick={onCopy} className="absolute right-3 top-3 rounded-md p-2 hover:bg-muted" aria-label="Copy installation script">
        <Clipboard className="size-4" />
      </button>
    </div>
  );
}

export function DashboardPage({ user }: { user: User }) {
  const router = useRouter();
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

  const loadRequestIdRef = useRef(0);
  const excludedWebsiteIdsRef = useRef(new Set<string>());
  const selectedIdRef = useRef<string | null>(null);

  const load = useCallback(async (preferredId?: string) => {
    const requestId = ++loadRequestIdRef.current;

    try {
      const serverList = await getWebsites();

      if (requestId !== loadRequestIdRef.current) return;

      const list = serverList.filter((website) => !excludedWebsiteIdsRef.current.has(website.id));

      for (const id of excludedWebsiteIdsRef.current) {
        if (!serverList.some((website) => website.id === id)) {
          excludedWebsiteIdsRef.current.delete(id);
        }
      }

      setError("");
      setWebsites(list);

      setSelected((current) => {
        const nextCandidate =
          (preferredId ? list.find((website) => website.id === preferredId) : undefined) ??
          list.find((website) => website.id === current?.id) ??
          list[0] ??
          null;

        if (!current || !nextCandidate) return nextCandidate;

        if (
          current.id === nextCandidate.id &&
          current.name === nextCandidate.name &&
          current.url === nextCandidate.url &&
          current.status === nextCandidate.status
        ) {
          return current;
        }

        return nextCandidate;
      });
    } catch (e) {
      if (requestId === loadRequestIdRef.current) {
        setError(getApiErrorMessage(e, "We couldn’t load your websites right now. Please refresh or try again in a moment."));
      }
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    selectedIdRef.current = selected?.id ?? null;
  }, [selected?.id]);

  const hasPendingWebsite = useMemo(() => websites.some((website) => isPendingWebsite(website.status)), [websites]);
  const selectedPending = selected ? isPendingWebsite(selected.status) : false;

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!hasPendingWebsite && !selectedPending) return;

    let cancelled = false;
    let timer: number | undefined;
    let attempt = 0;

    const tick = async () => {
      if (cancelled) return;

      if (document.visibilityState === "visible") {
        await load(selectedIdRef.current ?? undefined);
      }

      if (cancelled) return;

      attempt += 1;
      const delay = Math.min(5000 * 1.3 ** attempt, 30000);
      timer = window.setTimeout(tick, delay);
    };

    timer = window.setTimeout(tick, 5000);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [hasPendingWebsite, load, selectedPending]);

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

    if (isSuccessWebsiteStatus(selected.status)) {
      void getIndexedPages(selected.id).then(setPages).catch(() => setPages([]));
    }
  }, [selected]);

  const copyScript = async () => {
    if (!selected) return;
    const script = [
      "<script",
      `src="${window.location.origin}/widget.js"`,
      `data-website-id="${selected.id}"`,
      "defer></script>",
    ].join(" ");
    await navigator.clipboard.writeText(script);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const submitWebsite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const rawUrl = String(data.get("url") ?? "").trim();
    const contact = String(data.get("contact") ?? "").trim();
    if (!name || !isValidWebsiteUrl(rawUrl)) {
      setFormError("Enter a name and a valid website URL, such as yoursite.com.");
      return;
    }
    if (contact && !isValidContact(contact)) {
      setFormError("Enter a valid contact email or phone number, or leave it blank.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const normalizedUrl = normalizeWebsiteUrl(rawUrl);
      const created = await createWebsite({ name, url: normalizedUrl, contact: contact || undefined });
      const newId = (created as any)?.website_id ?? (created as any)?.id;

      if (newId) {
        const optimisticWebsite: Website = {
          id: newId,
          user_id: user.id,
          url: normalizedUrl,
          name,
          contact: contact || null,
          status: "pending",
          allowed_origins: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setWebsites((current) => [optimisticWebsite, ...current.filter((item) => item.id !== newId)]);
        setSelected(optimisticWebsite);
      }

      setModalOpen(false);
      event.currentTarget.reset();
      await load(newId);
    } catch (e) {
      setFormError(getApiErrorMessage(e, "Could not create the website. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const removeWebsite = async () => {
    if (!selected || !window.confirm(`Delete ${selected.name}? This cannot be undone.`)) return;

    const target = selected;

    excludedWebsiteIdsRef.current.add(target.id);
    loadRequestIdRef.current += 1;

    setDeleting(true);
    setSelected(null);
    setWebsites((current) => current.filter((website) => website.id !== target.id));

    let deleted = false;

    try {
      await deleteWebsite(target.id);
      deleted = true;
    } catch (e) {
      excludedWebsiteIdsRef.current.delete(target.id);
      loadRequestIdRef.current += 1;

      setWebsites((current) => [target, ...current.filter((website) => website.id !== target.id)]);
      setSelected(target);
      setError(getApiErrorMessage(e, "Could not delete the website."));
    } finally {
      setDeleting(false);
    }

    if (deleted) {
      await load();
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

  const handleLogout = () => {
    googleLogout();
    deleteCookie("ohara_token");
    deleteCookie("ohara_refresh_token");
    deleteCookie("ohara_user_id");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <aside className="flex w-full shrink-0 flex-col border-b border-border bg-card/25 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-16 items-center justify-between px-5 md:px-6">
          <Logo />
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted md:hidden" aria-label="Sign out">
            <LogOut className="size-3.5" />
            Log out
          </button>
        </div>
        <nav className="flex gap-1 px-3 pb-3 md:flex-col md:px-3 md:py-5" aria-label="Main navigation">
          <a href="#websites" className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary">
            <Globe2 className="size-4" />
            Websites
          </a>
          <a href="#settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <Settings className="size-4" />
            Access control
          </a>
        </nav>
        <div className="mt-auto hidden border-t border-border p-4 md:block">
          <div className="flex items-center gap-3">
            <ProfileAvatar user={user} className="size-9" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email || "Website owner"}</p>
            </div>
            <button onClick={handleLogout} className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Sign out">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex min-h-16 items-center justify-between border-b border-border px-5 sm:px-8">
          <div>
            <p className="text-xs text-muted-foreground">Overview</p>
            <p className="text-sm font-medium">{displayName}</p>
          </div>
          <ProfileAvatar user={user} className="size-8" />
        </header>
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[.18em] text-primary">Overview</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Keep your website answering around the clock</h1>
              <p className="mt-2 text-sm text-muted-foreground">Monitor your assistant, keep it live, and control where your widget is allowed to appear.</p>
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
                        <h2 className="min-w-0 max-w-full wrap-break-word text-lg font-medium">{selected.name}</h2>
                        <StatusBadge status={selected.status} />
                      </div>
                      <div className="flex flex-col gap-2 lg:flex-row lg:justify-between lg:gap-8 lg:items-center w-full"><a href={selected.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-sm text-muted-foreground hover:text-foreground"><span className="break-all">{selected.url}</span><ExternalLink className="size-3 shrink-0" /></a>
                      {selected.contact && (
                        <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="size-3.5 shrink-0 text-primary" />
                          <span>{selected.contact}</span>
                        </p>
                      )}</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => void load()} className="rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label="Refresh website"><RefreshCw className="size-4" /></button>
                    <button onClick={removeWebsite} disabled={deleting} className="rounded-md p-2 text-muted-foreground hover:bg-rose-400/10 hover:text-rose-300" aria-label="Delete website">{deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}</button>
                  </div>
                </div>

                {selectedPending && (
                  <div className="mt-6 flex items-center gap-3 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"><Loader2 className="size-4 animate-spin" /><div className="wrap-break-word">Ohara is preparing your website for AI answers. This usually takes a few minutes, and we’ll update the status automatically.</div></div>
                )}

                {isFailedWebsiteStatus(selected.status) && (
                  <div className="mt-6 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">We could not finish indexing this website. Check that it is online and does not block crawlers, then delete it and try again.</div>
                )}
              </article>

              {isSuccessWebsiteStatus(selected.status) && (
                <>
                  <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
                    <div className="w-full min-w-0 rounded-xl border border-border bg-card/35 p-5">
                      <div className="flex items-center justify-between"><div><h2 className="font-medium">Install your widget</h2><p className="mt-1 text-sm text-muted-foreground">Add this snippet inside the head of your site.</p></div><Check className="size-5 text-emerald-400" /></div>
                      <div className="mt-5"><ScriptBlock id={selected.id} onCopy={() => void copyScript()} />{copied && <p className="mt-2 text-xs text-emerald-300">Script copied to clipboard.</p>}</div>
                    </div>
                    <div className="w-full min-w-0 rounded-xl border border-border bg-card/35 p-5">
                      <h2 className="font-medium">Indexed content</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{pages.length} pages are ready for answers.</p>
                      <div className="mt-4 max-h-40 overflow-auto rounded-lg border border-border">{displayPages.length ? displayPages.map((page) => <div key={page.page_url} className="border-b border-border px-3 py-2 text-xs text-muted-foreground last:border-0 wrap-break-word">{page.page_url}</div>) : <p className="p-3 text-xs text-muted-foreground">No indexed pages returned.</p>}</div>
                    </div>
                  </section>

                  <section id="settings" className="mt-6 scroll-mt-24 rounded-xl border border-border bg-card/35 p-5">
                    <div className="flex items-start justify-between gap-4"><div><h2 className="font-medium">Widget access</h2><p className="mt-1 text-sm text-muted-foreground">Control which websites are allowed to load your assistant.</p></div><Settings className="size-5 text-muted-foreground" /></div>
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

          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card/35 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Need help?</p>
              <p className="text-sm text-muted-foreground">Questions, issues, or a quick check-in?</p>
            </div>
            <a href="mailto:amadijerry823@gmail.com" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
              <Mail className="size-4 text-primary" />
              Contact us
            </a>
          </div>
        </div>
      </main>
      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-5">
          <div role="dialog" aria-modal="true" aria-labelledby="add-website-title" className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between"><div><h2 id="add-website-title" className="text-lg font-semibold">Add your website</h2><p className="mt-1 text-sm text-muted-foreground">Ohara will crawl up to 20 pages from it.</p></div><button onClick={() => setModalOpen(false)} aria-label="Close dialog" className="rounded-md p-2 hover:bg-muted"><X className="size-4" /></button></div>
            <form onSubmit={submitWebsite} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium">Website name<input name="name" required placeholder="Acme Studio" className="h-10 rounded-lg border border-border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary" /></label>
              <label className="flex flex-col gap-2 text-sm font-medium">Website URL<input name="url" required placeholder="acme.studio" className="h-10 rounded-lg border border-border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary" /></label>
              <label className="flex flex-col gap-2 text-sm font-medium">Contact email or phone<span className="text-xs font-normal text-muted-foreground">use the address or number you want visitors to reach.</span><input name="contact" placeholder="hello@acme.com or +1 (555) 123-4567" className="h-10 rounded-lg border border-border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary" required /></label>
              {formError && <p className="text-sm text-rose-300">{formError}</p>}
              <button disabled={submitting} className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60">{submitting && <Loader2 className="size-4 animate-spin" />}{submitting ? "Starting indexing..." : "Create website"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
