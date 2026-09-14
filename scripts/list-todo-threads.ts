import { TODO_AGENT_ID } from '../src/mastra/constants';
import { mastra } from '../src/mastra/index';

const resourceId = 'user-1';

const memory = await mastra.getAgentById(TODO_AGENT_ID).getMemory();
if (!memory) {
  throw new Error('todo-agent에 memory가 없다.');
}

// filter를 빼면 모든 사용자의 스레드가 나온다. Mastra는 접근 제어를 하지 않으므로,
// 서버 코드라면 이 resourceId가 인증된 사용자의 것인지 여기서 먼저 확인해야 한다.
const { threads, total } = await memory.listThreads({
  filter: { resourceId },
  orderBy: { field: 'updatedAt', direction: 'DESC' },
  perPage: false,
});
console.log(`[스레드] ${total}개`);

for (const thread of threads) {
  console.log(`\n- id=${thread.id} title=${thread.title || '(없음)'}`);
  // resourceId를 같이 주면 스레드 소유자와 다른 메시지를 걸러 준다. 서버에서 쓰는 이중 방어다.
  const { messages } = await memory.recall({
    threadId: thread.id,
    resourceId,
    perPage: false,
  });
  for (const message of messages) {
    const texts = message.content.parts.flatMap((part) =>
      part.type === 'text' ? [part.text] : [],
    );
    console.log(`    ${message.role}: ${texts.join(' ')}`);
  }
}
