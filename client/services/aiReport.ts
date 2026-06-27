import type { AppAuthUser } from '../firebase/authClient.types';
import { requestBackend } from './backend';

export type AiReportReason =
  | 'unsafe_health_advice'
  | 'harmful_or_offensive'
  | 'misleading_or_inaccurate'
  | 'privacy_or_personal_data'
  | 'other';

export type AiOutputReportInput = {
  screenName: string;
  outputReference?: string | null;
  reasonCategory: AiReportReason;
  userComment?: string;
  contentPreview?: string;
};

export async function reportAiOutput(
  input: AiOutputReportInput,
  authUser?: AppAuthUser | null
) {
  if (!authUser) {
    throw new Error('Please sign in before reporting AI content.');
  }

  return requestBackend('/v1/ai/report', {
    method: 'POST',
    authUser,
    body: JSON.stringify({
      ...input,
      reportedAt: new Date().toISOString(),
    }),
  });
}
