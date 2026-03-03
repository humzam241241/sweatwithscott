"use client";

import { useEffect } from "react";
import type {
  ClassRecord,
  CoachRecord,
  MediaRecord,
  MembershipPackageRecord,
} from "@/lib/types";

interface Props {
  settings: Record<string, any>;
  classes: ClassRecord[];
  coaches: CoachRecord[];
  media: MediaRecord[];
  packages: MembershipPackageRecord[];
}

export default function DebugLogger({
  settings,
  classes,
  coaches,
  media,
  packages,
}: Props) {
  useEffect(() => {
    console.log("Settings:", settings);
    console.log("Classes:", classes);
    console.log("Coaches:", coaches);
    console.log("Media:", media);
    console.log("Packages:", packages);
  }, [settings, classes, coaches, media, packages]);

  return null;
}

