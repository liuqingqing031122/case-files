import { useEffect, useRef } from 'react';
import { useModal } from './useModal';
import './EvidenceCard.css';
import './ConfirmDialog.css';

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** A small paper confirmation. The safe choice (cancel) has focus by default. */
export default function ConfirmDialog({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  const dialogRef = useModal<HTMLDivElement>(onCancel);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="evidence-backdrop" onClick={onCancel}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-text"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="confirm-dialog-title">
          {title}
        </h2>
        <p id="confirm-dialog-text" className="confirm-dialog-text">
          {message}
        </p>
        <div className="confirm-dialog-actions">
          <button ref={cancelRef} className="btn btn-ghost-ink" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
