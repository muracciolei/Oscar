import Fuse from 'fuse.js';

export interface FuzzyKeywordEntry {
  intentId: string;
  keyword: string;
}

export interface FuzzyMatchResult {
  intentId: string;
  keyword: string;
  score: number;
  confidence: number;
}

export class FuzzyMatcher {
  private readonly fuse: Fuse<FuzzyKeywordEntry>;

  constructor(entries: FuzzyKeywordEntry[], threshold: number = 0.35) {
    this.fuse = new Fuse(entries, {
      includeScore: true,
      threshold,
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: ['keyword'],
    });
  }

  /**
   * Return the best fuzzy match for the input sentence or null if confidence is low.
   */
  match(input: string): FuzzyMatchResult | null {
    const normalized = input.toLowerCase().trim();
    if (!normalized) {
      return null;
    }

    const terms = [normalized, ...normalized.split(/\s+/).filter((t) => t.length > 2)];
    let best: FuzzyMatchResult | null = null;

    for (const term of terms) {
      const result = this.searchTerm(term);
      if (!result) {
        continue;
      }

      if (!best || result.confidence > best.confidence) {
        best = result;
      }
    }

    // Hard confidence gate to prevent noisy fuzzy matches.
    if (!best || best.confidence < 0.55) {
      return null;
    }

    return best;
  }

  private searchTerm(term: string): FuzzyMatchResult | null {
    const hits = this.fuse.search(term, { limit: 1 });
    if (hits.length === 0) {
      return null;
    }

    const hit = hits[0];
    const rawScore = hit.score ?? 1;
    const confidence = Math.max(0, Math.min(1, 1 - rawScore));

    return {
      intentId: hit.item.intentId,
      keyword: hit.item.keyword,
      score: rawScore,
      confidence,
    };
  }
}
