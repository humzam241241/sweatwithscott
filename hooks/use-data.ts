"use client";

import { useContext } from "react";
import { DataContext } from "@/components/data-provider";

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

export default useData;

