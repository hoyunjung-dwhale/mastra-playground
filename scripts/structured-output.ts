import { z } from 'zod';
import { TODO_AGENT_ID } from '../src/mastra/constants';
import { mastra } from '../src/mastra/index';

const agent = mastra.getAgentById(TODO_AGENT_ID);

// 모델이 이 형태로 답하도록 고정한다. 도구의 inputSchema와 같은 zod이고, JSON Schema로 변환되어
// provider의 response_format 파라미터로 전달된다.
const daySummarySchema = z.object({
  // TODO: 필드마다 describe로 모델이 무엇을 채워야 하는지 적는다.
  summary: z.string().describe(''),
  remaining: z.array(z.string()).describe(''),
  // TODO: 필드를 하나 더 추가해 본다. (예: 우선순위가 가장 높은 할 일 하나)
});

// TODO: 메시지를 바꿔 본다. 도구가 있는 에이전트라 호출 중 도구를 부를 수도 있다.
const response = await agent.generate('오늘 남은 할 일을 정리해 줘', {
  structuredOutput: {
    schema: daySummarySchema,
  },
});

// object는 daySummarySchema에서 추론된 타입이다. text도 함께 온다.
console.log('[object]', response.object);
console.log('[text]', response.text);
console.log('[steps]', response.steps.length);
