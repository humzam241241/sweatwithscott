"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "classes", label: "Classes" },
  { id: "coaches", label: "Coaches" },
  { id: "schedule", label: "Schedule" },
  { id: "membership", label: "Membership" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export default function SideNav() {
  const [active, setActive] = useState("classes");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <nav className="fixed left-0 top-0 h-screen w-48 bg-black text-white flex flex-col z-50">
      <div className="p-4 font-bold text-red-600">The Cave</div>
      <ul className="flex-1 space-y-2 px-2">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`block px-3 py-2 rounded hover:text-red-500 ${active === s.id ? "text-red-500 font-bold" : "text-gray-300"}`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

