"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface DataContextType {
  classes: any[];
  coaches: any[];
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  classes: [],
  coaches: [],
  loading: true,
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [classesRes, coachesRes] = await Promise.all([
          fetch("/api/classes").then((r) => r.json()),
          fetch("/api/coaches").then((r) => r.json())
        ]);
        setClasses(Array.isArray(classesRes) ? classesRes : []);
        setCoaches(Array.isArray(coachesRes) ? coachesRes : []);
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ classes, coaches, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
