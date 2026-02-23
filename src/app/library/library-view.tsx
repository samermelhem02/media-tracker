"use client";

import { useState, useEffect } from "react";
import type { MediaItem } from "@/lib/db-types";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { GlassCard } from "@/components/ui/glass-card";
import { AddMediaForm } from "@/app/dashboard/add-media-form";
import { EditMediaForm } from "@/app/dashboard/edit-media-form";
import { MediaList } from "@/app/dashboard/media-list";
import { DashboardFilters } from "@/app/dashboard/dashboard-filters";

type LibraryViewProps = {
  initialItems: MediaItem[];
  initialQ?: string;
  initialStatus?: string;
  initialMediaType?: string;
};

export function LibraryView({
  initialItems,
  initialQ,
  initialStatus,
  initialMediaType,
}: LibraryViewProps) {
  const [items, setItems] = useState(initialItems);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);

  // Sync with server after router.refresh() (e.g. after delete)
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  return (
    <>
      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add media"
      >
        <AddMediaForm
          onSuccess={(newItem) => {
            if (newItem) {
              setItems((prev) => [newItem, ...prev]);
              setIsAddOpen(false);
              toast.success("Media added");
            }
          }}
        />
      </Modal>

      <Modal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title={editItem ? `Edit: ${editItem.title}` : "Edit media"}
      >
        {editItem ? (
          <EditMediaForm
            item={editItem}
            onDone={() => setEditItem(null)}
            onSuccess={(updatedItem) => {
              if (updatedItem) {
                setItems((prev) =>
                  prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
                );
                setEditItem(null);
                toast.success("Media updated");
              }
            }}
          />
        ) : null}
      </Modal>

      <GlassCard className="mb-6 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Library</h2>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-transform duration-200 hover:scale-105 hover:bg-white/20"
          >
            + Add Media
          </button>
        </div>
        <DashboardFilters
          action="/library"
          initialQ={initialQ}
          initialStatus={initialStatus}
          initialMediaType={initialMediaType}
        />
      </GlassCard>
      <GlassCard className="p-6">
        <MediaList
          items={items}
          groupByType={!initialQ && !initialStatus && !initialMediaType}
          onEditItem={setEditItem}
          onDeleted={(id) => {
            setItems((prev) => prev.filter((i) => i.id !== id));
            toast.success("Media deleted");
          }}
        />
      </GlassCard>
    </>
  );
}
