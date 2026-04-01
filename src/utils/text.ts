/** 📝 Shared Text Normalization & Processing Utilities */

/**
 * Normalize text by:
 * - Converting to lowercase
 * - Removing diacritical marks (NFD)
 * - Removing special punctuation and extra spaces
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\p{L}\s']/gu, ' ') // Keep letters, spaces, and apostrophes
    .trim()
    .replace(/\s+/g, ' '); // Collapse multiple spaces
}

/**
 * Extract negation words that reverse the sentiment.
 * Returns true if input contains negation.
 */
export function hasNegation(text: string): boolean {
  const normalized = normalizeText(text);
  const negations = ['not', 'no', 'never', 'dont', 'can\'t', 'cannot', 'wont', 'won\'t'];
  return negations.some((neg) => normalized.includes(neg));
}

/**
 * Check if text contains a word within a threshold of edit distance.
 * Simple Levenshtein-style check for typo tolerance.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Substitution
          matrix[i][j - 1] + 1, // Insertion
          matrix[i - 1][j] + 1, // Deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * HTML escape user input to prevent XSS attacks.
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
