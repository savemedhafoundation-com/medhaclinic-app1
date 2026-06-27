import type { AppAuthUser } from '../firebase/authClient.types';
import { BackendRequestError, readErrorMessage, requestBackend } from './backend';

const AI_SUMMARY_TIMEOUT_MS = 12_000;

export type AiContentSource = 'ai' | 'template';

export type AiSummaryResult = {
  result: string;
  source: AiContentSource;
  outputReference?: string | null;
};

function normalizeAiSummaryError(error: unknown) {
  if (error instanceof BackendRequestError) {
    if (typeof error.status === 'number' && error.status >= 500) {
      return new Error(
        `Wellness summary service is temporarily unavailable (HTTP ${error.status}).`
      );
    }

    return new Error(readErrorMessage(error.payload) ?? error.message);
  }

  if (error instanceof Error) {
    return new Error(readErrorMessage(error.message) ?? error.message);
  }

  return new Error(readErrorMessage(error) ?? 'Wellness summary request failed.');
}

export async function fetchImmunityResult(
  promptText: string,
  authUser?: AppAuthUser | null
): Promise<AiSummaryResult> {
  try {
    if (!promptText) {
      throw new Error('Prompt is empty or undefined.');
    }

    if (!authUser) {
      throw new Error('Please sign in before requesting a wellness summary.');
    }

    const data = await requestBackend<AiSummaryResult>('/v1/ai/immunity-summary', {
      method: 'POST',
      body: JSON.stringify({ prompt: promptText }),
      authUser,
      timeoutMs: AI_SUMMARY_TIMEOUT_MS,
    });

    if (!data?.result) {
      throw new Error('Invalid response from wellness summary service.');
    }

    return {
      result: data.result,
      source: data.source === 'ai' ? 'ai' : 'template',
      outputReference: data.outputReference ?? null,
    };
  } catch (error) {
    throw normalizeAiSummaryError(error);
  }
}
