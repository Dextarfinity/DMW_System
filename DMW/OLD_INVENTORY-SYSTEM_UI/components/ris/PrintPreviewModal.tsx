
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function PrintPreviewModal({
  open,
  onClose,
  risId,
}: {
  open: boolean;
  onClose: () => void;
  risId: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Print Preview – RIS</DialogTitle>
        </DialogHeader>

        <iframe
          src={`/transactions/ris/${risId}/print`}
          className="w-full h-full border"
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => {
              const iframe = document.querySelector('iframe');
              if (iframe && iframe.contentWindow) {
                  iframe.contentWindow.print();
              }
          }}>
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
