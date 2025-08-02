import type { NextApiRequest, NextApiResponse } from "next";
import { query, run } from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const coaches = query(`SELECT * FROM coaches`);
    return res.status(200).json(coaches);
  }

  if (req.method === "POST") {
    const { slug, name, role, bio, image, certifications, fight_record } = req.body;
    run(
      `INSERT INTO coaches (slug, name, role, bio, image, certifications, fight_record) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [slug, name, role, bio, image, certifications, fight_record]
    );
    return res.status(201).json({ message: "Coach created" });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
