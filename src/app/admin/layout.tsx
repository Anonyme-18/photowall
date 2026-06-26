import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminPinGate } from "@/components/dashboard/AdminPinGate";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let authenticated = false;

  try {
    authenticated = isAdminAuthenticated(await cookies());
  } catch {
    authenticated = false;
  }

  if (!authenticated) {
    return <AdminPinGate />;
  }

  return children;
}
