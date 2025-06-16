import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DialogTitle } from '@radix-ui/react-dialog';

interface ResearchDeletionPopupProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResearchDeletionPopup({ open, onConfirm, onCancel }: ResearchDeletionPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
        <DialogTitle    className="sr-only">
            Delete Research Confirmation
        </DialogTitle>
      <DialogContent className="bg-[#850d0d] rounded-2xl shadow-2xl flex flex-col items-center p-10 w-[400px]">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#ffd600] mb-2 leading-tight">
            Are you sure<br />you want to delete<br />this study?
          </h2>
        </div>
        <Button
          className="bg-[#ffd600] text-[#850d0d] font-bold text-xl px-10 py-2 rounded-lg mb-3 hover:bg-[#ffe066] transition-colors w-32"
          onClick={onConfirm}
        >
          Yes
        </Button>
        <button
          className="text-[#ffd600] text-lg hover:underline"
          onClick={onCancel}
        >
          Cancel
        </button>
      </DialogContent>
    </Dialog>
  );
}
