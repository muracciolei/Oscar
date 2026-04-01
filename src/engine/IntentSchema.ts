export type LanguageCode = 'en' | 'es' | 'it';

export interface LocalizedLines {
  en: string[];
  es: string[];
  it: string[];
}

export interface IntentDefinition {
  id: string;
  priority: number;
  patterns: string[];
  keywords: string[];
  responses: LocalizedLines;
  followUps: LocalizedLines;
}

export interface IntentDataset {
  schemaVersion: number;
  intents: IntentDefinition[];
  fallback: LocalizedLines;
}

// JSON-schema-like descriptor to keep the data contract explicit.
export const INTENT_SCHEMA = {
  type: 'object',
  required: ['schemaVersion', 'intents', 'fallback'],
  properties: {
    schemaVersion: { type: 'number' },
    intents: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'priority', 'patterns', 'keywords', 'responses', 'followUps'],
      },
    },
    fallback: { type: 'object', required: ['en', 'es', 'it'] },
  },
} as const;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  value: IntentDataset | null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isLocalizedLines(value: unknown, fieldPath: string, errors: string[]): value is LocalizedLines {
  if (!value || typeof value !== 'object') {
    errors.push(`${fieldPath} must be an object`);
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const languages: LanguageCode[] = ['en', 'es', 'it'];

  for (const lang of languages) {
    if (!isStringArray(candidate[lang])) {
      errors.push(`${fieldPath}.${lang} must be a string[]`);
      return false;
    }
  }

  return true;
}

export function validateIntentDataset(value: unknown): ValidationResult {
  const errors: string[] = [];

  if (!value || typeof value !== 'object') {
    return { valid: false, errors: ['dataset must be an object'], value: null };
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.schemaVersion !== 'number') {
    errors.push('schemaVersion must be a number');
  }

  if (!Array.isArray(candidate.intents)) {
    errors.push('intents must be an array');
  }

  if (!isLocalizedLines(candidate.fallback, 'fallback', errors)) {
    errors.push('fallback structure is invalid');
  }

  const intentIds = new Set<string>();

  if (Array.isArray(candidate.intents)) {
    for (let index = 0; index < candidate.intents.length; index++) {
      const row = candidate.intents[index];
      const basePath = `intents[${index}]`;

      if (!row || typeof row !== 'object') {
        errors.push(`${basePath} must be an object`);
        continue;
      }

      const intent = row as Record<string, unknown>;

      if (typeof intent.id !== 'string' || intent.id.trim().length === 0) {
        errors.push(`${basePath}.id must be a non-empty string`);
      } else if (intentIds.has(intent.id)) {
        errors.push(`${basePath}.id "${intent.id}" is duplicated`);
      } else {
        intentIds.add(intent.id);
      }

      if (typeof intent.priority !== 'number') {
        errors.push(`${basePath}.priority must be a number`);
      }

      if (!isStringArray(intent.patterns) || intent.patterns.length === 0) {
        errors.push(`${basePath}.patterns must be a non-empty string[]`);
      }

      if (!isStringArray(intent.keywords) || intent.keywords.length === 0) {
        errors.push(`${basePath}.keywords must be a non-empty string[]`);
      }

      isLocalizedLines(intent.responses, `${basePath}.responses`, errors);
      isLocalizedLines(intent.followUps, `${basePath}.followUps`, errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    value: errors.length === 0 ? (candidate as unknown as IntentDataset) : null,
  };
}

export function assertValidIntentDataset(value: unknown): IntentDataset {
  const result = validateIntentDataset(value);
  if (!result.valid || !result.value) {
    throw new Error(`Invalid intent dataset: ${result.errors.join(' | ')}`);
  }
  return result.value;
}
