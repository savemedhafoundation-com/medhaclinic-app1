import { hasConfiguredBackend, requestBackend } from './backend';

const WELLNESS_API_URL = 'https://medhaclinic-backend.vercel.app';

export async function fetchImmunityResult(promptText: string) {
  if (!promptText) {
    throw new Error('Prompt is empty or undefined');
  }

  if (hasConfiguredBackend()) {
    const data = await requestBackend<{ result?: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt: promptText }),
    });

    if (!data.result) {
      throw new Error('Invalid response from AI server');
    }

    return data.result;
  }

  const response = await fetch(`${WELLNESS_API_URL}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: promptText }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? data?.message ?? 'AI request failed');
  }

  if (!data.result) {
    throw new Error('Invalid response from AI server');
  }

  return data.result as string;
}
