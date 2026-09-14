import type { ModelForProvider, Provider } from '@mastra/core/llm';

type RegisteredModelId = { [P in Provider]: `${P}/${ModelForProvider<P>}` }[Provider];

export const MODELS = {
  GOOGLE_FLASH: 'google/gemini-3.6-flash',
  // 스레드 제목처럼 짧은 한 줄을 만드는 부수 호출용. 본체보다 작고 싸다.
  GOOGLE_FLASH_LITE: 'google/gemini-3.5-flash-lite',
} as const satisfies Record<string, RegisteredModelId>;
