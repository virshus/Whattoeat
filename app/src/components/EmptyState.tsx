import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'compact' | 'inCard';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const isCompact = variant === 'compact';
  const isInCard = variant === 'inCard';

  const containerClasses = [
    'flex flex-col items-center text-center',
    isCompact ? 'py-6 px-4' : 'py-8 px-6',
    isInCard ? 'bg-surface radius-card shadow-card' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconWrapperClasses = [
    'rounded-full flex items-center justify-center mb-3',
    isCompact ? 'w-12 h-12' : 'w-14 h-14',
    isInCard ? 'bg-canvas text-ink-soft' : 'bg-surface text-primary shadow-card',
  ].join(' ');

  return (
    <div role="status" className={containerClasses}>
      <div className={iconWrapperClasses}>
        <Icon size={isCompact ? 22 : 28} strokeWidth={2} aria-hidden="true" />
      </div>
      <h3 className={`section-title mb-2 ${isCompact ? 'text-body' : ''}`}>
        {title}
      </h3>
      {description && (
        <p className={`text-ink-soft max-w-sm text-small`}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          aria-label={actionLabel}
          className="mt-5 min-h-[48px] px-6 py-3 bg-primary text-white radius-pill font-semibold text-small active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
