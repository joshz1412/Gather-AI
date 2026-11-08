/**
 * Client-side helper for Gather AI Marketplace AI features.
 * Calls server-side Groq endpoints with fallback logic if offline.
 */

export interface ImproveListingInput {
  commodityName: string;
  category: string;
  variety?: string;
  grade?: string;
  quantity?: number;
  unit?: string;
  location?: string;
  condition?: string;
  roughNotes?: string;
}

export interface ImproveListingResult {
  improvedDescription: string;
  completenessFeedback: string[];
}

export async function improveListingDescription(
  input: ImproveListingInput
): Promise<ImproveListingResult> {
  try {
    const res = await fetch('/api/marketplace-improve-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.improvedDescription) {
        return {
          improvedDescription: data.improvedDescription,
          completenessFeedback: data.completenessFeedback || [],
        };
      }
    }
  } catch {
    // Network or server error - gracefully fall back to local rule-based builder
  }

  // Deterministic rule-based fallback adhering strictly to truthfulness
  const parts: string[] = [];
  const nameWithVariety = input.variety 
    ? `${input.commodityName} (${input.variety})` 
    : input.commodityName || 'Produce';
  
  parts.push(`Fresh lot of ${nameWithVariety} from ${input.location || 'registered farm location'}.`);
  
  if (input.grade) {
    parts.push(`Graded as ${input.grade}.`);
  }
  
  if (input.condition) {
    parts.push(`Lot condition: ${input.condition}.`);
  }

  if (input.roughNotes && input.roughNotes.trim().length > 0) {
    parts.push(input.roughNotes.trim());
  } else {
    parts.push('Sorted and ready for buyer inspection, weighing, and direct collection.');
  }

  const feedback: string[] = [];
  if (!input.variety) feedback.push('Adding the specific variety helps buyers verify market demand.');
  if (!input.grade) feedback.push('Specifying grade (e.g. Mandi Standard or Grade A) sets clear quality expectations.');
  if (!input.condition) feedback.push('Describing current handling condition builds buyer confidence.');

  return {
    improvedDescription: parts.join(' '),
    completenessFeedback: feedback,
  };
}

export interface SearchInterpretationResult {
  interpretedIntent: string;
  suggestedCategory?: string;
  suggestedMaxPrice?: number;
  suggestedLocation?: string;
  extractedKeywords: string[];
}

export async function interpretMarketplaceSearch(
  query: string,
  mode: 'buy' | 'sell'
): Promise<SearchInterpretationResult> {
  try {
    const res = await fetch('/api/marketplace-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, mode }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.interpretedIntent) {
        return data;
      }
    }
  } catch {
    // Network or server error - fallback to regex heuristics
  }

  const lower = query.toLowerCase();
  let suggestedCategory: string | undefined;

  if (mode === 'buy') {
    if (lower.includes('vermi') || lower.includes('worm')) suggestedCategory = 'Vermicompost';
    else if (lower.includes('compost') || lower.includes('khad')) suggestedCategory = 'Organic Compost';
    else if (lower.includes('slurry') || lower.includes('biogas') || lower.includes('liquid')) suggestedCategory = 'Enriched Bio-Slurry';
    else if (lower.includes('pellet') || lower.includes('straw') || lower.includes('conditioner')) suggestedCategory = 'Soil Conditioner & Bio-Pellets';
    else if (lower.includes('enzyme') || lower.includes('tonic')) suggestedCategory = 'Bio-Enzymes & Liquid Manure';
    else if (lower.includes('frass') || lower.includes('insect') || lower.includes('larva')) suggestedCategory = 'Insect Frass Fertilizer';
  } else {
    if (lower.includes('tomato') || lower.includes('onion') || lower.includes('vegetable')) suggestedCategory = 'Vegetables';
    else if (lower.includes('mango') || lower.includes('fruit') || lower.includes('alphonso')) suggestedCategory = 'Fruits';
    else if (lower.includes('wheat') || lower.includes('paddy') || lower.includes('rice') || lower.includes('grain')) suggestedCategory = 'Grains & Cereals';
    else if (lower.includes('chana') || lower.includes('gram') || lower.includes('pulse') || lower.includes('dal')) suggestedCategory = 'Pulses';
    else if (lower.includes('seed')) suggestedCategory = 'Seeds & Planting Materials';
    else if (lower.includes('orchard') || lower.includes('standing')) suggestedCategory = 'Standing Crops';
  }

  // Extract price number if "under 300" / "below 500"
  let suggestedMaxPrice: number | undefined;
  const priceMatch = lower.match(/(?:under|below|less than|<)\s*(?:rs\.?|₹)?\s*(\d+)/i);
  if (priceMatch) {
    suggestedMaxPrice = parseInt(priceMatch[1], 10);
  }

  return {
    interpretedIntent: `Searching catalog for "${query}"`,
    suggestedCategory,
    suggestedMaxPrice,
    extractedKeywords: query.split(/\s+/).filter((w) => w.length > 2),
  };
}
