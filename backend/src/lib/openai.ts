import { OpenAI } from 'openai';

import { env } from './env.js';

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  if (!client) {
    client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      maxRetries: 0,
      timeout: 25_000,
    });
  }

  return client;
}
