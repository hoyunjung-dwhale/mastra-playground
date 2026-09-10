import { z } from 'zod';
import { TODO_AGENT_ID } from '../src/mastra/constants';
import { mastra } from '../src/mastra/index';

const agent = mastra.getAgentById(TODO_AGENT_ID);

// 모델이 이 형태로 답하도록 고정한다. 도구의 inputSchema와 같은 zod이고, JSON Schema로 변환되어
// provider의 response_format 파라미터로 전달된다.
const daySummarySchema = z.object({
  summary: z.string().describe('아래 항목들에 대한 요약'),
  remaining: z.array(z.string()).describe('남아있는 할 일 들'),
  top: z.string().describe('우선순위가 가장 높은 할 일 하나'),
});

const response = await agent.generate('오늘 남은 할 일을 정리해 줘', {
  structuredOutput: {
    schema: daySummarySchema,
    errorStrategy: 'fallback',
    fallbackValue: { summary: '지금은 정리할 수 없습니다.', remaining: [], top: '' },
  },
});

// object는 daySummarySchema에서 추론된 타입이다. text도 함께 온다.
console.log('[object]', response.object);
console.log('[text]', response.text);
console.log('[steps]', response.steps.length);
