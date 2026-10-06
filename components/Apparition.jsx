"use client";
import { useEffect, useRef, useState } from "react";

// Fait apparaître doucement son contenu quand il entre dans l'écran.
// L'état est conservé par React : un nouveau rendu ne fait jamais redisparaître le contenu.
export default function Apparition({ children, className = "", delai = 0, as: Balise = "div" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setVisible(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Balise ref={ref} className={`apparait ${visible ? "visible" : ""} ${className}`} style={{ transitionDelay: visible ? "0ms" : `${delai}ms` }}>
      {children}
    </Balise>
  );
}
