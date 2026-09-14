import { Memory } from '@mastra/memory';

// storage는 Mastra 인스턴스에 등록한 것을 물려받는다. (src/mastra/index.ts)
export const todoAgentMemory = new Memory({
  options: {
    // TODO: 컨텍스트에 넣을 최근 메시지 개수를 정한다. 기본값은 10이다.
    lastMessages: 10,
  },
});
