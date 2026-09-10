import { TODO_AGENT_ID } from '../src/mastra/constants';
import { mastra } from '../src/mastra/index';

const agent = mastra.getAgentById(TODO_AGENT_ID);

// generate: 루프가 끝난 뒤 완성된 결과 객체를 받는다.
const result = await agent.generate('내일 오전 회의 준비를 할 일에 추가해 줘');
console.log('[generate] reasoningText:', result.reasoningText);
console.log('[generate] text:', result.text);
console.log('[generate] steps:', result.steps.length);
console.log('[generate] usage:', result.usage);

// stream: 토큰이 나오는 대로 읽는다. 필드 값은 스트림이 끝난 뒤 Promise로 받는다.
const stream = await agent.stream('내일 오전 회의 준비를 할 일에 추가해 줘');
process.stdout.write('[stream] text: ');
for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
process.stdout.write('\n');
console.log('[stream] usage:', await stream.usage);
