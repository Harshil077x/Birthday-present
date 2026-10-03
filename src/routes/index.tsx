import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Music, Music2, Sparkles as SparkIcon } from "lucide-react";
import { Balloons, Sparkles } from "@/components/birthday/balloons";
import { ConfettiCanvas, burst, sideBursts } from "@/components/birthday/confetti";
import memory from "@/assets/memory.jpg";

// ✏️ Edit these to personalise the surprise
const NAME = "Thomaii";
const MESSAGE = `Happy Birthday to the most extraordinary person in my life. As we mark another year, I find myself reflecting on all the moments, big and small, that have shaped our journey together. You possess a unique way of turning the ordinary into something truly magical, and I am constantly in awe of your strength, your kindness, and the way you approach the world. Thank you for being the partner who inspires me to grow and the safe harbor where I always feel at home. Today is more than just a celebration of your birth; it is a celebration of the immense light you bring into every room you enter. May this next chapter be filled with the same joy and wonder you give so freely to others. You deserve all the beauty life has to offer, and I am honored to be by your side to experience it all with you. Here is to celebrating you today and to the many more beautiful years we have ahead of us. Happy Birthday, my love.`;
const MUSIC_SRC = "/assets/music.mp3"; // replace public/assets/music.mp3 with your song

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `A secret for ${NAME} 🎂` },
      { name: "description", content: "Tap to reveal a little birthday surprise." },
      { property: "og:title", content: `A secret for ${NAME} 🎂` },
      { property: "og:description", content: "Tap to reveal a little birthday surprise." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const BG = ["--bg-intro", "--bg-special", "--bg-special", "--bg-rose", "--bg-amber", "--bg-gold"];
// stage: 0 intro · 1 special · 2 special day · 3 smile · 4 birthday · 5 letter
function bgFor(stage: number) { return stage === 1 ? "night" : stage === 2 ? "--bg-special" : stage === 3 ? "--bg-amber" : stage === 4 ? "--bg-gold" : "--bg-intro"; }

function Index() {
  const [stage, setStage] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const busy = useRef(false);

  const startMusic = () => {
    if (!audio.current) { audio.current = new Audio(MUSIC_SRC); audio.current.loop = true; }
    audio.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const toggleMusic = () => {
    if (!audio.current || audio.current.paused) startMusic();
    else { audio.current.pause(); setPlaying(false); }
  };

  const go = (next: number) => {
    if (busy.current) return;
    busy.current = true;
    setLeaving(true);
    setTimeout(() => {
      setStage(next); setLeaving(false); busy.current = false;
    }, 600);
  };

  const reveal = () => { if (stage !== 0) return; startMusic(); go(1); };

  useEffect(() => {
    if (stage === 1) { const t = setTimeout(() => sideBursts(false), 250); return () => clearTimeout(t); }
    if (stage === 4) {
      const t1 = setTimeout(() => sideBursts(true), 500);
      const iv = setInterval(() => {
        const w = window.innerWidth;
        burst(Math.random() * w, Math.random() * window.innerHeight * 0.35, { count: 22, speed: 5, life: 70, gravity: 0.08 });
      }, 900);
      return () => { clearTimeout(t1); clearInterval(iv); };
    }
    if (stage === 5) { const t = setTimeout(() => sideBursts(false), 300); return () => clearTimeout(t); }
    return undefined;
  }, [stage]);

  const anim = leaving ? "cine-out" : "cine-in";
  const tapNext = stage >= 1 && stage <= 4 ? () => go(stage + 1) : undefined;
  const bg = bgFor(stage);

  return (
    <main className="relative min-h-screen w-full select-none overflow-hidden" onClick={tapNext}>
      {/* Background layers crossfade */}
      {["--bg-intro", "--bg-special", "--bg-amber", "--bg-gold"].map((v) => (
        <div key={v} className="bg-layer" style={{ background: `var(${v})`, opacity: bg === v && stage !== 5 ? 1 : 0 }} />
      ))}
      <div className="bg-layer bg-night" style={{ opacity: bg === "night" ? 1 : 0 }} />
      <div className="bg-layer bg-paper" style={{ opacity: stage === 5 ? 1 : 0 }} />

      {stage !== 5 && <Sparkles />}
      <Balloons interactive={stage === 0} dim={stage > 0 && stage < 5} onPop={reveal} />
      <ConfettiCanvas className="z-[5]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        {stage === 0 && (
          <div key="s0" className={`flex flex-col items-center text-center ${anim}`}>
            <Cake />
            <p className="mt-5 font-display text-2xl text-foreground text-glow sm:text-3xl">Tap to reveal the secret</p>
            <button onClick={(e) => { e.stopPropagation(); reveal(); }} className="btn-cta relative z-40 mt-6 flex items-center gap-2 rounded-full px-10 py-3.5 text-sm font-semibold sm:px-14">
              <SparkIcon className="h-4 w-4" /> Click to reveal
            </button>
            <p className="pulse-soft mt-5 text-xs text-muted-foreground">or pop a balloon 🎈</p>
          </div>
        )}

        {stage === 1 && (
          <Scene k="s1" anim={anim} hint="Tap to continue">
            <h1 className="font-display text-5xl text-foreground text-glow sm:text-7xl">You are special ✨</h1>
          </Scene>
        )}
        {stage === 2 && (
          <Scene k="s2" anim={anim} hint="Tap to continue">
            <h1 className="font-body text-4xl font-light italic text-foreground/85 text-glow sm:text-6xl">It's a special day</h1>
          </Scene>
        )}
        {stage === 3 && (
          <Scene k="s3" anim={anim} hint="Tap to continue">
            <h1 className="font-display text-4xl text-foreground/90 text-glow sm:text-6xl">Get ready to smile 😊</h1>
          </Scene>
        )}
        {stage === 4 && (
          <div key="s4" className={`relative flex flex-col items-center text-center ${anim}`}>
            <div className="halo pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20" />
            <div className="float-y mb-6 flex h-14 w-14 items-center justify-center rounded-full btn-cta text-2xl">🎁</div>
            <h1 className="font-display text-6xl leading-[1.05] text-glow-gold sm:text-8xl">
              <span className="cine-in block">Happy</span>
              <span className="cine-in delay-1 block">birthday</span>
              <span className="cine-in delay-2 block">to you</span>
            </h1>
            <p className="cine-in delay-3 mt-8 font-mono text-xs tracking-widest text-gold/70">Tap anywhere to continue</p>
          </div>
        )}
        {stage === 5 && <Letter anim={anim} />}
      </div>

      {stage === 5 && (
        <button onClick={toggleMusic} aria-label="Toggle music" className="fixed right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-card text-accent shadow-lg transition hover:scale-110 active:scale-95">
          {playing ? <Music2 className="h-5 w-5 animate-pulse" /> : <Music className="h-5 w-5 opacity-50" />}
        </button>
      )}
    </main>
  );
}

