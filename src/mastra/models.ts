import type { EmbeddingModelId, ModelForProvider, Provider } from '@mastra/core/llm';

type RegisteredModelId = { [P in Provider]: `${P}/${ModelForProvider<P>}` }[Provider];

export const MODELS = {
  GOOGLE_FLASH: 'google/gemini-3.6-flash',
  // 스레드 제목처럼 짧은 한 줄을 만드는 부수 호출용. 본체보다 작고 싸다.
  GOOGLE_FLASH_LITE: 'google/gemini-3.5-flash-lite',
} as const satisfies Record<string, RegisteredModelId>;

// 저장과 조회에 같은 모델을 써야 벡터를 비교할 수 있다. 중간에 바꾸면 기존 임베딩을
// 전부 다시 계산해야 하므로 storage 어댑터를 바꾸는 것보다 무겁다.
export const EMBEDDING_MODELS = {
  GOOGLE: 'google/gemini-embedding-001',
} as const satisfies Record<string, EmbeddingModelId>;
