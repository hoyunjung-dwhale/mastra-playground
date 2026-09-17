import { createRoute } from '@mastra/server/server-adapter';
import { z } from 'zod';
import { listTodos } from '../todo/todo-store';

export const todoSummaryRoute = createRoute({
  method: 'GET',
  path: '/todos/summary',
  responseType: 'json',
  // 운영이라면 소유자를 인증 결과(requestContext)에서 읽는다. 이 서버에는 인증이 없어 쿼리로 받는다.
  queryParamSchema: z.object({
    ownerId: z.string().min(1).describe('할 일 소유자 id'),
  }),
  responseSchema: z.object({
    ownerId: z.string(),
    total: z.number().int(),
    done: z.number().int(),
    open: z.number().int(),
  }),
  handler: async ({ ownerId }) => {
    const todos = listTodos(ownerId);

    return {
      ownerId,
      total: todos.length,
      done: todos.filter((todo) => todo.done).length,
      open: todos.filter((todo) => !todo.done).length,
    };
  },
  summary: '소유자별 할 일 요약',
  tags: ['Todos'],
});
