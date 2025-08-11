"use client";

import { useEffect } from "react";
import ScheduleClient from "../ScheduleClient";

export default function ScheduleEmbedClient() {
  useEffect(() => {
    const nav = document.querySelector(".cave-navbar") as HTMLElement | null;
    if (nav) nav.style.display = "none";
    const main = document.querySelector("main") as HTMLElement | null;
    if (main) main.style.paddingTop = "0px";
    return () => {
      if (nav) nav.style.display = "";
    };
  }, []);
  return (
    <div className="p-0 m-0">
      <ScheduleClient />
    </div>
  );
}


