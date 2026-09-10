import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { todoSchema } from '../todo/todo.schema';
import { addTodo } from '../todo/todo-store';

export const addTodoTool = createTool({
  id: 'add-todo',
  description: '사용자가 할 일을 추가해 달라고 하면 호출한다.',
  inputSchema: z.object({
    title: z.string().min(1).describe('사용자가 말한 할 일을 그대로'),
  }),
  outputSchema: todoSchema,
  execute: async ({ title }) => addTodo(title),
});
