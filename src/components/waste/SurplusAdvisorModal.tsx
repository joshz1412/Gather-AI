import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Info, 
  Layers, 
  Building2,
  ShieldCheck
} from 'lucide-react';
import { WasteRecord, WasteMaterialCategory, WasteCondition } from '../../types';
import { fetchSurplusRecommendation, SurplusRecommendationOutput } from '../../services/aiService';

interface SurplusAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToRegister: (prefill: {
    materialType: string;
    materialCategory: WasteMaterialCategory;
    quantity: number;
    unit: WasteRecord['unit'];
    condition: WasteCondition;
    pickupLocation: string;
    notes?: string;
  }) => void;
}

export const SurplusAdvisorModal: React.FC<SurplusAdvisorModalProps> = ({
  isOpen,
  onClose,
  onProceedToRegister,
}) => {
  const [materialType, setMaterialType] = useState('Fruit and vegetable market waste');
  const [quantity, setQuantity] = useState<number>(35);
  const [unit, setUnit] = useState<WasteRecord['unit']>('kg');
  const [condition, setCondition] = useState('Soft / Rapidly perishing');
  const [edibleOrWaste, setEdibleOrWaste] = useState('Inedible organic discard (sorting losses)');
  const [pickupLocation, setPickupLocation] = useState('Nashik APMC Mandi, Maharashtra');
  const [timeBeforeDeterioration, setTimeBeforeDeterioration] = useState('24-48 hours');
  const [userObjective, setUserObjective] = useState('Prevent landfill dumping and find regional composting');

  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<SurplusRecommendationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPresets = [
    {
      title: '35 kg Fruit & Veg Waste',
      material: 'Fruit & vegetable sorting waste',
      qty: 35,
      unit: 'kg' as WasteRecord['unit'],
      cond: 'Soft / Rapidly perishing',
      edible: 'Inedible organic discard',
      window: '24-36 hours',
    },
    {
      title: '280 kg Fresh Tomato Gluts',
      material: 'Tomato harvest surplus (Grade B)',
      qty: 280,
      unit: 'kg' as WasteRecord['unit'],
      cond: 'Fresh surplus (edible quality)',
      edible: 'Edible surplus (redistribution viable)',
      window: '48-72 hours',
    },
    {
      title: '400 kg Onion Peels & Culls',
      material: 'Onion peels & rotting culls',
      qty: 400,
      unit: 'kg' as WasteRecord['unit'],
      cond: 'Decomposing / High moisture',
      edible: 'Inedible organic discard',
      window: '24 hours',
    },
  ];

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchSurplusRecommendation({
        materialType,
        quantity,
        unit,
        condition,
        edibleOrWaste,
        timeBeforeDeterioration,
        pickupLocation,
        userObjective,
        availableRoutes: [
          'Aerobic Windrow Composting',
          'Biomethanation / Bio-CNG',
          'Vermicomposting',
          'Black Soldier Fly Larvae',
          'Edible Surplus Redistribution',
        ],
      });

      setRecommendation(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to evaluate surplus recovery options.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseRecommendation = () => {
    // Map to application category
    let category: WasteMaterialCategory = 'Fruit & Vegetable Scraps';
    if (edibleOrWaste.toLowerCase().includes('edible')) {
      category = 'Unsold Fresh Produce';
    } else if (materialType.toLowerCase().includes('stalk') || materialType.toLowerCase().includes('straw')) {
      category = 'Crop Residues & Stalks';
    }

    let mappedCond: WasteCondition = 'Soft / Rapidly perishing';
    if (condition.toLowerCase().includes('fresh') || condition.toLowerCase().includes('edible')) {
      mappedCond = 'Fresh surplus (edible quality)';
    } else if (condition.toLowerCase().includes('decomposing')) {
      mappedCond = 'Decomposing / High moisture';
    } else if (condition.toLowerCase().includes('grade b') || condition.toLowerCase().includes('bruised')) {
      mappedCond = 'Grade B / Bruised but sound';
    }

    onProceedToRegister({
      materialType,
      materialCategory: category,
      quantity,
      unit,
      condition: mappedCond,
      pickupLocation,
      notes: recommendation ? `AI Recommended Route: ${recommendation.recommended_route}. Reasoning: ${recommendation.reasoning}` : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1D2922]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E2E8DF] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8DF] bg-gradient-to-r from-[#183E2E] to-[#245C43] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-[#D7E8A3] flex items-center justify-center font-bold border border-white/20">
              <RefreshCw className="w-5 h-5 text-[#D7E8A3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-white">AI Surplus & Waste Route Advisor</h3>
                <span className="text-[10px] font-semibold bg-[#85B96F]/30 text-[#D7E8A3] border border-[#85B96F]/40 px-2 py-0.5 rounded-full">
                  Groq Brain
                </span>
              </div>
              <p className="text-xs text-[#F8F8F2]/80 mt-0.5">
                Determine the most practical, compliant circular destination for surplus produce and discards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#68766D] block">
              Quick Test Scenarios:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMaterialType(p.material);
                    setQuantity(p.qty);
                    setUnit(p.unit);
                    setCondition(p.cond);
                    setEdibleOrWaste(p.edible);
                    setTimeBeforeDeterioration(p.window);
                  }}
                  className="text-xs bg-[#F8F8F2] hover:bg-[#EAF1E7] text-[#183E2E] border border-[#E2E8DF] hover:border-[#85B96F] px-3 py-1.5 rounded-xl transition-all font-medium"
                >
                  ⚡ {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8F8F2] p-4 rounded-2xl border border-[#E2E8DF]">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#183E2E] block mb-1">
                Material / Surplus Type
              </label>
              <input
                type="text"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                placeholder="e.g. 35 kg of fruit and vegetable waste"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8DF] rounded-xl focus:border-[#245C43] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#183E2E] block mb-1">
                Quantity & Unit
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={1}
                  className="w-2/3 px-3 py-2 text-xs bg-white border border-[#E2E8DF] rounded-xl focus:border-[#245C43] focus:outline-none"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as WasteRecord['unit'])}
                  className="w-1/3 px-2 py-2 text-xs bg-white border border-[#E2E8DF] rounded-xl focus:border-[#245C43] focus:outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="crates">crates</option>
                  <option value="quintals">quintals</option>
                  <option value="tonnes">tonnes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#183E2E] block mb-1">
                Perishability Window
              </label>
              <input
                type="text"
                value={timeBeforeDeterioration}
                onChange={(e) => setTimeBeforeDeterioration(e.target.value)}
                placeholder="e.g. 24-48 hours"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8DF] rounded-xl focus:border-[#245C43] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#183E2E] block mb-1">
                Physical Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8DF] rounded-xl focus:border-[#245C43] focus:outline-none"
              >
                <option value="Fresh surplus (edible quality)">Fresh surplus (edible quality)</option>
                <option value="Grade B / Bruised but sound">Grade B / Bruised but sound</option>
                <option value="Soft / Rapidly perishing">Soft / Rapidly perishing</option>
                <option value="Decomposing / High moisture">Decomposing / High moisture</option>
                <option value="Dry / Fibrous residues">Dry / Fibrous residues</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#183E2E] block mb-1">
                Material Classification
              </label>
              <select
                value={edibleOrWaste}
                onChange={(e) => setEdibleOrWaste(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8DF] rounded-xl focus:border-[#245C43] focus:outline-none"
              >
                <option value="Inedible organic discard (sorting losses)">Inedible organic discard</option>
                <option value="Edible fresh surplus (safe for food redistribution)">Edible fresh surplus</option>
                <option value="Crop field residue / Stubble">Crop field residue / Stubble</option>
              </select>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !materialType.trim()}
            className="w-full py-3 bg-[#245C43] hover:bg-[#183E2E] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Recovery Routes via Groq AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D7E8A3]" />
                <span>Analyze Circular Recovery Routes</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl flex items-start gap-3 text-xs text-[#991B1B]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Evaluation Error</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Results View */}
          {recommendation && !isLoading && (
            <div className="bg-[#F8F8F2] border border-[#85B96F]/60 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#E2E8DF] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#245C43]" />
                  <h4 className="font-heading font-bold text-sm text-[#183E2E]">
                    Recommended Circular Pathway
                  </h4>
                </div>
                <span className="text-[10px] text-[#68766D] bg-white px-2 py-0.5 rounded border border-[#E2E8DF]">
                  Model: {recommendation.model_used}
                </span>
              </div>

              {/* Primary Recommended Route */}
              <div className="bg-[#EAF1E7] border border-[#85B96F]/50 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#245C43]">
                    Optimal Destination:
                  </span>
                  <span className="text-xs font-bold bg-[#245C43] text-white px-2.5 py-0.5 rounded-full">
                    {recommendation.recommended_route}
                  </span>
                </div>
                <p className="text-xs text-[#183E2E] leading-relaxed font-medium">
                  {recommendation.reasoning}
                </p>
              </div>

              {/* Summary */}
              <p className="text-xs text-[#68766D] leading-relaxed">
                {recommendation.summary}
              </p>

              {/* Other Options */}
              {recommendation.other_options?.length > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-[#E2E8DF] space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#183E2E] block">
                    Alternative Viable Routes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendation.other_options.map((opt, i) => (
                      <span key={i} className="text-xs bg-[#F8F8F2] text-[#183E2E] px-2.5 py-1 rounded-lg border border-[#E2E8DF]">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions to Check */}
              {recommendation.conditions_to_check?.length > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-[#E2E8DF] space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D99A36] block">
                    Safety & Handling Checks Before Handoff:
                  </span>
                  <ul className="text-xs text-[#68766D] space-y-1">
                    {recommendation.conditions_to_check.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8059] shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Action Box */}
              <div className="bg-[#183E2E] text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D7E8A3] block">
                    Suggested Next Action in Gather AI:
                  </span>
                  <p className="text-xs text-white/90 font-medium">
                    {recommendation.next_action}
                  </p>
                </div>
                <button
                  onClick={handleUseRecommendation}
                  className="px-4 py-2 bg-[#D7E8A3] hover:bg-[#c9dd8f] text-[#183E2E] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
                >
                  <span>Register & Match Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between text-xs text-[#68766D]">
          <span>Grounded in actual partner compatibility rules</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-[#EAF1E7] border border-[#E2E8DF] rounded-xl text-[#183E2E] font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