function Scene({ k, anim, hint, children }: { k: string; anim: string; hint: string; children: React.ReactNode }) {
  return (
    <div key={k} className={`flex cursor-pointer flex-col items-center text-center ${anim}`}>
      {children}
      <p className="pulse-soft mt-6 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Cake() {
  return (
    <div className="float-y relative flex flex-col items-center">
      <div className="flame h-4 w-2.5 rounded-full bg-gold shadow-[0_0_16px_6px_var(--gold)]" />
      <div className="h-5 w-1.5 rounded-sm bg-accent" />
      <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-[var(--gold)] shadow-[0_0_40px_var(--gold)] sm:h-20 sm:w-28">
        <div className="absolute inset-x-0 top-0 h-4 bg-paper" style={{ borderRadius: "0 0 40% 40% / 0 0 100% 100%" }} />
        <div className="absolute inset-x-0 top-9 h-1.5 bg-accent/60 sm:top-11" />
      </div>
    </div>
  );
}

function Letter({ anim }: { anim: string }) {
  return (
    <div key="s5" className={`w-full max-w-xl ${anim}`} onClick={(e) => e.stopPropagation()}>
      <div className="overflow-hidden rounded-2xl bg-card text-card-foreground shadow-2xl">
        <div className="bg-muted p-4 pb-0">
          <img src={memory} alt="A birthday memory" width={1024} height={768} className="float-y mx-auto aspect-[4/3] w-4/5 rotate-[-1.5deg] rounded-sm border-[10px] border-b-[28px] border-card object-cover shadow-xl" />
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">🎁 Birthday surprise</p>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Happy Birthday, {NAME}!</h1>
          <div className="mt-5 rounded-xl border p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">💌 Birthday Message</p>
            <div className="max-h-56 overflow-y-auto pr-2 font-display text-[15px] leading-relaxed text-ink/80">{MESSAGE}</div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Turn the music on with the button in the corner 🎵</p>
        </div>
      </div>
    </div>
  );
}
