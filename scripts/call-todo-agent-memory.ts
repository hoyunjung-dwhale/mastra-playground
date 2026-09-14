import { TODO_AGENT_ID } from '../src/mastra/constants';
import { mastra } from '../src/mastra/index';

const agent = mastra.getAgentById(TODO_AGENT_ID);

const memory = { resource: 'user-1', thread: 'todo-1' };

const first = await agent.generate(
  '내 이름은 홍길동이야. 내일 오전 회의 준비를 할 일에 추가해 줘',
  { memory },
);
console.log('[1st] text:', first.text);

const second = await agent.generate('내 이름이 뭐야?', { memory });
console.log('[2nd] text:', second.text);

// 사용자는 같고 대화만 다르다. 앞 호출과 질문이 같아야 대화 경계가 드러난다.
const other = await agent.generate('내 이름이 뭐야?', {
  memory: { resource: memory.resource, thread: 'todo-2' },
});
console.log('[other thread] text:', other.text);
