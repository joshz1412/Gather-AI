import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="bg-white border border-[#E2E8DF] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xs">
      <div className="w-14 h-14 rounded-2xl bg-[#EAF1E7] text-[#245C43] flex items-center justify-center mx-auto mb-4 border border-[#85B96F]/30">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-heading font-bold text-[#183E2E] mb-2">{title}</h3>
      <p className="text-sm text-[#68766D] leading-relaxed mb-6">{description}</p>
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2.5 bg-[#245C43] hover:bg-[#183E2E] text-white text-sm font-semibold rounded-xl transition-all shadow-xs"
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2.5 bg-[#F8F8F2] hover:bg-[#EAF1E7] text-[#183E2E] border border-[#E2E8DF] text-sm font-medium rounded-xl transition-colors"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
