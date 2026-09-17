import { RequestContext } from '@mastra/core/request-context';
import { OWNER_ID_CONTEXT_KEY, TODO_AGENT_ID, TONE_CONTEXT_KEY } from '../src/mastra/constants';
import { mastra } from '../src/mastra/index';

const agent = mastra.getAgentById(TODO_AGENT_ID);

type Tone = 'formal' | 'casual';

async function ask(ownerId: string, tone: Tone, message: string): Promise<void> {
  const requestContext = new RequestContext<{ ownerId: string; tone?: Tone }>([
    [OWNER_ID_CONTEXT_KEY, ownerId],
    [TONE_CONTEXT_KEY, tone],
  ]);

  const result = await agent.generate(message, {
    requestContext,
    memory: { resource: ownerId, thread: `ctx-${ownerId}` },
  });

  console.log(`[${ownerId} / ${tone}] ${result.text}`);
}

// 같은 저장소를 쓰지만 소유자가 다르면 서로의 할 일이 보이지 않아야 한다.
await ask('user-a', 'formal', '보고서 초안 쓰기를 할 일에 추가해 줘');
await ask('user-b', 'casual', '내 할 일 목록 보여 줘');
await ask('user-a', 'formal', '내 할 일 목록 보여 줘');
