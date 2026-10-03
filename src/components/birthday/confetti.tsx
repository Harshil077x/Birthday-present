import { useEffect, useRef } from "react";

type P = {
  x: number; y: number; vx: number; vy: number; size: number; rot: number; vr: number;
  life: number; max: number; color: string; shape: 0 | 1 | 2; g: number;
};

const COLORS = ["#ffd166", "#ff6b6b", "#f72585", "#4cc9f0", "#80ffdb", "#c77dff", "#ffffff", "#ff9f1c"];
const particles: P[] = [];

function rand(a: number, b: number) { return a + Math.random() * (b - a); }

/** Burst particles at (x,y). angle (rad) + spread define direction cone. */
export function burst(x: number, y: number, opts: { count?: number; angle?: number; spread?: number; speed?: number; gravity?: number; life?: number } = {}) {
  const { count = 40, angle = -Math.PI / 2, spread = Math.PI * 2, speed = 8, gravity = 0.18, life = 70 } = opts;
  for (let i = 0; i < count; i++) {
    const a = angle + rand(-spread / 2, spread / 2);
    const s = rand(speed * 0.35, speed);
    const max = rand(life * 0.6, life * 1.3);
    particles.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, size: rand(3, 8), rot: rand(0, 6.28), vr: rand(-0.3, 0.3),
      life: max, max, color: COLORS[(Math.random() * COLORS.length) | 0]!, shape: (Math.random() * 3) as unknown as 0, g: gravity * rand(0.6, 1.3),
    });
    particles[particles.length - 1]!.shape = Math.floor(Math.random() * 3) as 0 | 1 | 2;
  }
}

export function sideBursts(big = false) {
  const w = window.innerWidth, h = window.innerHeight;
  const count = big ? 160 : 70;
  const speed = big ? Math.max(14, w / 70) : Math.max(9, w / 110);
  burst(0, h * 0.75, { count, angle: -Math.PI / 4, spread: 0.9, speed, life: big ? 110 : 85 });
  burst(w, h * 0.75, { count, angle: (-3 * Math.PI) / 4, spread: 0.9, speed, life: big ? 110 : 85 });
  if (big) {
    burst(0, h * 0.25, { count: 90, angle: 0.15, spread: 0.9, speed, life: 100 });
    burst(w, h * 0.25, { count: 90, angle: Math.PI - 0.15, spread: 0.9, speed, life: 100 });
    burst(w / 2, -10, { count: 100, angle: Math.PI / 2, spread: 1.6, speed: speed * 0.6, life: 120, gravity: 0.1 });
  }
}

export function ConfettiCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const resize = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      c.width = window.innerWidth * d; c.height = window.innerHeight * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const loop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.vx *= 0.975; p.vy = p.vy * 0.975 + p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(1, (p.life / p.max) * 1.6);
        ctx.fillStyle = p.color;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        if (p.shape === 0) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, 6.28); ctx.fill(); }
        else if (p.shape === 1) { ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
        else {
          ctx.shadowColor = p.color; ctx.shadowBlur = 8;
          ctx.beginPath();
          for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 2; ctx.lineTo(Math.cos(a) * p.size, Math.sin(a) * p.size); ctx.lineTo(Math.cos(a + 0.785) * p.size * 0.3, Math.sin(a + 0.785) * p.size * 0.3); }
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className={`pointer-events-none fixed inset-0 h-full w-full ${className}`} />;
}
