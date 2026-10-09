import { redirect } from "next/navigation";

// Pending is the queue's default tab
export default function PendingReportsPage() {
  redirect("/hazard-reports");
}
