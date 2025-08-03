import ClassInstanceForm from "./ClassInstanceForm";
import { dbOperations } from "@/lib/database";

export default function NewClassInstancePage() {
  const classes = dbOperations.getAllClasses();
  return <ClassInstanceForm classes={classes} />;
}
