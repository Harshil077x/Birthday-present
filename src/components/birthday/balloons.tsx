import { useEffect, useRef, useState } from "react";
import { burst } from "./confetti";

const COLORS = ["oklch(0.6 0.22 15)", "oklch(0.72 0.16 55)", "oklch(0.75 0.2 145)", "oklch(0.75 0.13 210)", "oklch(0.55 0.25 300)", "oklch(0.82 0.15 90)", "oklch(0.62 0.24 0)"];

type B = { id: number; x: number; size: number; color: string; dur: number; sway: number; popping?: boolean };

export function Balloons({ interactive, dim, onPop }: { interactive: boolean; dim: boolean; onPop?: () => void }) {
  const [list, setList] = useState<B[]>([]);
  const id = useRef(0);

  useEffect(() => {
    const spawn = () => {
      const w = window.innerWidth;
      const size = (w < 640 ? 26 : 34) + Math.random() * (w < 640 ? 16 : 22);
      setList((l) => [...l, {
        id: id.current++, x: Math.random() * 94 + 1, size, color: COLORS[(Math.random() * COLORS.length) | 0]!,
        dur: 9 + Math.random() * 8, sway: 2 + Math.random() * 2.5,
      }].slice(-24));
    };
    for (let i = 0; i < 3; i++) setTimeout(spawn, i * 400);
    const t = setInterval(spawn, 1100);
    return () => clearInterval(t);
  }, []);

  const remove = (bid: number) => setList((l) => l.filter((b) => b.id !== bid));

  const pop = (b: B, e: React.MouseEvent) => {
    if (!interactive || b.popping) return;
    const r = (e.currentTarget as HTMLElement).querySelector(".balloon-body")!.getBoundingClientRect();
    setList((l) => l.map((x) => (x.id === b.id ? { ...x, popping: true } : x)));
    setTimeout(() => burst(r.left + r.width / 2, r.top + r.height / 2, { count: 45, speed: 7, life: 60 }), 120);
    setTimeout(() => remove(b.id), 300);
    onPop?.();
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden transition-opacity duration-1000"
      style={{ opacity: dim ? 0.35 : 1, pointerEvents: "none", zIndex: interactive ? 30 : 1 }}
    >
      {list.map((b) => (
        <div
          key={b.id}
          className={`balloon ${b.popping ? "popping" : ""}`}
          style={{ left: `${b.x}%`, ["--dur" as string]: `${b.dur}s`, pointerEvents: interactive ? "auto" : "none", cursor: interactive ? "pointer" : "default" }}
          onAnimationEnd={(e) => e.animationName === "balloon-rise" && remove(b.id)}
          onClick={(e) => pop(b, e)}
        >
          <div className="balloon-inner" style={{ ["--sway" as string]: `${b.sway}s` }}>
            <div className="balloon-body" style={{ width: b.size, height: b.size * 1.18, ["--c" as string]: b.color }} />
            <div className="balloon-string" style={{ height: b.size * 1.6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Sparkles({ count = 28 }: { count?: number }) {
  const [items, setItems] = useState<{ l: number; t: number; s: number; d: number; dl: number }[]>([]);
  useEffect(() => {
    setItems(Array.from({ length: count }, () => ({ l: Math.random() * 100, t: Math.random() * 100, s: 1 + Math.random() * 2.5, d: 3 + Math.random() * 4, dl: Math.random() * 6 })));
  }, [count]);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {items.map((p, i) => (
        <span key={i} className="sparkle" style={{ left: `${p.l}%`, top: `${p.t}%`, width: p.s, height: p.s, ["--d" as string]: `${p.d}s`, ["--delay" as string]: `${p.dl}s` }} />
      ))}
    </div>
  );
}
