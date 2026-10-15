"use client";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Globe2,
  Layers3,
  LockKeyhole,
  MessageCircle,
  MousePointer2,
  Search,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import Image from "next/image";
import logo from "../public/ohara-logo.png";
import { GoogleLogin, googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/data/websites";
import { storeCookie } from "@/actions/handleCookies";
import { setCookie } from "@/actions/clientCookies";

const benefits = [
  {
    icon: Globe2,
    title: "Train on your website",
    text: "Crawl and index your website content automatically.",
  },
  {
    icon: MessageCircle,
    title: "Instant answers",
    text: "Visitors get accurate responses based on your website’s information.",
  },
  {
    icon: WandSparkles,
    title: "Easy integration",
    text: "Add a single script tag and the chatbot appears on your site.",
  },
];

const features = [
  {
    icon: Globe2,
    title: "Website crawling",
    text: "Keep your assistant in sync with every important page.",
  },
  {
    icon: Sparkles,
    title: "AI-powered answers",
    text: "Helpful responses that sound like your brand, not a robot.",
  },
  {
    icon: Search,
    title: "Fast vector retrieval",
    text: "Find the right context quickly, even on large websites.",
  },
  {
    icon: LockKeyhole,
    title: "Domain protection",
    text: "Control exactly where your widget can be embedded.",
  },
  {
    icon: Layers3,
    title: "Website-specific knowledge",
    text: "Answers grounded in your content and nowhere else.",
  },
  {
    icon: MousePointer2,
    title: "Customizable widget",
    text: "Match the appearance and tone of your website.",
  },
];

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.75 9.75 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.53 13.83a5.86 5.86 0 0 1 0-3.66V7.64H3.28a9.75 9.75 0 0 0 0 8.72l3.25-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.14c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.1 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.72 5.39l3.25 2.53C7.3 7.86 9.46 6.14 12 6.14Z"
      />
    </svg>
  );
}

function Logo() {
  return (
    <a
      href="#top"
      className="flex items-center gap-2 font-semibold tracking-tight"
      aria-label="Ohara home"
    >
      <span className="grid size-10 md:size-12  place-items-center rounded-lg text-primary-foreground">
        <Image alt={"Ohara-logo"} className="rounded-full" src={logo} />
      </span>
      Ohara
    </a>
  );
}

function ChatMockup() {
  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-2xl border border-white/10 bg-[#11141b] p-2 shadow-[0_0_0_1px_rgba(255,255,255,.03),0_32px_100px_rgba(28,38,80,.35)] sm:p-3">
      <div className="rounded-xl border border-white/10 bg-[#f7f8fb] text-slate-900 overflow-hidden">
        <div className="flex h-10 items-center gap-2 border-b border-slate-200 bg-white px-4">
          <span className="size-2 rounded-full bg-slate-300" />
          <span className="size-2 rounded-full bg-slate-300" />
          <span className="size-2 rounded-full bg-slate-300" />
          <div className="mx-auto rounded-md bg-slate-100 px-20 py-1 text-[9px] text-slate-400 sm:px-32">
            loop.studio
          </div>
        </div>
        <div className="grid min-h-[350px] grid-cols-1 bg-white md:grid-cols-[1fr_270px]">
          <div className="relative p-6 sm:p-10">
            <div className="mb-10 flex items-center justify-between text-xs font-semibold">
              <span>
                LOOP<span className="text-indigo-500">/</span>STUDIO
              </span>
              <div className="hidden gap-5 text-[10px] font-normal text-slate-400 sm:flex">
                <span>Services</span>
                <span>About</span>
                <span>Contact</span>
              </div>
            </div>
            <div className="max-w-sm">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[.2em] text-indigo-500">
                Digital products, thoughtfully made
              </p>
              <h3 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                We build better ways to work.
              </h3>
              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
                Strategy, design, and technology for teams doing important work.
              </p>
              <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white">
                Explore our services <ArrowRight className="size-3" />
              </div>
            </div>
            <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between text-[10px] text-slate-400 sm:left-10 sm:right-10">
              <span>Selected work 2026</span>
              <span>Scroll to explore ↓</span>
            </div>
          </div>
          <div className="flex flex-col border-t border-slate-200 bg-white md:border-l md:border-t-0">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
              <span className="grid size-8 md:size-10  place-items-center rounded-lg text-primary-foreground">
                <Image alt={"Ohara-logo"} className="rounded-full" src={logo} />
              </span>
              <div>
                <p className="text-xs font-semibold">Ask Ohara</p>
                <p className="text-[9px] text-slate-400">
                  Usually replies instantly
                </p>
              </div>
              <span className="ml-auto size-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4 text-[11px]">
              <div className="self-end rounded-xl rounded-tr-sm bg-slate-100 px-3 py-2 text-slate-600">
                What services do you offer?
              </div>
              <div className="rounded-xl rounded-tl-sm bg-indigo-50 px-3 py-2 leading-5 text-slate-600">
                We provide website development, mobile app development, and AI
                solutions.
              </div>
              <div className="self-end rounded-xl rounded-tr-sm bg-slate-100 px-3 py-2 text-slate-600">
                How can I contact support?
              </div>
              <div className="rounded-xl rounded-tl-sm bg-indigo-50 px-3 py-2 leading-5 text-slate-600">
                You can reach support through our contact page or support email.
              </div>
            </div>
            <div className="m-3 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-[10px] text-slate-400">
              <span>Ask a question...</span>
              <ArrowRight className="size-3 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-4 -right-3 hidden rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-[10px] text-indigo-200 shadow-xl sm:flex sm:items-center sm:gap-2">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        Live on loop.studio
      </div>
    </div>
  );
}

