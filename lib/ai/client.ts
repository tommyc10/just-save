import Anthropic from '@anthropic-ai/sdk';
import { AI_CONFIG } from '../constants';

let clientInstance: Anthropic | null = null;
let validationError: string | null = null;

/**
 * Get the singleton Anthropic client instance
 * Lazily initializes with API key validation
 * @throws Error if API key is not configured
 */
export function getAnthropicClient(): Anthropic {
  if (validationError) {
    throw new Error(validationError);
  }

  if (!clientInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      validationError = 'API key not configured. Add ANTHROPIC_API_KEY to .env.local';
      throw new Error(validationError);
    }

    clientInstance = new Anthropic({ apiKey });
  }

  return clientInstance;
}

/**
 * Get the standard model configuration for API calls
 */
export function getModelConfig() {
  return {
    model: AI_CONFIG.MODEL,
    max_tokens: AI_CONFIG.MAX_TOKENS,
  };
}
