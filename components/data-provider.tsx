"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";

interface DataContextType {
  classes: any[] | null;
  coaches: any[] | null;
  schedule: any[] | null;
  refreshData: () => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(
  undefined
);

export const DataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [classes, setClasses] = useState<any[] | null>(null);
  const [coaches, setCoaches] = useState<any[] | null>(null);
  const [schedule, setSchedule] = useState<any[] | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [classesRes, coachesRes, scheduleRes] = await Promise.all([
        fetch("/api/classes").then((res) => res.ok ? res.json() : []),
        fetch("/api/coaches").then((res) => res.ok ? res.json() : []),
        // Schedule endpoint may not exist yet
        fetch("/api/schedule")
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => []),
      ]);

      setClasses(Array.isArray(classesRes) ? classesRes : []);
      setCoaches(Array.isArray(coachesRes) ? coachesRes : []);
      setSchedule(Array.isArray(scheduleRes) ? scheduleRes : []);
    } catch (err) {
      console.error("Error fetching global data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataContext.Provider value={{ classes, coaches, schedule, refreshData: fetchData }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;

