"use client";

import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClassList() {
  const { data: classes, error, isLoading } = useSWR("/api/classes", fetcher, {
    refreshInterval: 5000, // refresh every 5 seconds
  });

  if (error) return <p>Failed to load classes</p>;
  if (isLoading) return <p>Loading classes...</p>;

  if (!classes || classes.length === 0) {
    return <p>No classes available.</p>;
  }

  return (
    <div className="card-grid mb-6">
      {classes.map((cls: any) => (
        <Link key={cls.slug} href={`/classes/${cls.slug}`} className="card">
          <img
            src={cls.image || "/images/gym-training.png"}
            alt={cls.name}
            className="object-cover w-full h-48"
          />
          <div className="card-overlay">
            <h3>{cls.name}</h3>
            <p>{cls.description}</p>
            <span className="card-link">Learn More</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
