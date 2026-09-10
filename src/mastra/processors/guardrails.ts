import { ModerationProcessor, UnicodeNormalizer } from '@mastra/core/processors';
import { MODELS } from '../models';

// LLM 없이 문자열만 정리한다. 4-1에서 손으로 짠 input-normalizer를 내장 프로세서로 대체한다.
export const unicodeNormalizer = new UnicodeNormalizer({
  stripControlChars: true,
  preserveEmojis: true,
  // 기본값이 true다. 켜면 여러 줄 붙여넣기의 줄바꿈·들여쓰기가 뭉개진다.
  collapseWhitespace: false,
  trim: true,
});

// LLM 분류 호출이 요청마다 하나 더 붙는다. 무료 한도를 쓰므로 실습 중에는 필요한 만큼만 켠다.
export const inputModeration = new ModerationProcessor({
  // 분류 전용 모델. 지금은 본체와 같고, 더 싸고 빠른 모델이 생기면 models.ts에 추가해 바꾼다.
  model: MODELS.GOOGLE_FLASH,
  categories: ['hate', 'harassment', 'violence'],
  threshold: 0.7,
  // warn으로 어떤 입력이 걸리는지 먼저 본 뒤 block으로 올린다.
  strategy: 'warn',
});
