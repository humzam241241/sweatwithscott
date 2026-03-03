import ScheduleClient from "./ScheduleClient";

export const dynamic = "force-dynamic";
export const revalidate = false;

export default function AdminSchedulePage() {
  return <ScheduleClient />;
}

