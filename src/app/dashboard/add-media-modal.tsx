"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { AddMediaForm } from "./add-media-form";

export function AddMediaModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-transform duration-200 hover:scale-105 hover:bg-white/20"
      >
        + Add Media
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add media"
      >
        <AddMediaForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
