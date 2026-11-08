import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Sprout, 
  RefreshCw, 
  Building2, 
  Layers, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemo: () => void;
  onOpenSplash?: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onResetDemo,
  onOpenSplash,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1D2922]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#E2E8DF] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8DF] bg-gradient-to-r from-[#EAF1E7] via-white to-[#EAF1E7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showTagline={false} />
            <div>
              <h3 className="font-heading font-bold text-lg text-[#183E2E]">
                Gather AI — Master PRD & Demo Guide
              </h3>
              <p className="text-xs text-[#68766D]">National-level AI Hackathon Architecture & 5-Hour Build Specification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#68766D] hover:text-[#183E2E] rounded-lg hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#1D2922]">
          {/* Mission statement */}
          <div className="bg-[#183E2E] text-white p-5 rounded-2xl space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#D7E8A3]">
              Core Purpose
            </span>
            <h4 className="font-heading font-extrabold text-base text-white">
              Connect better agricultural decisions with practical organic-waste recovery.
            </h4>
            <p className="text-[#F8F8F2]/90 leading-relaxed text-xs">
              "Help people grow and handle food more intelligently, then help suitable organic material return to productive use instead of becoming waste."
            </p>
          </div>

          {/* The 5-Scene Hackathon Demonstration Walkthrough */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-[#183E2E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#245C43]" />
              <span>The 5-Scene Hackathon Demonstration Flow</span>
            </h4>

            <div className="space-y-2.5">
              {/* Scene 1 */}
              <div className="bg-[#FAFAF7] border border-[#E2E8DF] p-3.5 rounded-xl">
                <div className="font-bold text-[#183E2E] mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#245C43] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Scene 1: Crop Decision (Harvest Intelligence)</span>
                </div>
                <p className="text-[#68766D] pl-7 leading-relaxed">
                  Grower registers crop (e.g. Arka Rakshak Tomatoes in Nashik or HD-2967 Wheat in Karnal). System calculates stage progress, estimated harvest window, critical observations, and freshness risks.
                </p>
              </div>

              {/* Scene 2 */}
              <div className="bg-[#FAFAF7] border border-[#E2E8DF] p-3.5 rounded-xl">
                <div className="font-bold text-[#183E2E] mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#245C43] text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Scene 2: The Surplus Problem & Seamless Handoff</span>
                </div>
                <p className="text-[#68766D] pl-7 leading-relaxed">
                  During peak harvest glut, 35 crates (~875 kg) remain unsold. The grower clicks "Find a Recovery Option", pre-filling material details, location, and storage into Food Waste Recovery.
                </p>
              </div>

              {/* Scene 3 */}
              <div className="bg-[#FAFAF7] border border-[#E2E8DF] p-3.5 rounded-xl">
                <div className="font-bold text-[#183E2E] mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#245C43] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Scene 3: The Recovery Decision (Deterministic Matching)</span>
                </div>
                <p className="text-[#68766D] pl-7 leading-relaxed">
                  Gather AI evaluates biological compatibility, volume thresholds, and regional perimeter. Ranks GreenRoots Bio-Compost Hub as top match with transparent reasons and zero fabricated scores.
                </p>
              </div>

              {/* Scene 4 */}
              <div className="bg-[#FAFAF7] border border-[#E2E8DF] p-3.5 rounded-xl">
                <div className="font-bold text-[#183E2E] mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#245C43] text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Scene 4: The Next Action (Collection Coordination)</span>
                </div>
                <p className="text-[#68766D] pl-7 leading-relaxed">
                  Generates an editable formal request draft. User reviews, copies to clipboard, opens email/WhatsApp, and steps through verified lifecycle states.
                </p>
              </div>

              {/* Scene 5 */}
              <div className="bg-[#FAFAF7] border border-[#E2E8DF] p-3.5 rounded-xl">
                <div className="font-bold text-[#183E2E] mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#245C43] text-white flex items-center justify-center text-[10px]">5</span>
                  <span>Scene 5: The Outcome (Honest Impact Ledger)</span>
                </div>
                <p className="text-[#68766D] pl-7 leading-relaxed">
                  Impact Dashboard strictly separates registered, matched, accepted, and weighbridge-confirmed quantities (2,000 kg wheat straw confirmed collected).
                </p>
              </div>
            </div>
          </div>

          {/* GroqCloud Live AI Engine Architecture */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-[#183E2E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#245C43]" />
              <span>Live AI Architecture (GroqCloud openai/gpt-oss-20b)</span>
            </h4>

            <div className="bg-[#FAFAF7] border border-[#85B96F]/40 p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-[#E2E8DF]">
                <span className="font-semibold text-[#183E2E]">API Provider: <strong className="text-[#245C43]">GroqCloud</strong></span>
                <span className="font-mono bg-[#D7E8A3] text-[#183E2E] px-2 py-0.5 rounded font-medium">openai/gpt-oss-20b</span>
              </div>
              <ul className="space-y-1.5 text-[#68766D] text-[11px]">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8059] shrink-0 mt-0.5" />
                  <span><strong>Server-Side Security:</strong> API key is stored exclusively in server environment variable <code className="text-[#183E2E] bg-white px-1 py-0.5 rounded border border-[#E2E8DF]">GROQ_API_KEY</code>, never bundled or sent to the client.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8059] shrink-0 mt-0.5" />
                  <span><strong>Feature 1 (Harvest Intelligence):</strong> Provides grounded agronomic stage assessments, actionable field steps, and harvest windows with mandatory extension service advisory disclaimers.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8059] shrink-0 mt-0.5" />
                  <span><strong>Feature 2 (Recovery Intelligence):</strong> Explains partner intake stream fit, volume boundaries, and logistics, drafting formal collection requests while deterministic matching remains the strict source of truth.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8DF] bg-[#FAFAF7] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onResetDemo();
                onClose();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#183E2E] bg-white border border-[#E2E8DF] hover:bg-[#EAF1E7] rounded-xl transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#245C43]" />
              <span>Reload 5-Scene Demo Data</span>
            </button>

            {onOpenSplash && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSplash();
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#245C43] bg-[#EAF1E7] border border-[#85B96F]/40 hover:bg-[#D7E8A3]/50 rounded-xl transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Replay Splash Screen</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#245C43] hover:bg-[#183E2E] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            Got it, Let's Explore
          </button>
        </div>
      </div>
    </div>
  );
};
