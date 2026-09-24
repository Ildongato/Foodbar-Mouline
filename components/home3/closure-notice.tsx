'use client';
import { useState, useSyncExternalStore } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import {
  closureDemoEnabled,
  getClosureNotice,
  brusselsDate,
} from '@/lib/closures';

const subscribeToDate = (changed: () => void) => {
  const timer = window.setInterval(changed, 60000);
  return () => window.clearInterval(timer);
};
const dateSnapshot = () => brusselsDate(new Date());
const serverDateSnapshot = () => '';

export default function ClosureAnnouncement() {
  const date = useSyncExternalStore(
    subscribeToDate,
    dateSnapshot,
    serverDateSnapshot,
  );
  const [dismissedDate, setDismissedDate] = useState('');
  const notice = date
    ? getClosureNotice(new Date(`${date}T12:00:00Z`), closureDemoEnabled)
    : null;
  if (!notice) return null;
  return (
    <Dialog.Root
      open={dismissedDate !== date}
      onOpenChange={(open) => {
        if (!open) setDismissedDate(date);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="closure-backdrop" />
        <Dialog.Popup className="closure-popup">
          <Dialog.Close className="closure-close" aria-label="Melding sluiten">
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </Dialog.Close>
          <Dialog.Title>{notice.title}</Dialog.Title>
          <Dialog.Description>{notice.message}</Dialog.Description>
          <p className="closure-detail">{notice.detail}</p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
