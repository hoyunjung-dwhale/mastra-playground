import { storage } from '../src/mastra/storage';

// Mastra는 prune을 대신 돌려 주지 않는다. 운영에서는 이 호출을 스케줄러에 건다.
const results = await storage.prune();

if (results.length === 0) {
  console.log('retention 설정이 없어 아무것도 지우지 않았다.');
}

for (const result of results) {
  const remaining = result.done ? '' : ' (남은 행이 더 있다. 다시 호출해야 한다)';
  console.log(`${result.domain} / ${result.table}: ${result.deleted}행 삭제${remaining}`);
}
