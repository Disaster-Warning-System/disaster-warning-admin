import AdminAuthGate from "@/src/components/admin/AdminAuthGate";
import { ROLES } from "@/src/lib/roles";

export default function HazardReportsLayout({ children }) {
  return <AdminAuthGate roles={[ROLES.DMC_OFFICER]}>{children}</AdminAuthGate>;
}
