import type { NextApiRequest, NextApiResponse } from "next";
import { query, run } from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const classes = query(
      `SELECT c.*, co.name as coach_name, co.slug as coach_slug FROM classes c LEFT JOIN coaches co ON c.coach_id = co.id`
    );
    return res.status(200).json(classes);
  }

  if (req.method === "POST") {
    const { slug, name, description, image, coach_id, schedule } = req.body;
    run(
      `INSERT INTO classes (slug, name, description, image, coach_id, schedule) VALUES (?, ?, ?, ?, ?, ?)` ,
      [slug, name, description, image, coach_id, typeof schedule === "string" ? schedule : JSON.stringify(schedule)]
    );
    return res.status(201).json({ message: "Class created" });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
