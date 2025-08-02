import type { NextApiRequest, NextApiResponse } from "next";
import { query, run } from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query as { slug: string };

  if (req.method === "GET") {
    const coach = query(`SELECT * FROM coaches WHERE slug = ? LIMIT 1`, [slug])[0];
    if (!coach) return res.status(404).json({ message: "Not found" });
    return res.status(200).json(coach);
  }

  if (req.method === "PUT") {
    const { name, role, bio, image, certifications, fight_record } = req.body;
    run(
      `UPDATE coaches SET name = ?, role = ?, bio = ?, image = ?, certifications = ?, fight_record = ? WHERE slug = ?`,
      [name, role, bio, image, certifications, fight_record, slug]
    );
    return res.status(200).json({ message: "Coach updated" });
  }

  if (req.method === "DELETE") {
    run(`DELETE FROM coaches WHERE slug = ?`, [slug]);
    return res.status(200).json({ message: "Coach deleted" });
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).end("Method Not Allowed");
}
