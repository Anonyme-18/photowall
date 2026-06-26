"use client";

import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function AdminPage() {
  const router = useRouter();
  return <DashboardLayout onGoToWall={() => router.push("/")} />;
}
