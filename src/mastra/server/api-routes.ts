import type { ApiRoute } from '@mastra/core/server';
import { todoSummaryRoute } from './todo-summary-route';

// 미들웨어 배열과 같은 이유로 함수로 뺀다. index.ts를 얇게 두고 목록만 여기서 관리한다.
export function buildApiRoutes(): ApiRoute[] {
  return [todoSummaryRoute];
}
