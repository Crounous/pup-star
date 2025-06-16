import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ResearchDeletionPopupProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function ResearchDeletionPopup({
  open,
  onConfirm,
  onCancel,
  isDeleting = false
}: ResearchDeletionPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md bg-[#ffd600] border-2 border-[#850d0d] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-[#850d0d] font-bold text-lg">
            Delete Research
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-[#850d0d]">
            Are you sure you want to delete this research? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-4">
          <Button
            onClick={onCancel}
            className="bg-transparent text-[#850d0d] hover:bg-[#850d0d]/10"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-[#850d0d] text-[#ffd600] hover:bg-[#6b0a0a]"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
