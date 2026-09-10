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
  // TODO: 분류 전용 모델을 고른다. 본체와 같은 모델로 시작하고, 더 싸고 빠른 모델이 있으면 models.ts에 추가한다.
  model: MODELS.GOOGLE_FLASH,
  // TODO: 검출 범주를 정한다. 할 일 에이전트에 무엇이 들어오면 안 되는지 기준으로.
  categories: ['hate', 'harassment', 'violence'],
  // TODO: 0~1. 낮을수록 민감하다.
  threshold: 0.7,
  // TODO: 'warn'은 로그만 남기고 통과, 'block'은 abort로 중단. 먼저 warn으로 어떤 입력이 걸리는지 본 뒤 정한다.
  strategy: 'warn',
});
