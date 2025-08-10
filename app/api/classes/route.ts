import { NextResponse } from "next/server";
import { dbOperations } from "@/lib/database";

export async function GET() {
  try {
<<<<<<< HEAD
    const classes = query<ClassRecord>(
      "SELECT id, name, description, image, slug FROM classes ORDER BY name ASC",
    );
    return NextResponse.json(classes);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching classes:", error.message);
    } else {
      console.error("Error fetching classes:", String(error));
    }
=======
    const classes = dbOperations.getAllClasses();
    return NextResponse.json(Array.isArray(classes) ? classes : []);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    console.error("Error fetching classes:", error);
>>>>>>> e8cc3e6 (cursor 1)
    return NextResponse.json([], { status: 500 });
  }
}
