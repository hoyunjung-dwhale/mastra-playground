import { TODO_AGENT_ID } from '../src/mastra/constants';
import { mastra } from '../src/mastra/index';

const agent = mastra.getAgentById(TODO_AGENT_ID);

// TODO: resource는 사용자 식별자, thread는 대화 식별자다. 두 번째 호출이 첫 메시지를 기억하려면
// 같은 값을 넘겨야 한다. 값을 정해 넣는다. (예: resource 'user-1', thread 'todo-1')
const memory = { resource: '', thread: '' };

// TODO: 첫 호출에서 기억할 만한 것(이름, 선호)을 말하면서 할 일을 추가한다.
const first = await agent.generate('', { memory });
console.log('[1st] text:', first.text);

// TODO: 두 번째 호출에서 첫 메시지에서 말한 것을 물어 본다.
const second = await agent.generate('', { memory });
console.log('[2nd] text:', second.text);

// TODO: 같은 resource, 다른 thread로 같은 질문을 해서 첫 대화를 모르는지 확인한다.
const other = await agent.generate('', { memory: { resource: memory.resource, thread: '' } });
console.log('[other thread] text:', other.text);
