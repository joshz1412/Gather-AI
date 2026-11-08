import React from 'react';
import { Info, Sparkles, ShieldCheck } from 'lucide-react';

interface DemoNoticeProps {
  onLearnMore?: () => void;
}

export const DemoNotice: React.FC<DemoNoticeProps> = ({ onLearnMore }) => {
  return (
    <div className="bg-[#EAF1E7] border border-[#85B96F]/40 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#183E2E]">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-full bg-[#245C43] text-white flex items-center justify-center shrink-0">
          <Info className="w-3.5 h-3.5" />
        </div>
        <p className="leading-relaxed">
          <strong className="font-semibold text-[#183E2E]">Hackathon Demo Mode:</strong> Powered by transparent agronomic datasets and simulated regional recovery facilities. Partner confirmations & environmental outcomes are strictly distinguished from draft estimates.
        </p>
      </div>

      {onLearnMore && (
        <button
          onClick={onLearnMore}
          className="self-end sm:self-auto shrink-0 font-semibold text-[#245C43] hover:underline flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>PRD Principles</span>
        </button>
      )}
    </div>
  );
};
