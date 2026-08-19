import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
}

/** Shared modal shell: centers a panel over a backdrop, closes on Escape or
 * a backdrop click, and renders via a portal so it isn't clipped by any
 * parent's overflow/scroll container. */
export function Modal({ title, onClose, children, widthClassName = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050a14]/75 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`w-full ${widthClassName} max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#182541] shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-slate-100">
            {title}
          </h2>
          <IconButton aria-label="Close dialog" onClick={onClose}>
            <X className="h-[18px] w-[18px]" />
          </IconButton>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
