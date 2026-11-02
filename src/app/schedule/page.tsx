import { permanentRedirect } from "next/navigation";

export default function ScheduleRedirectPage() {
  permanentRedirect("/classes");
}
