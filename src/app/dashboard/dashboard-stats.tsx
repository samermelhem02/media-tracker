"use client";

import { StatCard } from "@/components/dashboard/stat-card";

export function DashboardStats({
  totalItems,
  completedItems,
  averageRating,
}: {
  totalItems: number;
  completedItems: number;
  averageRating: number;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <StatCard label="Total items" value={totalItems} delay={0} />
      <StatCard label="Completed" value={completedItems} delay={0.05} />
      <StatCard
        label="Average rating"
        value={averageRating}
        delay={0.1}
        decimals={1}
      />
    </div>
  );
}