export function LandingPage() {
  const router = useRouter()
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );

        const signinRes = await axios.post(`${BASE_URL}/users/auth/google`, {
          name: res.data.name,
          email: res.data.email,
          profile_picture: res.data.picture,
        });

        const auth = signinRes.data?.token ?? signinRes.data
        const successStatus = signinRes.status >= 200 && signinRes.status < 300

        if (!successStatus || !auth?.access_token || !auth?.refresh_token) {
          throw new Error("Google sign-in failed")
        }

        setCookie("ohara_token", auth.access_token, {maxAge: 3600, path: "/"})
        setCookie("ohara_user_id", signinRes.data.user.id, {maxAge: 3600, path: "/"})
        setCookie("ohara_refresh_token", auth.refresh_token, {maxAge: 60 * 60 * 24 * 7, path: "/"})

        router.push("/dashboard")
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    },
    onError: ({ error }) => console.log("error after login", error),
  });

  const handleFailure = () => {
    console.log("Login Failed");
  };

  const handleLogout = () => {
    googleLogout(); // Triggers SDK cleanup
    // setUser(null);
  };
  return (
    <main id="top" className="overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 -z-0 h-[620px] bg-[radial-gradient(ellipse_at_top,rgba(94,92,230,.15),transparent_65%)]" />
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a
            href="#features"
            className="transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-foreground"
          >
            How it works
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => login()}
            size="sm"
            className="rounded-full  p-4"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </Button>
        </div>
      </nav>
      <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 pb-20 pt-20 text-center sm:px-8 sm:pt-28">
        <h1 className="max-w-3xl text-balance text-primary text-5xl font-semibold leading-[1.04] tracking-[-.05em] sm:text-7xl">
          Answers your customers can actually use.
          {/* <span className="text-primary">AI support assistant.</span> */}
        </h1>
        <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
          Add an intelligent chatbot to your website in minutes. Ohara learns
          from your site’s content and helps visitors find answers instantly.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            onClick={() => login()}
            size="sm"
            className="rounded-full  p-4"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-11 rounded-full px-6"
          >
            <a href="#how-it-works" className="flex gap-2 items-center">
              <span>See how it works</span>{" "}
              <ChevronRight data-icon="inline-end" />
            </a>
          </Button>
        </div>
      </section>
      <section className="relative z-10 px-5 pb-24 sm:px-8">
        <ChatMockup />
      </section>
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-6xl gap-0 px-5 sm:grid-cols-3 sm:px-8">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex gap-4 border-b border-border/60 py-8 last:border-0 sm:border-b-0 sm:border-r sm:px-8 sm:first:pl-0 sm:last:border-r-0"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-medium capitalize">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section
        id="how-it-works"
        className="mx-auto max-w-6xl px-5 py-24 sm:px-8"
      >
        <div className="max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-primary">
            How it works
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            From URL to useful answers in a few minutes.
          </h2>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-4">
          {[
            "Add your website URL",
            "Ohara crawls and indexes your content",
            "Embed the chat widget",
            "Visitors get answers instantly",
          ].map((step, i) => (
            <div
              key={step}
              className="relative rounded-xl border border-border bg-card p-5"
            >
              <span className="text-xs font-medium text-primary">0{i + 1}</span>
              <p className="mt-12 text-sm font-medium leading-6">{step}</p>
              {i < 3 && (
                <ChevronRight className="absolute -right-3 top-1/2 z-10 hidden size-5 -translate-y-1/2 text-muted-foreground md:block" />
              )}
            </div>
          ))}
        </div>
      </section>
      <section id="features" className="border-t border-border/60 bg-card/20">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-primary">
                Built for helpfulness
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything your website needs
                <br className="hidden sm:block" /> to answer with confidence.
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              A focused knowledge layer that turns your existing content into a
              better visitor experience.
            </p>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="bg-background p-6 transition-colors hover:bg-card"
              >
                <Icon className="size-5 text-primary" />
                <h3 className="mt-10 text-sm font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 px-6 py-16 text-center sm:px-12">
          <div className="absolute left-1/2 top-0 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Add AI-powered support
              <br className="sm:hidden" /> to your website.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Create your assistant, embed the widget, and help visitors find
              answers faster.
            </p>
            <Button
              onClick={() => login()}
              size="sm"
              className="rounded-full mt-4  p-4"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </Button>
          </div>
        </div>
      </section>
      <footer id="login" className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Logo />
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground">
              Documentation
            </a>
            <a href="https://github.com" className="hover:text-foreground">
              GitHub
            </a>
          </div>
          <span>© 2026 Ohara</span>
        </div>
      </footer>
    </main>
  );
}
