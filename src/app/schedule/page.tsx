import { permanentRedirect } from "next/navigation";

export default function ScheduleRedirectPage() {
  permanentRedirect("/dashboard/schedule");
}
