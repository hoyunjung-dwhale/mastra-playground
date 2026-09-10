import { TODO_AGENT_ID } from '../src/mastra/constants';
import { mastra } from '../src/mastra/index';

const agent = mastra.getAgentById(TODO_AGENT_ID);

// generate: 루프가 끝난 뒤 완성된 결과 객체를 받는다.
// TODO: 메시지를 할 일 관리 요청으로 바꾸고, 결과 객체에서 보고 싶은 필드를 골라 출력한다.
const result = await agent.generate('안녕');
console.log('[generate] text:', result.text);
console.log('[generate] steps:', result.steps.length);
console.log('[generate] usage:', result.usage);

// stream: 토큰이 나오는 대로 읽는다. 필드 값은 스트림이 끝난 뒤 Promise로 받는다.
// TODO: 메시지를 바꾸고, 스트림이 끝난 뒤 usage를 출력해 generate와 비교한다.
const stream = await agent.stream('안녕');
process.stdout.write('[stream] text: ');
for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
process.stdout.write('\n');
