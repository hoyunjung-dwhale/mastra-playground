import { TODO_AGENT_ID } from '../src/mastra/constants';
import { mastra } from '../src/mastra/index';

// provider로 나가는 HTTP 요청을 그대로 보기 위한 임시 스크립트다. Mastra가 저장해 둔
// 메시지(V2 JSON)를 provider 형식으로 어떻게 바꿔 보내는지 확인하는 용도다.
const originalFetch = globalThis.fetch;

function preview(value: unknown, max = 120): unknown {
  if (typeof value === 'string') {
    return value.length > max ? `${value.slice(0, max)}…(${value.length}자)` : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => preview(item, max));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, preview(item, max)]),
    );
  }
  return value;
}

globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const body = init?.body;

  // 임베딩 호출(semantic recall)은 본문이 길고 구조가 단순해 URL만 남긴다.
  const isEmbedding = url.includes(':embedContent') || url.includes(':batchEmbedContents');

  if (typeof body === 'string' && !isEmbedding) {
    console.log('\n=========== 요청 ===========');
    console.log(url.replace(/key=[^&]+/, 'key=***'));
    console.log(JSON.stringify(preview(JSON.parse(body)), null, 2));
  } else if (isEmbedding) {
    console.log(`\n[임베딩 호출] ${url.split('?')[0]}`);
  }

  const response = await originalFetch(input, init);

  if (typeof body === 'string' && !isEmbedding) {
    const clone = response.clone();
    const text = await clone.text();
    console.log('----------- 응답 -----------');
    try {
      console.log(JSON.stringify(preview(JSON.parse(text)), null, 2));
    } catch {
      console.log(text.slice(0, 2000));
    }
  }

  return response;
};

const agent = mastra.getAgentById(TODO_AGENT_ID);

// 기존 실습 스레드(todo-1, todo-2)를 건드리지 않도록 별도 스레드를 쓴다.
const result = await agent.generate('내일 오전 회의 준비를 할 일에 추가해 줘', {
  memory: { resource: 'user-1', thread: 'capture-1' },
});

console.log('\n=========== 최종 응답 텍스트 ===========');
console.log(result.text);
