import type { ModelForProvider, Provider } from '@mastra/core/llm';

type RegisteredModelId = { [P in Provider]: `${P}/${ModelForProvider<P>}` }[Provider];

export const MODELS = {
  GOOGLE_FLASH: 'google/gemini-3.6-flash',
} as const satisfies Record<string, RegisteredModelId>;
