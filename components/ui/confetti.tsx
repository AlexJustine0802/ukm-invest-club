"use client";

import type { ReactNode } from "react";
import React, {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

type ConfettiOrigin = {
  x?: number;
  y?: number;
};

export type ConfettiOptions = {
  particleCount?: number;
  spread?: number;
  origin?: ConfettiOrigin;
  colors?: string[];
};

export type ConfettiRef = {
  fire: (options?: ConfettiOptions) => Promise<void> | void;
};

type Props = React.ComponentPropsWithRef<"canvas"> & {
  options?: ConfettiOptions;
  manualstart?: boolean;
  children?: ReactNode;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
};

const ConfettiContext = createContext<ConfettiRef | null>(null);

const DEFAULT_COLORS = [
  "#0f766e",
  "#2563eb",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#22c55e",
];

const ConfettiComponent = forwardRef<ConfettiRef, Props>((props, ref) => {
  const { options, manualstart = false, children, className, ...rest } = props;
  const canvasNodeRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasNodeRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasNodeRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const ratio = window.devicePixelRatio || 1;
    context.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current = particlesRef.current
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.16,
        rotation: particle.rotation + particle.spin,
        life: particle.life + 1,
      }))
      .filter((particle) => particle.life < particle.maxLife);

    for (const particle of particlesRef.current) {
      const alpha = 1 - particle.life / particle.maxLife;
      context.save();
      context.globalAlpha = Math.max(0, alpha);
      context.translate(particle.x * ratio, particle.y * ratio);
      context.rotate(particle.rotation);
      context.fillStyle = particle.color;
      context.fillRect(
        (-particle.size * ratio) / 2,
        (-particle.size * ratio) / 2,
        particle.size * ratio,
        particle.size * ratio * 0.6,
      );
      context.restore();
    }

    if (particlesRef.current.length > 0) {
      frameRef.current = window.requestAnimationFrame(draw);
    } else {
      frameRef.current = null;
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const fire = useCallback(
    (opts: ConfettiOptions = {}) => {
      const canvas = canvasNodeRef.current;
      if (!canvas) return;

      resizeCanvas();

      const merged = { ...optionsRef.current, ...opts };
      const rect = canvas.getBoundingClientRect();
      const count = merged.particleCount ?? 80;
      const spread = ((merged.spread ?? 70) * Math.PI) / 180;
      const originX = (merged.origin?.x ?? 0.5) * rect.width;
      const originY = (merged.origin?.y ?? 0.5) * rect.height;
      const colors = merged.colors?.length ? merged.colors : DEFAULT_COLORS;

      const nextParticles = Array.from({ length: count }, () => {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
        const speed = 4 + Math.random() * 7;

        return {
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.3,
          size: 6 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: 80 + Math.random() * 35,
        };
      });

      particlesRef.current = [...particlesRef.current, ...nextParticles];

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(draw);
      }
    },
    [draw, resizeCanvas],
  );

  const api = useMemo<ConfettiRef>(() => ({ fire }), [fire]);

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [resizeCanvas]);

  useEffect(() => {
    if (!manualstart) fire();
  }, [manualstart, fire]);

  return (
    <ConfettiContext.Provider value={api}>
      <canvas ref={canvasNodeRef} className={className} {...rest} />
      {children}
    </ConfettiContext.Provider>
  );
});

ConfettiComponent.displayName = "Confetti";

export const Confetti = ConfettiComponent;
