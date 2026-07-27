import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, subtitle, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`bg-canvas w-full max-w-2xl mx-auto radius-card rounded-b-none overflow-hidden flex flex-col relative z-10 max-h-[85vh] transition-transform duration-300 ease-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} style={{ borderRadius: 'var(--radius-card) var(--radius-card) 0 0' }}>
        <div className="page-x py-3 flex items-center justify-between border-b border-border bg-white">
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="text-small text-ink-soft">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-ink-soft hover:bg-surface hover:text-ink transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 page-x py-3 bg-canvas pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
