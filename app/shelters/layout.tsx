import type { ReactNode } from "react";
import ShelterSyncNotice from "@/src/components/shelters/ShelterSyncNotice";
import ShelterAuthGate from "@/src/components/shelters/ShelterAuthGate";

export default function ShelterLayout({ children }: { children: ReactNode }) {
  return (
    <ShelterAuthGate>
      <ShelterSyncNotice />
      {children}
    </ShelterAuthGate>
  );
}
