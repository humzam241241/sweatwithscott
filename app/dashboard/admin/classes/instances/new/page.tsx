import { dbOperations } from "@/lib/database";
import ClassInstanceForm from "./ClassInstanceForm";

export default function Page() {
  const classes = dbOperations.getAllClasses();
  return <ClassInstanceForm classes={classes} />;
}
