import type { ReactNode } from "react";
import ShelterSyncNotice from "@/src/components/shelters/ShelterSyncNotice";

export default function ShelterLayout({ children }: { children: ReactNode }) {
  return <><ShelterSyncNotice />{children}</>;
}
