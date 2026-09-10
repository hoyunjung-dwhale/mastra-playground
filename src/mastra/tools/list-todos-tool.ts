import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { todoSchema } from '../todo/todo.schema';
import { listTodos } from '../todo/todo-store';

export const listTodosTool = createTool({
  id: 'list-todos',
  description: '저장된 할 일 목록을 조회한다. 할 일이 뭔지, 남은 게 있는지 물으면 호출한다.',
  inputSchema: z.object({
    done: z
      .boolean()
      .optional()
      .describe('생략 시 전체, true면 완료된 것만, false면 완료되지 않은 것만 보여준다.'),
  }),
  outputSchema: z.array(todoSchema),
  execute: async ({ done }) => listTodos(done),
});
