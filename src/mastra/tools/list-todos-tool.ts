import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { todoSchema } from '../todo/todo.schema';
import { listTodos } from '../todo/todo-store';

export const listTodosTool = createTool({
  id: 'list-todos',
  // TODO: 어떤 요청에 쓰는지 적는다.
  description: '',
  inputSchema: z.object({
    // TODO: 생략하면 전체, true면 완료, false면 미완료라는 것을 모델이 알게 적는다.
    done: z.boolean().optional().describe(''),
  }),
  outputSchema: z.array(todoSchema),
  execute: async ({ done }) => listTodos(done),
});
