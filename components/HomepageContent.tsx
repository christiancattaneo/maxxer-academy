"use client";

import { useEffect } from "react";
import NavBar from "./NavBar";

export default function HomepageContent({ bodyHtml }: { bodyHtml: string }) {
  useEffect(() => {
    // Reveal on scroll (same as original)
    const ro = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) en.target.classList.add("in");
        });
      },
      { threshold: 0.05 }
    );
    document.querySelectorAll(".reveal").forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <NavBar />
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
