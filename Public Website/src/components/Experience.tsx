import Lenis from "lenis";
import { MotionConfig, motion, useReducedMotion, useSpring } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";

function supportsFinePointer() {
  return window.matchMedia("(pointer: fine)").matches;
}

export function Experience({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [cursor, setCursor] = useState({ x: -100, y: -100, active: false, pressed: false });
  const cursorX = useSpring(cursor.x, { stiffness: 620, damping: 42, mass: 0.35 });
  const cursorY = useSpring(cursor.y, { stiffness: 620, damping: 42, mass: 0.35 });

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
    });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reducedMotion]);

  useEffect(() => {
    const reveal = () => {
      const items = document.querySelectorAll<HTMLElement>(
        ".section, .page-hero > *, .course-hero > *, .final-cta > *, .course-card",
      );
      items.forEach((item, index) => {
        if (!item.dataset.reveal) {
          item.dataset.reveal = "true";
          item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 55}ms`);
        }
      });
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
      );
      items.forEach((item) => observer.observe(item));
      return observer;
    };

    let observer = reveal();
    const mutations = new MutationObserver(() => {
      observer.disconnect();
      observer = reveal();
    });
    mutations.observe(document.getElementById("root")!, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!supportsFinePointer() || reducedMotion) return;
    const move = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      setCursor({
        x: event.clientX,
        y: event.clientY,
        active: Boolean(target.closest("button, a, summary, input, select, textarea")),
        pressed: event.buttons > 0,
      });
    };
    const leave = () => setCursor((value) => ({ ...value, x: -100, y: -100 }));
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [reducedMotion]);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
      {children}
      {!reducedMotion && (
        <motion.div
          className="premium-cursor"
          aria-hidden="true"
          style={{ x: cursorX, y: cursorY }}
          animate={{
            scale: cursor.pressed ? 0.7 : cursor.active ? 1.65 : 1,
            opacity: cursor.x < 0 ? 0 : 1,
          }}
        />
      )}
    </MotionConfig>
  );
}

export function Magnetic({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  return (
    <motion.button
      className={className}
      onClick={onClick}
      animate={offset}
      onPointerMove={(event) => {
        if (reducedMotion || !supportsFinePointer()) return;
        const rect = event.currentTarget.getBoundingClientRect();
        setOffset({
          x: (event.clientX - rect.left - rect.width / 2) * 0.18,
          y: (event.clientY - rect.top - rect.height / 2) * 0.18,
        });
      }}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}
