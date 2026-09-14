import { Memory } from '@mastra/memory';

// storage는 Mastra 인스턴스에 등록한 것을 물려받는다. (src/mastra/index.ts)
export const todoAgentMemory = new Memory({
  options: {
    lastMessages: 10,
  },
});
