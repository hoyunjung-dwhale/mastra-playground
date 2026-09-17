import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { ownerIdOf, todoAgentRequestContextSchema } from '../agents/todo-agent.context';
import { todoSchema } from '../todo/todo.schema';
import { addTodo } from '../todo/todo-store';

export const addTodoTool = createTool({
  id: 'add-todo',
  description: '사용자가 할 일을 추가해 달라고 하면 호출한다.',
  inputSchema: z.object({
    title: z.string().min(1).describe('사용자가 말한 할 일을 그대로'),
  }),
  // 소유자는 입력 스키마에 두지 않는다. 모델이 정하면 남의 목록에 쓸 수 있다.
  requestContextSchema: todoAgentRequestContextSchema,
  outputSchema: todoSchema,
  execute: async ({ title }, context) => addTodo(ownerIdOf(context), title),
});
