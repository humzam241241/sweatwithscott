import type { NextApiRequest, NextApiResponse } from "next";
import { query, run } from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query as { slug: string };

  if (req.method === "GET") {
    const cls = query(
      `SELECT c.*, co.name as coach_name, co.slug as coach_slug FROM classes c LEFT JOIN coaches co ON c.coach_id = co.id WHERE c.slug = ? LIMIT 1`,
      [slug]
    )[0];
    if (!cls) return res.status(404).json({ message: "Not found" });
    return res.status(200).json(cls);
  }

  if (req.method === "PUT") {
    const { name, description, image, coach_id, schedule } = req.body;
    run(
      `UPDATE classes SET name = ?, description = ?, image = ?, coach_id = ?, schedule = ? WHERE slug = ?`,
      [name, description, image, coach_id, typeof schedule === "string" ? schedule : JSON.stringify(schedule), slug]
    );
    return res.status(200).json({ message: "Class updated" });
  }

  if (req.method === "DELETE") {
    run(`DELETE FROM classes WHERE slug = ?`, [slug]);
    return res.status(200).json({ message: "Class deleted" });
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).end("Method Not Allowed");
}
