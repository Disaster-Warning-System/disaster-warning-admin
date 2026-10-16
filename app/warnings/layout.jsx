import AdminAuthGate from "@/src/components/admin/AdminAuthGate";
import { ROLES } from "@/src/lib/roles";

export default function WarningsLayout({ children }) {
  return <AdminAuthGate roles={[ROLES.DMC_OFFICER]}>{children}</AdminAuthGate>;
}
