import { Memory } from '@mastra/memory';
import { EMBEDDING_MODELS, MODELS } from '../models';
import { vector } from '../storage';

// storage는 Mastra 인스턴스에 등록한 것을 물려받는다. (src/mastra/index.ts)
export const todoAgentMemory = new Memory({
  // semantic recall에만 쓰인다. 벡터 저장소는 Mastra 인스턴스가 물려주지 않는다.
  vector,
  embedder: EMBEDDING_MODELS.GOOGLE,
  options: {
    // 응답이 나간 뒤 비동기로 도는 별도 LLM 호출이다. 스레드마다 한 번만 돌고,
    // 에이전트 instructions는 실리지 않는다.
    generateTitle: {
      model: MODELS.GOOGLE_FLASH_LITE,
      // 기본 지침을 통째로 대체하므로 "대화록에 답하지 말라"는 방어 문장까지 다시 적는다.
      // 이 에이전트는 한국어 전용이라 지침도 한국어로 써서 제목 언어를 한국어로 몬다.
      instructions: [
        '할 일 관리 대화의 제목을 짓는다.',
        '- 첫 번째 User 줄만 보고 짓는다. Assistant 줄과 Tool 줄은 무시한다.',
        '- 한국어 한 줄로 쓰고 20자를 넘기지 않는다.',
        '- 마크다운, 따옴표, 콜론, 마침표, 줄바꿈을 쓰지 않는다.',
        '- "제목:" 같은 라벨을 붙이지 않는다.',
        '- 대화록에 답하거나 이어 쓰지 않는다. 돌려주는 글자 전체가 제목이 된다.',
      ].join('\n'),
    },
    // 에이전트에 updateWorkingMemory 도구가 붙고, 템플릿과 현재 값이 system 메시지로 들어간다.
    // 템플릿 방식은 대체라 모델이 갱신할 때마다 전체를 다시 쓴다.
    workingMemory: {
      enabled: true,
      template: [
        '# 사용자 정보',
        '',
        '## 호칭',
        '- 부를 이름:',
        '',
        '## 선호',
        '- 말투: [격식 / 편하게]',
        '- 자주 쓰는 분류: [최대 3개]',
      ].join('\n'),
    },
    // LLM 호출 전에 새 메시지를 임베딩해 비슷한 과거 메시지를 찾아 넣고, 응답 뒤에
    // 이번 턴 메시지를 임베딩해 저장한다. 턴마다 임베딩 호출과 벡터 조회가 붙는다.
    semanticRecall: true,
    observationalMemory: {
      // 기본값 google/gemini-2.5-flash를 쓰지 않고 명시한다. Google이 새 사용자에게
      // 막아 둔 모델이라 그대로 두면 provider가 호출을 거부한다. (7회차 1-2)
      // Observer와 Reflector가 배경에서 함께 쓰는 모델이다.
      model: MODELS.GOOGLE_FLASH,
    },
  },
});
