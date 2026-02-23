"use client";

import { Modal } from "@/components/ui/modal";
import type { MediaItem } from "@/lib/db-types";
import { EditMediaForm } from "./edit-media-form";

export function EditMediaModal({
  item,
  open,
  onClose,
  onSuccess,
}: {
  item: MediaItem;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? `Edit: ${item.title}` : "Edit media"}
    >
      <EditMediaForm item={item} onDone={onClose} />
    </Modal>
  );
}
